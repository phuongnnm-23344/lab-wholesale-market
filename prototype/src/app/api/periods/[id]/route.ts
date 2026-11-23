import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { apiError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { incentiveActionSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// GET /api/periods/[id] — SC-09-03 payables / 完納 + SC-09-04 recorded incentive rows (MAIN / DELTA).
export async function GET(_request: Request, ctx: RouteContext<"/api/periods/[id]">) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const sb = auth.supabase;
  const { data: period, error } = await sb.from("payment_periods").select("id, period_code, start_date, end_date, due_date, status").eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!period) return apiError(404, "NOT_FOUND", "対象が見つかりません");
  const [payables, results, version, run] = await Promise.all([
    sb.rpc("period_payables", { p_period_id: id }),
    sb.from("incentive_results").select("id, kind, ref_period_id, payable_jpy, paid_jpy, kanno, incentive_jpy, rule_version_id, participants(buyer_no, name), payment_periods!incentive_results_ref_period_id_fkey(period_code)").eq("period_id", id).order("kind"),
    sb.rpc("active_rule_version_on", { p_day: period.end_date }),
    sb.from("incentive_runs").select("run_at").eq("period_id", id).maybeSingle(),
  ]);
  const failed = [payables, results].find((r) => r.error);
  if (failed?.error) return mapRpcError(failed.error);
  const { data: rule } = await sb.from("rule_versions").select("version_no").eq("id", version.data ?? "").maybeSingle();
  return NextResponse.json({ period, payables: payables.data ?? [], results: results.data ?? [], ruleVersionNo: rule?.version_no ?? null, runAt: run.data?.run_at ?? null, me: auth.user });
}

// POST /api/periods/[id] — {action: preview | run | lock}. preview writes nothing; run once per open period;
// lock requires the run and opens the next period. run / lock = 照合部門長 only (checked in the RPC).
export async function POST(request: Request, ctx: RouteContext<"/api/periods/[id]">) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, incentiveActionSchema);
  if (!body.ok) return body.response;
  const fn = { preview: "preview_incentives", run: "run_incentive_calc", lock: "lock_period" }[body.data.action];
  const { data, error } = await auth.supabase.rpc(fn, { p_period_id: id });
  if (error) return mapRpcError(error);
  return NextResponse.json({ action: body.data.action, result: data });
}
