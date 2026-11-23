"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format/display-format";
import { LOT_STATUS_TONES } from "@/lib/lots/lot-types";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type LotDetail = {
  lot: { lot_no: string; business_date: string; shipper_name: string; species: string; unit: string; status: string; provisional_by: string | null; registered_by: string | null };
  availableQty: number;
  ledger: { id: string; qty_delta: number; reason: string; created_by: string | null; created_at: string }[];
  inspections: { id: string; grade: string; freshness_note: string | null; inspected_by: string | null; created_at: string }[];
  staff: Record<string, string>;
};

// ロット詳細（数量台帳）: append-only ledger (残数量 = 合計), 目利き history with the person's name.
export default function LotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<LotDetail>(`/api/lots/${id}`);
  const back = <Link href="/lots" className="button-secondary">一覧へ戻る</Link>;
  if (error) return <><PageHeader title="ロット詳細" actions={back} /><ErrorAlert message={error} /></>;
  if (!data) return <><PageHeader title="ロット詳細" actions={back} /><LoadingState /></>;
  const { lot, staff } = data;
  const who = (uid: string | null) => (uid ? staff[uid] ?? "—" : "—");

  return (
    <>
      <PageHeader title="ロット詳細" actions={back} />
      <table className="detail-table">
        <tbody>
          <tr><th>ロット番号</th><td>{lot.lot_no}　<StatusBadge tone={LOT_STATUS_TONES[lot.status]}>{LOT_STATUS_LABELS[lot.status] ?? lot.status}</StatusBadge></td></tr>
          <tr><th>業務日</th><td>{formatDate(lot.business_date)}</td></tr>
          <tr><th>出荷者／品目</th><td>{lot.shipper_name} ／ {lot.species}</td></tr>
          <tr><th>残数量</th><td><strong>{formatNumber(data.availableQty)} {lot.unit}</strong></td></tr>
          <tr><th>仮受付／本登録</th><td>{who(lot.provisional_by)} ／ {who(lot.registered_by)}</td></tr>
        </tbody>
      </table>
      <h2>数量台帳</h2>
      <p className="muted" style={{ fontSize: 13 }}>記録は追記のみで、修正・削除はできません。</p>
      <table>
        <thead><tr><th>日時</th><th className="num">増減</th><th>理由</th><th>記録者</th></tr></thead>
        <tbody>{data.ledger.map((r) => (
          <tr key={r.id}><td>{formatDateTime(r.created_at)}</td><td className="num">{r.qty_delta > 0 ? `+${formatNumber(r.qty_delta)}` : formatNumber(r.qty_delta)}</td><td>{r.reason}</td><td>{who(r.created_by)}</td></tr>
        ))}</tbody>
      </table>
      <h2>目利き・下見の記録</h2>
      {data.inspections.length === 0 ? <EmptyState text="記録はありません。" /> : (
        <table>
          <thead><tr><th>日時</th><th>等級</th><th>所見</th><th>記録者</th></tr></thead>
          <tbody>{data.inspections.map((i) => (
            <tr key={i.id}><td>{formatDateTime(i.created_at)}</td><td>{i.grade}</td><td>{i.freshness_note ?? ""}</td><td>{who(i.inspected_by)}</td></tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}
