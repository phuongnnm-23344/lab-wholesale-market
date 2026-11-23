// Shared helpers for phase 04+ verify scripts: signed-in demo clients and id lookups on sample data.
// Demo accounts are used only for business actions on fictional data — never for account changes.

import type { SupabaseClient } from "@supabase/supabase-js";
import { signedInClient } from "./security-check-runner";
import { requireEnv } from "./script-supabase-clients";

export const demoClient = (localPart: string) =>
  signedInClient(`${localPart}@sakura-demo.example`, requireEnv("DEMO_ACCOUNT_PASSWORD"));

export async function participantId(admin: SupabaseClient, buyerNo: string): Promise<string> {
  const { data } = await admin.from("participants").select("id").eq("buyer_no", buyerNo).single();
  if (!data) throw new Error(`sample participant ${buyerNo} not found (run npm run demo:reset)`);
  return data.id as string;
}

export async function availableQty(admin: SupabaseClient, lotId: string): Promise<number> {
  const { data } = await admin.from("v_lot_available_qty").select("available_qty").eq("lot_id", lotId).single();
  return Number(data?.available_qty ?? 0);
}

// Today's seeded lot by its position (L<today>-1..6). 5 and 6 are PUBLISHED, 4 INSPECTED, 3 RECEIVED.
export async function todayLot(admin: SupabaseClient, position: number): Promise<string> {
  const { data: day } = await admin.rpc("current_business_date");
  const lotNo = `L${String(day).replaceAll("-", "")}-${position}`;
  const { data } = await admin.from("lots").select("id").eq("lot_no", lotNo).single();
  if (!data) throw new Error(`seed lot ${lotNo} not found`);
  return data.id as string;
}

export async function currentDay(admin: SupabaseClient): Promise<string> {
  const { data } = await admin.rpc("current_business_date");
  return String(data);
}

export const compactDate = (iso: string) => iso.replaceAll("-", "");
export const previousDay = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

export type TradeRow = { id: string; trade_no: string; buyer_id: string; qty: number; unit_price_jpy: number; amount_jpy: number; updated_at: string; business_date: string };

export async function tradeByNo(admin: SupabaseClient, tradeNo: string): Promise<TradeRow> {
  const { data } = await admin.from("trades").select("id, trade_no, buyer_id, qty, unit_price_jpy, amount_jpy, updated_at, business_date").eq("trade_no", tradeNo).single();
  if (!data) throw new Error(`seed trade ${tradeNo} not found`);
  return data as TradeRow;
}

// Sum of v_daily_settlement amounts for a day (optionally one buyer).
export async function settlementTotal(admin: SupabaseClient, day: string, buyerId?: string): Promise<number> {
  let q = admin.from("v_daily_settlement").select("amount_total_jpy").eq("business_date", day);
  if (buyerId) q = q.eq("buyer_id", buyerId);
  const { data } = await q;
  return (data ?? []).reduce((s, r) => s + Number(r.amount_total_jpy), 0);
}

export async function resetDemoData(admin: SupabaseClient): Promise<void> {
  const { error } = await admin.rpc("reset_demo_business_data");
  if (error) throw new Error(`reset_demo_business_data failed: ${error.message}`);
}
