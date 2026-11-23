"use client";

import Link from "next/link";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { CORRECTION_STATUS_LABELS } from "@/lib/corrections/correction-status-labels";

type Row = {
  id: string; status: string; reason: string; requested_by: string | null; created_at: string;
  change: { before: { amount_jpy: number }; after: { amount_jpy: number } };
  trades: { trade_no: string; business_date: string } | null;
};

// SC-08-02 修正申請一覧: filter by status; approvers open an item to decide.
export default function CorrectionListPage() {
  const [status, setStatus] = useState("");
  const { data, error } = useApiResource<{ corrections: Row[]; staff: Record<string, string> }>(`/api/corrections${status ? `?status=${status}` : ""}`);

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>修正申請一覧</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="状態">
        <option value="">すべて</option>
        {Object.entries(CORRECTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead><tr><th align="left">申請日時</th><th align="left">取引</th><th align="right">差額</th><th align="left">理由</th><th align="left">申請者</th><th align="left">状態</th></tr></thead>
        <tbody>{(data?.corrections ?? []).map((c) => (
          <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
            <td><Link href={`/corrections/${c.id}`}>{new Date(c.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</Link></td>
            <td>{c.trades?.trade_no}（{c.trades?.business_date}）</td>
            <td align="right">{(Number(c.change.after.amount_jpy) - Number(c.change.before.amount_jpy)).toLocaleString("ja-JP")}</td>
            <td>{c.reason}</td><td>{c.requested_by ? data?.staff[c.requested_by] : "—"}</td>
            <td>{CORRECTION_STATUS_LABELS[c.status] ?? c.status}</td>
          </tr>
        ))}</tbody>
      </table>
      <ScreenIdFooter screenId="SC-08-02" trace="FT-08-02 / FR-NOTIFY-03（通知は試作対象外）" />
    </section>
  );
}
