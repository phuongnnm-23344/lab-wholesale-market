import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { dailySettlementBreakdown } from "@/lib/settlement/daily-settlement-breakdown";

export const dynamic = "force-dynamic";

// GET /api/settlement/daily?date= — SC-07-01 日次照合表: totals per buyer of EACH line (originals and
// REVERSE / DELTA with their own buyer — M4), plus the 要確認 list.
export async function GET(request: Request) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const date = new URL(request.url).searchParams.get("date") ?? auth.user.businessDate;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ rows: [] });
  const sb = auth.supabase;

  const [rows, buyers, sessions, checklist, day, split] = await Promise.all([
    sb.from("v_daily_settlement").select("buyer_id, trade_count, qty_total, amount_total_jpy").eq("business_date", date),
    sb.from("participants").select("id, name, buyer_no"),
    sb.from("seri_sessions").select("id, session_no, status, same_person_reason").eq("business_date", date),
    sb.rpc("day_close_checklist", { p_day: date }),
    sb.from("business_days").select("status").eq("business_date", date).maybeSingle(),
    dailySettlementBreakdown(sb, date),
  ]);
  const failed = [rows, buyers, sessions, checklist].find((r) => r.error);
  if (failed?.error) return mapRpcError(failed.error);
  if (split.error) return mapRpcError(split.error);
  const names = new Map((buyers.data ?? []).map((b) => [b.id, b]));
  const settlement = (rows.data ?? [])
    .map((r) => ({ ...r, ...split.byBuyer.get(r.buyer_id), buyer_no: names.get(r.buyer_id)?.buyer_no ?? "—", name: names.get(r.buyer_id)?.name ?? "—" }))
    .sort((a, b) => String(a.buyer_no).localeCompare(String(b.buyer_no)));
  return NextResponse.json({
    date,
    dayStatus: day.data?.status ?? null,
    rows: settlement,
    totalJpy: settlement.reduce((s, r) => s + Number(r.amount_total_jpy), 0),
    checklist: checklist.data,
    seriToReview: (sessions.data ?? []).filter((s) => s.status === "ENTERING" || s.same_person_reason),
  });
}
