// Independent re-computation (in TypeScript, from raw rows) of the simplified incentive rules, used as the
// test vector for verify:phase09. Rules: payable = floor(amount × 110 / 100); 完納 = paid ≤ 期日 ≥ payable;
// incentive = floor(payable × ‰ / 1000) of the band containing the payable; not 完納 → 0.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Period = { id: string; period_code: string; start_date: string; end_date: string; due_date: string; status: string };

export async function periods(admin: SupabaseClient): Promise<Period[]> {
  return ((await admin.from("payment_periods").select("id, period_code, start_date, end_date, due_date, status").order("start_date")).data ?? []) as Period[];
}

// Amount per buyer of a period: original trades of the period + their adjustments (attributed to the trade date).
export async function periodAmounts(admin: SupabaseClient, p: Period): Promise<Map<string, number>> {
  const { data: trades } = await admin.from("trades").select("id, buyer_id, amount_jpy").eq("status", "CONFIRMED").gte("business_date", p.start_date).lte("business_date", p.end_date);
  const ids = (trades ?? []).map((t) => t.id);
  const { data: adj } = ids.length ? await admin.from("trade_adjustments").select("buyer_id, amount_delta_jpy, trade_id").in("trade_id", ids) : { data: [] };
  const m = new Map<string, number>();
  for (const t of trades ?? []) m.set(t.buyer_id, (m.get(t.buyer_id) ?? 0) + Number(t.amount_jpy));
  for (const a of adj ?? []) m.set(a.buyer_id, (m.get(a.buyer_id) ?? 0) + Number(a.amount_delta_jpy));
  return m;
}

export async function paidOnTime(admin: SupabaseClient, p: Period): Promise<Map<string, number>> {
  const windowEnd = new Date(Date.parse(`${p.end_date}T00:00:00Z`));
  windowEnd.setUTCMonth(windowEnd.getUTCMonth() + 1);
  const { data } = await admin.from("payments").select("participant_id, paid_on, amount_jpy").gt("paid_on", p.end_date).lte("paid_on", windowEnd.toISOString().slice(0, 10));
  const m = new Map<string, number>();
  for (const x of data ?? []) if (x.paid_on <= p.due_date) m.set(x.participant_id, (m.get(x.participant_id) ?? 0) + Number(x.amount_jpy));
  return m;
}

export async function incentiveFor(admin: SupabaseClient, payable: number, versionId: string): Promise<number> {
  const { data } = await admin.from("incentive_rate_rows").select("min_paid_jpy, max_paid_jpy, rate_permille").eq("rule_version_id", versionId);
  const band = (data ?? []).find((b) => payable >= Number(b.min_paid_jpy) && (b.max_paid_jpy === null || payable < Number(b.max_paid_jpy)));
  return band ? Math.floor((payable * band.rate_permille) / 1000) : 0;
}

export const payableOf = (amount: number) => Math.floor((amount * 110) / 100);
