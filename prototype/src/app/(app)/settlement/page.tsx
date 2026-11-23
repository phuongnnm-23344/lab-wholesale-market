"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatNumber, formatYen } from "@/lib/format/display-format";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";

// 日次照合表: per-buyer totals incl. correction lines (取消 / 差額 with their own buyer),
// and the 要確認 tab (unconfirmed せり, せり confirmed by the entry person, undelivered trades).
export default function DailySettlementPage() {
  const [date, setDate] = useState("");
  const [tab, setTab] = useState<"sum" | "check">("sum");
  const { data, error } = useApiResource<DailySettlement>(`/api/settlement/daily${date ? `?date=${date}` : ""}`);
  const rows = data?.rows ?? [];
  const c = data?.checklist;
  const tabButton = (key: "sum" | "check", label: string) => (
    <button type="button" className={tab === key ? "button-primary" : "button-secondary"} onClick={() => setTab(key)}>{label}</button>
  );

  return (
    <>
      <PageHeader title="日次照合表" actions={<Link href="/settlement/close" className="button-secondary">日次締めへ</Link>} />
      <div className="toolbar">
        <label>業務日 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <span>{formatDate(data?.date)}</span>
        {data && (data.dayStatus === "LOCKED" ? <StatusBadge tone="neutral">締め済</StatusBadge> : <StatusBadge tone="warning">未締め</StatusBadge>)}
        <span style={{ flex: 1 }} />
        {tabButton("sum", "照合表")}{tabButton("check", "要確認")}
      </div>
      <ListStates loading={!data} error={error} empty={false}>
        {tab === "sum" ? (
          rows.length === 0 ? <EmptyState text="この業務日の取引はありません。" /> : (
            <table>
              <thead><tr><th>買受人</th><th className="num">取引件数</th><th className="num">数量</th><th className="num">金額（訂正含む）</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.buyer_id}>
                  <td>{r.buyer_no} {r.name}</td><td className="num">{r.trade_count}</td><td className="num">{formatNumber(r.qty_total)}</td>
                  <td className="num">{formatYen(r.amount_total_jpy)}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr><th colSpan={3}>合計</th><th className="num">{formatYen(data?.totalJpy ?? 0)}</th></tr></tfoot>
            </table>
          )
        ) : (
          <table className="detail-table" style={{ maxWidth: 640 }}>
            <tbody>
              <tr><th>未確定のせり</th><td>{c?.seri_unconfirmed ?? 0} 回</td></tr>
              <tr><th>入力者が確定したせり</th><td>{c?.seri_same_person ?? 0} 回
                {(data?.seriToReview ?? []).filter((s) => s.same_person_reason).map((s) => <div key={s.id} className="muted">第{s.session_no}回：{s.same_person_reason}</div>)}
              </td></tr>
              <tr><th>引渡し未完了の取引</th><td>{c?.undelivered_trades ?? 0} 件</td></tr>
              <tr><th>本登録待ちの仮受付ロット</th><td>{c?.provisional_lots ?? 0} 件</td></tr>
            </tbody>
          </table>
        )}
      </ListStates>
    </>
  );
}
