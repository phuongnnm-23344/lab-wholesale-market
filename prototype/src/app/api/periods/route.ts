import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";

export const dynamic = "force-dynamic";

// GET /api/periods — payment periods (monthly) with run / lock state (SC-09-03 / SC-09-04 entry).
export async function GET() {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const [periods, runs] = await Promise.all([
    auth.supabase.from("payment_periods").select("id, period_code, start_date, end_date, due_date, status").order("start_date", { ascending: false }),
    auth.supabase.from("incentive_runs").select("period_id, run_at"),
  ]);
  if (periods.error) return mapRpcError(periods.error);
  const ran = new Map((runs.data ?? []).map((r) => [r.period_id, r.run_at]));
  return NextResponse.json({ periods: (periods.data ?? []).map((p) => ({ ...p, run_at: ran.get(p.id) ?? null })) });
}
