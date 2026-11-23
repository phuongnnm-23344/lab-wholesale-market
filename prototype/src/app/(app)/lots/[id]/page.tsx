"use client";

import { useParams } from "next/navigation";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

type LotDetail = {
  lot: { lot_no: string; business_date: string; shipper_name: string; species: string; unit: string; status: string; provisional_by: string | null; registered_by: string | null };
  availableQty: number;
  ledger: { id: string; qty_delta: number; reason: string; created_by: string | null; created_at: string }[];
  inspections: { id: string; grade: string; freshness_note: string | null; inspected_by: string | null; created_at: string }[];
  staff: Record<string, string>;
};

const time = (iso: string) => new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

// SC-03-04 ロット詳細（数量台帳）: append-only ledger (available = sum), 目利き history with the person's name.
export default function LotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<LotDetail>(`/api/lots/${id}`);
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!data) return <p>読み込み中…</p>;
  const { lot, staff } = data;
  const who = (uid: string | null) => (uid ? staff[uid] ?? "—" : "—");

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>ロット {lot.lot_no}（{LOT_STATUS_LABELS[lot.status] ?? lot.status}）</h1>
        <p style={{ margin: 0 }}>業務日 {lot.business_date} ・ {lot.shipper_name} ・ {lot.species} ・ 残数量 <strong>{data.availableQty} {lot.unit}</strong></p>
        <p className="muted" style={{ margin: 0 }}>仮受付：{who(lot.provisional_by)} ／ 本登録：{who(lot.registered_by)}</p>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>数量台帳（追記のみ・修正不可）</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th align="left">日時</th><th align="right">増減</th><th align="left">理由</th><th align="left">記録者</th></tr></thead>
          <tbody>{data.ledger.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}><td>{time(r.created_at)}</td><td align="right">{r.qty_delta > 0 ? `+${r.qty_delta}` : r.qty_delta}</td><td>{r.reason}</td><td>{who(r.created_by)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>目利き・下見の記録（人による判断）</h2>
        {data.inspections.length === 0 ? <p className="muted">記録なし</p> : (
          <ul>{data.inspections.map((i) => <li key={i.id}>{time(i.created_at)} 等級 {i.grade} {i.freshness_note ?? ""} — {who(i.inspected_by)}</li>)}</ul>
        )}
      </div>
      <ScreenIdFooter screenId="SC-03-04" trace="FT-03-03, FT-03-04 / FR-LOT-03, BR-LOT-02, CAP-HUMAN-01" />
    </section>
  );
}
