export type PeriodRow = { id: string; period_code: string; start_date: string; end_date: string; due_date: string; status: string; run_at?: string | null };
export type PayableRow = { participant_id: string; buyer_no: string; name: string; payable_jpy: number; paid_on_time_jpy: number; paid_total_jpy: number; kanno: boolean };
export type IncentiveRow = {
  id?: string; kind: string; payable_jpy: number; paid_jpy: number; kanno: boolean; incentive_jpy: number;
  buyer_no?: string; name?: string; participants?: { buyer_no: string; name: string } | null;
  payment_periods?: { period_code: string } | null; ref_period_id?: string | null;
};
export type PeriodDetail = {
  period: PeriodRow; payables: PayableRow[]; results: IncentiveRow[]; ruleVersionNo: number | null; runAt: string | null;
  me: { role: string; authorities: string[] };
};
export { formatYen as yen } from "@/lib/format/display-format";
