"use client";

import Link from "next/link";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";


// SC-07-01 日次照合表: per-buyer totals incl. correction lines (REVERSE / DELTA with their own buyer),
// and the 要確認 tab (unconfirmed せり, せり confirmed by the entry person, undelivered trades).
export default function DailySettlementPage() {
  const [date, setDate] = useState("");
  const [tab, setTab] = useState<"sum" | "check">("sum");
  const { data, error } = useApiResource<DailySettlement>(`/api/settlement/daily${date ? `?date=${date}` : ""}`);

  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>日次照合表（{data?.date ?? "—"}・{data?.dayStatus === "LOCKED" ? "締め済" : "未締め"}）</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="業務日" />
        <button type="button" className="button-secondary" onClick={() => setTab("sum")}>照合表</button>
        <button type="button" className="button-secondary" onClick={() => setTab("check")}>要確認</button>
        <Link href="/settlement/close">日次締めへ</Link>
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
      {tab === "sum" ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th align="left">買受人</th><th align="right">取引件数</th><th align="right">数量</th><th align="right">金額（訂正含む）</th></tr></thead>
          <tbody>{(data?.rows ?? []).map((r) => (
            <tr key={r.buyer_id} style={{ borderTop: "1px solid var(--border)" }}>
              <td>{r.buyer_no} {r.name}</td><td align="right">{r.trade_count}</td><td align="right">{r.qty_total}</td>
              <td align="right">{Number(r.amount_total_jpy).toLocaleString("ja-JP")}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr><td colSpan={3}><strong>合計</strong></td><td align="right"><strong>{Number(data?.totalJpy ?? 0).toLocaleString("ja-JP")} 円</strong></td></tr></tfoot>
        </table>
      ) : (
        <ul>
          <li>未確定のせり：{data?.checklist?.seri_unconfirmed ?? 0}回</li>
          <li>入力者が確定したせり（理由あり）：{data?.checklist?.seri_same_person ?? 0}回
            <ul>{(data?.seriToReview ?? []).filter((s) => s.same_person_reason).map((s) => <li key={s.id}>第{s.session_no}回：{s.same_person_reason}</li>)}</ul>
          </li>
          <li>引渡し未完了の取引：{data?.checklist?.undelivered_trades ?? 0}件</li>
          <li>本登録待ちの仮受付ロット：{data?.checklist?.provisional_lots ?? 0}件</li>
        </ul>
      )}
      <ScreenIdFooter screenId="SC-07-01" trace="FT-07-02, FT-07-03, FT-13-03 / FR-SETTLE-01, FORM-SETTLE-01, RPT-05" />
    </section>
  );
}
