import type { SupabaseClient } from "@supabase/supabase-js";

export type BuyerBreakdown = { aitai_jpy: number; seri_jpy: number; correction_jpy: number; qty_by_unit: Record<string, number> };

type Unit = { lots: { unit: string } | { unit: string }[] | null };
const unitOf = (r: Unit | null | undefined) => {
  const lot = Array.isArray(r?.lots) ? r?.lots[0] : r?.lots;
  return lot?.unit ?? "—";
};

// Read-only split of the 日次照合表 per buyer: 相対 / せり originals and 訂正 (取消・差額) lines,
// and quantity per unit (kg and 箱 must not be added together). Same rows the view totals.
export async function dailySettlementBreakdown(sb: SupabaseClient, date: string) {
  const [trades, adjustments] = await Promise.all([
    sb.from("trades").select("buyer_id, channel, qty, amount_jpy, lots(unit)").eq("business_date", date).eq("status", "CONFIRMED"),
    sb.from("trade_adjustments").select("buyer_id, qty_delta, amount_delta_jpy, trades(lots(unit))").eq("business_date", date),
  ]);
  const error = trades.error ?? adjustments.error;
  const map = new Map<string, BuyerBreakdown>();
  const get = (id: string) => {
    if (!map.has(id)) map.set(id, { aitai_jpy: 0, seri_jpy: 0, correction_jpy: 0, qty_by_unit: {} });
    return map.get(id)!;
  };
  for (const t of trades.data ?? []) {
    const b = get(t.buyer_id);
    if (t.channel === "SERI") b.seri_jpy += Number(t.amount_jpy);
    else b.aitai_jpy += Number(t.amount_jpy);
    const u = unitOf(t as Unit);
    b.qty_by_unit[u] = (b.qty_by_unit[u] ?? 0) + Number(t.qty);
  }
  for (const a of adjustments.data ?? []) {
    const b = get(a.buyer_id);
    b.correction_jpy += Number(a.amount_delta_jpy);
    const trade = Array.isArray(a.trades) ? a.trades[0] : a.trades;
    const u = unitOf(trade as Unit);
    b.qty_by_unit[u] = (b.qty_by_unit[u] ?? 0) + Number(a.qty_delta);
  }
  return { error, byBuyer: map };
}
