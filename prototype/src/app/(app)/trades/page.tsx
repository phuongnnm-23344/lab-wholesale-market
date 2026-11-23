"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatNumber, formatYen } from "@/lib/format/display-format";
import { CHANNEL_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type TradeListRow = {
  id: string; trade_no: string; channel: string; qty: number; unit_price_jpy: number; amount_jpy: number;
  status: string; lots: { lot_no: string; species: string; unit: string } | null;
  participants: { name: string; buyer_no: string } | null;
};

// 取引一覧・検索. Default filter = 相対 (rule 1: 相対取引 is the main flow).
export default function TradeListPage() {
  const [channel, setChannel] = useState("AITAI");
  const [date, setDate] = useState("");
  const query = new URLSearchParams({ channel, ...(date && { date }) });
  const { data, error } = useApiResource<{ date: string; trades: TradeListRow[] }>(`/api/trades?${query}`);
  const rows = data?.trades ?? [];
  const total = rows.reduce((s, t) => s + (t.status === "CONFIRMED" ? Number(t.amount_jpy) : 0), 0);

  return (
    <>
      <PageHeader title="取引一覧" actions={<Link href="/trades/new" className="button-primary">相対取引入力</Link>} />
      <div className="toolbar">
        <label>取引種別{" "}
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="AITAI">相対</option><option value="SERI">せり</option><option value="ALL">すべて</option>
          </select>
        </label>
        <label>業務日 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <span className="muted">表示中の業務日：{formatDate(data?.date)}</span>
      </div>
      <ListStates loading={!data} error={error} empty={rows.length === 0} emptyText="この条件の取引はありません。">
        <table>
          <thead><tr><th>取引番号</th><th>種別</th><th>ロット</th><th>買受人</th><th className="num">数量</th><th className="num">単価</th><th className="num">金額</th><th>状態</th></tr></thead>
          <tbody>{rows.map((t) => (
            <tr key={t.id}>
              <td><Link href={`/trades/${t.id}`}>{t.trade_no}</Link></td><td>{CHANNEL_LABELS[t.channel]}</td>
              <td>{t.lots?.lot_no} {t.lots?.species}</td><td>{t.participants?.buyer_no} {t.participants?.name}</td>
              <td className="num">{formatNumber(t.qty)} {t.lots?.unit}</td><td className="num">{formatYen(t.unit_price_jpy)}</td>
              <td className="num">{formatYen(t.amount_jpy)}</td>
              <td>{t.status === "CONFIRMED" ? <StatusBadge tone="success">確定</StatusBadge> : <StatusBadge tone="warning">せり確認待ち</StatusBadge>}</td>
            </tr>
          ))}</tbody>
        </table>
        <div className="summary-row"><span>{rows.length} 件</span><span>確定合計 <strong>{formatYen(total)}</strong></span></div>
      </ListStates>
    </>
  );
}
