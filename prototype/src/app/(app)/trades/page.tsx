"use client";

import Link from "next/link";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { CHANNEL_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type TradeListRow = {
  id: string; trade_no: string; channel: string; qty: number; unit_price_jpy: number; amount_jpy: number;
  status: string; lots: { lot_no: string; species: string; unit: string } | null;
  participants: { name: string; buyer_no: string } | null;
};

// SC-04-03 取引一覧・検索. Default filter = 相対 (rule 1: 相対取引 is the main flow).
export default function TradeListPage() {
  const [channel, setChannel] = useState("AITAI");
  const [date, setDate] = useState("");
  const query = new URLSearchParams({ channel, ...(date && { date }) });
  const { data, error } = useApiResource<{ date: string; trades: TradeListRow[] }>(`/api/trades?${query}`);
  const rows = data?.trades ?? [];
  const total = rows.reduce((s, t) => s + (t.status === "CONFIRMED" ? Number(t.amount_jpy) : 0), 0);

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>取引一覧（業務日 {data?.date ?? "—"}）</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="取引種別">
          <option value="AITAI">相対</option><option value="SERI">せり</option><option value="ALL">すべて</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="業務日" />
        <Link href="/trades/new" className="button-secondary">相対取引入力</Link>
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead><tr><th align="left">取引番号</th><th align="left">種別</th><th align="left">ロット</th><th align="left">買受人</th><th align="right">数量</th><th align="right">単価</th><th align="right">金額</th><th align="left">状態</th></tr></thead>
        <tbody>{rows.map((t) => (
          <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
            <td><Link href={`/trades/${t.id}`}>{t.trade_no}</Link></td><td>{CHANNEL_LABELS[t.channel]}</td>
            <td>{t.lots?.lot_no} {t.lots?.species}</td><td>{t.participants?.buyer_no} {t.participants?.name}</td>
            <td align="right">{t.qty}</td><td align="right">{Number(t.unit_price_jpy).toLocaleString("ja-JP")}</td>
            <td align="right">{Number(t.amount_jpy).toLocaleString("ja-JP")}</td><td>{t.status === "CONFIRMED" ? "確定" : "仮（せり確認待ち）"}</td>
          </tr>
        ))}</tbody>
      </table>
      <p>確定合計：<strong>{total.toLocaleString("ja-JP")} 円</strong>（{rows.length}件）</p>
      <ScreenIdFooter screenId="SC-04-03" trace="FT-04-09 / NFR-PERF-01" />
    </section>
  );
}
