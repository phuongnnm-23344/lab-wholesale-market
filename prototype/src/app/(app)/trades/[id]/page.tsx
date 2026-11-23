"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatDateTime, formatNumber, formatYen } from "@/lib/format/display-format";
import { CHANNEL_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type TradeDetail = {
  trade: { trade_no: string; business_date: string; channel: string; qty: number; unit_price_jpy: number; amount_jpy: number; status: string; over_limit_reason: string | null; created_by: string | null; confirmed_by: string | null; confirmed_at: string | null; lots: { lot_no: string; species: string; unit: string; shipper_name: string } | null; participants: { name: string; buyer_no: string } | null };
  adjustments: { id: string; kind: string; qty_delta: number; amount_delta_jpy: number; business_date: string; participants: { name: string; buyer_no: string } | null }[];
  deliveries: { id: string; qty_delivered: number; recorded_by: string | null; created_at: string }[];
  ruleVersion: { version_no: number; effective_from: string } | null;
  staff: Record<string, string>;
};

// 取引詳細（取引確認票・訂正履歴）. The original row is never overwritten; corrections appear
// as 取消 / 差額 rows. Printing to the dock printer is not part of the prototype.
export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<TradeDetail>(`/api/trades/${id}`);
  const me = useCurrentUser();
  const user = me.status === "ready" ? me.user : null;
  const canEnter = user?.role === "TRADE";
  const canRequestFix = Boolean(user && (["TRADE", "DELIVERY", "SETTLE"].includes(user.role) || user.authorities.some((a) => a === "STL_HEAD" || a === "OPS_HEAD")));
  if (error) return <><PageHeader title="取引確認票" /><ErrorAlert message={error} /></>;
  if (!data) return <><PageHeader title="取引確認票" /><LoadingState /></>;
  const { trade: t, staff } = data;
  const who = (uid: string | null) => (uid ? staff[uid] ?? "—" : "—");
  // After confirming, the next natural step is the next entry — 修正申請 stays a quiet, separate link.
  const actions = (
    <>
      <Link href="/trades" className="button-secondary">一覧へ戻る</Link>
      {canEnter && <Link href="/trades/new" className="button-primary">続けて入力</Link>}
    </>
  );

  return (
    <>
      <PageHeader title="取引確認票" actions={actions} />
      <table className="detail-table">
        <tbody>
          <tr><th>取引番号</th><td>{t.trade_no}　<StatusBadge tone="info">{CHANNEL_LABELS[t.channel]}</StatusBadge> {t.status === "CONFIRMED" ? <StatusBadge tone="success">確定</StatusBadge> : <StatusBadge tone="warning">仮</StatusBadge>}</td></tr>
          <tr><th>業務日</th><td>{formatDate(t.business_date)}</td></tr>
          <tr><th>ロット</th><td>{t.lots?.lot_no} {t.lots?.species}（{t.lots?.shipper_name}）</td></tr>
          <tr><th>買受人</th><td>{t.participants?.buyer_no} {t.participants?.name}</td></tr>
          <tr><th>数量 × 単価</th><td>{formatNumber(t.qty)} {t.lots?.unit} × {formatYen(t.unit_price_jpy)}</td></tr>
          <tr><th>金額（税抜）</th><td><strong>{formatYen(t.amount_jpy)}</strong></td></tr>
          <tr><th>入力者／確定者</th><td>{who(t.created_by)} ／ {who(t.confirmed_by)}（{formatDateTime(t.confirmed_at)}）</td></tr>
          {t.over_limit_reason && <tr><th>参加上限超過の理由</th><td>{t.over_limit_reason}</td></tr>}
          <tr><th>適用規則版</th><td>{data.ruleVersion ? `第${data.ruleVersion.version_no}版（${formatDate(data.ruleVersion.effective_from)}〜）` : "—"}</td></tr>
        </tbody>
      </table>

      <h2>訂正履歴（取消・差額）</h2>
      {t.status === "CONFIRMED" && canRequestFix && (
        <p style={{ fontSize: 13 }}>内容に誤りがある場合：<Link href={`/corrections/new?tradeId=${id}`}>この取引の修正申請を作成する</Link>（承認後に取消・差額として記録されます）</p>
      )}
      {data.adjustments.length === 0 ? <EmptyState text="訂正はありません。" /> : (
        <table>
          <thead><tr><th>計上日</th><th>区分</th><th>買受人</th><th className="num">数量</th><th className="num">金額</th></tr></thead>
          <tbody>{data.adjustments.map((a) => (
            <tr key={a.id}>
              <td>{formatDate(a.business_date)}</td>
              <td>{a.kind === "REVERSE" ? <StatusBadge tone="danger">取消</StatusBadge> : <StatusBadge tone="info">差額</StatusBadge>}</td>
              <td>{a.participants?.buyer_no} {a.participants?.name}</td>
              <td className="num">{formatNumber(a.qty_delta)}</td><td className="num">{formatYen(a.amount_delta_jpy)}</td>
            </tr>
          ))}</tbody>
        </table>
      )}

      <h2>引渡し</h2>
      {data.deliveries.length === 0 ? <EmptyState text="まだ引き渡されていません。" /> : (
        <table>
          <thead><tr><th>記録日時</th><th className="num">数量</th><th>記録者</th></tr></thead>
          <tbody>{data.deliveries.map((d) => (
            <tr key={d.id}><td>{formatDateTime(d.created_at)}</td><td className="num">{formatNumber(d.qty_delivered)}</td><td>{who(d.recorded_by)}</td></tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}
