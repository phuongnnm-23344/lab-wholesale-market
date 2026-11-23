import type { BuyerBreakdown } from "./daily-settlement-breakdown";

// Response of GET /api/settlement/daily (SC-07-01 / SC-07-02).
export type DailySettlement = {
  date: string; dayStatus: string | null; totalJpy: number;
  rows: ({ buyer_id: string; buyer_no: string; name: string; trade_count: number; qty_total: number; amount_total_jpy: number } & Partial<BuyerBreakdown>)[];
  checklist: { seri_unconfirmed: number; seri_same_person: number; provisional_lots: number; undelivered_trades: number } | null;
  seriToReview: { id: string; session_no: number; status: string; same_person_reason: string | null }[];
};
