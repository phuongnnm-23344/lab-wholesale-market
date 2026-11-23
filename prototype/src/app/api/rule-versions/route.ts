import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";
import { ruleVersionCreateSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// GET /api/rule-versions — SC-10-01: all versions, the one applied today (適用中, n3), quota x/4 per
// fiscal year of the effective date (PRM-042).
export async function GET() {
  const auth = await requireRole(["RULE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const sb = auth.supabase;
  const today = auth.user.businessDate;
  const [versions, applied] = await Promise.all([
    sb.from("rule_versions").select("id, version_no, effective_from, status, note, maker_id, checker_id, approved_at, rollback_of, replaced_version_id").order("version_no", { ascending: false }),
    sb.rpc("active_rule_version_on", { p_day: today }),
  ]);
  if (versions.error) return mapRpcError(versions.error);
  const fyStarts = [...new Set((versions.data ?? []).map((v) => fiscalYearStart(v.effective_from)))];
  const quota = Object.fromEntries(await Promise.all(fyStarts.map(async (fy) => {
    const { data } = await sb.rpc("rule_version_quota_used", { p_day: fy });
    return [fy, Number(data ?? 0)] as const;
  })));
  const staff = await lookupStaffNames(sb, (versions.data ?? []).flatMap((v) => [v.maker_id, v.checker_id]));
  return NextResponse.json({ versions: versions.data ?? [], appliedVersionId: applied.data, today, quota, staff, me: auth.user });
}

// POST /api/rule-versions — SC-10-02 起票 (ルール管理者). rollbackSourceId = copy an approved version's rates.
export async function POST(request: Request) {
  const auth = await requireRole(["RULE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, ruleVersionCreateSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("create_rule_version", {
    p_effective_from: body.data.effectiveFrom, p_note: body.data.note, p_rollback_source: body.data.rollbackSourceId ?? null,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}

function fiscalYearStart(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  return `${m >= 4 ? y : y - 1}-04-01`;
}
