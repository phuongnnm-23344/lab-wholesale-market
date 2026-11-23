import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { apiError, isUuid, notFound } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";
import { rateRowsSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

const RATE_COLUMNS = "min_paid_jpy, max_paid_jpy, rate_permille";

// GET /api/rule-versions/[id] — version + its rate bands + the bands applied today (for comparison, SC-10-04).
export async function GET(_request: Request, ctx: RouteContext<"/api/rule-versions/[id]">) {
  const auth = await requireRole(["RULE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const sb = auth.supabase;
  const { data: version, error } = await sb.from("rule_versions")
    .select("id, version_no, effective_from, status, note, maker_id, checker_id, approved_at, rollback_of").eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!version) return apiError(404, "NOT_FOUND", "対象が見つかりません");
  const { data: appliedId } = await sb.rpc("active_rule_version_on", { p_day: auth.user.businessDate });
  const [rates, appliedRates, applied] = await Promise.all([
    sb.from("incentive_rate_rows").select(RATE_COLUMNS).eq("rule_version_id", id).order("min_paid_jpy"),
    sb.from("incentive_rate_rows").select(RATE_COLUMNS).eq("rule_version_id", appliedId ?? "").order("min_paid_jpy"),
    sb.from("rule_versions").select("version_no").eq("id", appliedId ?? "").maybeSingle(),
  ]);
  const staff = await lookupStaffNames(sb, [version.maker_id, version.checker_id]);
  return NextResponse.json({
    version, rates: rates.data ?? [], applied: { versionNo: applied.data?.version_no ?? null, rates: appliedRates.data ?? [] },
    staff, me: auth.user,
  });
}

// PUT /api/rule-versions/[id] — SC-10-03 save rate bands (DRAFT only; contiguity checked in the DB).
export async function PUT(request: Request, ctx: RouteContext<"/api/rule-versions/[id]">) {
  const auth = await requireRole(["RULE"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, rateRowsSchema);
  if (!body.ok) return body.response;
  const { error } = await auth.supabase.rpc("save_rate_rows", { p_version_id: id, p_rows: body.data.rows });
  if (error) return mapRpcError(error);
  return NextResponse.json({ saved: body.data.rows.length });
}
