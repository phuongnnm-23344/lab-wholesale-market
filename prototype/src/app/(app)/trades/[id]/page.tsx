"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { CHANNEL_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type TradeDetail = {
  trade: { trade_no: string; business_date: string; channel: string; qty: number; unit_price_jpy: number; amount_jpy: number; status: string; over_limit_reason: string | null; created_by: string | null; confirmed_by: string | null; confirmed_at: string | null; lots: { lot_no: string; species: string; unit: string; shipper_name: string } | null; participants: { name: string; buyer_no: string } | null };
  adjustments: { id: string; kind: string; qty_delta: number; amount_delta_jpy: number; business_date: string; participants: { name: string; buyer_no: string } | null }[];
  deliveries: { id: string; qty_delivered: number; recorded_by: string | null; created_at: string }[];
  ruleVersion: { version_no: number; effective_from: string } | null;
  staff: Record<string, string>;
};
const yen = (n: number) => `${Number(n).toLocaleString("ja-JP")} 円`;

// SC-04-04 取引詳細（訂正履歴・取引確認票）. The original row is never overwritten; corrections appear
// as REVERSE / DELTA rows (phase 07). Printing to the dock printer is mock M05.
export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<TradeDetail>(`/api/trades/${id}`);
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!data) return <p>読み込み中…</p>;
  const { trade: t, staff } = data;
  const who = (uid: string | null) => (uid ? staff[uid] ?? "—" : "—");

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>取引確認票 {t.trade_no}（{CHANNEL_LABELS[t.channel]}・{t.status === "CONFIRMED" ? "確定" : "仮"}）</h1>
        <p style={{ margin: 0 }}>業務日 {t.business_date} ・ ロット {t.lots?.lot_no} {t.lots?.species}（{t.lots?.shipper_name}）</p>
        <p style={{ margin: 0 }}>買受人 {t.participants?.buyer_no} {t.participants?.name} ・ 数量 {t.qty}{t.lots?.unit} × {yen(t.unit_price_jpy)} = <strong>{yen(t.amount_jpy)}</strong></p>
        <p className="muted" style={{ margin: 0 }}>入力：{who(t.created_by)} ／ 確定：{who(t.confirmed_by)} {t.confirmed_at ? new Date(t.confirmed_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : ""}</p>
        {t.over_limit_reason && <p style={{ margin: 0 }}>参加上限超過の理由：{t.over_limit_reason}</p>}
        <p className="muted" style={{ margin: 0 }}>適用規則版：{data.ruleVersion ? `第${data.ruleVersion.version_no}版（${data.ruleVersion.effective_from}〜）` : "—"} ・ 現場プリンタ印刷は試作対象外</p>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>訂正履歴（取消・差額行）</h2>
        {t.status === "CONFIRMED" && <p style={{ margin: 0 }}><Link href={`/corrections/new?tradeId=${id}`}>この取引の修正申請を作成</Link></p>}
        {data.adjustments.length === 0 ? <p className="muted">訂正なし</p> : (
          <ul>{data.adjustments.map((a) => <li key={a.id}>{a.business_date} {a.kind === "REVERSE" ? "取消" : "差額"} {a.participants?.buyer_no} 数量 {a.qty_delta} 金額 {yen(a.amount_delta_jpy)}</li>)}</ul>
        )}
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>引渡し</h2>
        {data.deliveries.length === 0 ? <p className="muted">未引渡し</p> : (
          <ul>{data.deliveries.map((d) => <li key={d.id}>{new Date(d.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} 数量 {d.qty_delivered} — {who(d.recorded_by)}</li>)}</ul>
        )}
      </div>
      <ScreenIdFooter screenId="SC-04-04" trace="FT-04-09, FT-05-03, FT-06-06, FT-13-03 / FR-AUDIT-03, FR-CORR-02" />
    </section>
  );
}
