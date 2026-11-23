"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import { CORRECTION_STATUS_LABELS } from "@/lib/corrections/correction-status-labels";

type Side = { qty: number; unit_price_jpy: number; buyer_id: string; amount_jpy: number };
type Detail = {
  correction: { status: string; reason: string; reject_reason: string | null; requested_by: string | null; approver1: string | null; approver2: string | null; target_trade_id: string; change: { before: Side; after: Side }; trades: { trade_no: string; business_date: string } | null };
  buyers: Record<string, string>; adjustments: { id: string; kind: string; qty_delta: number; amount_delta_jpy: number; business_date: string; buyer_id: string }[];
  staff: Record<string, string>; me: CurrentUser;
};

// SC-08-03 修正申請承認・却下: before / after side by side; approve (MFA = mock M02) or reject with reason.
export default function CorrectionDecisionPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, reload } = useApiResource<Detail>(`/api/corrections/${id}`);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!data) return <p>読み込み中…</p>;
  const { correction: c, buyers, staff, me } = data;
  const pending = c.status === "SUBMITTED" || c.status === "FIRST_APPROVED";
  const canDecide = pending && (me.authorities.includes("STL_HEAD") || me.authorities.includes("OPS_HEAD"));

  async function act(kind: "approve" | "reject") {
    const res = await apiRequest<{ status: string }>(`/api/corrections/${id}/${kind}`, { method: "POST", body: kind === "reject" ? { reason: rejectReason } : {} });
    setMessage(res.ok ? { error: false, text: `処理しました：${CORRECTION_STATUS_LABELS[res.data.status] ?? res.data.status}` } : { error: true, text: res.message });
    if (res.ok) reload();
  }
  const row = (label: string, s: Side) => (
    <tr><td>{label}</td><td>{buyers[s.buyer_id]}</td><td align="right">{s.qty}</td><td align="right">{Number(s.unit_price_jpy).toLocaleString("ja-JP")}</td><td align="right">{Number(s.amount_jpy).toLocaleString("ja-JP")}</td></tr>
  );

  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>修正申請 — {CORRECTION_STATUS_LABELS[c.status]}</h1>
      <p style={{ margin: 0 }}>取引 <Link href={`/trades/${c.target_trade_id}`}>{c.trades?.trade_no}</Link>（{c.trades?.business_date}）・理由：{c.reason}</p>
      <table><thead><tr><th /><th align="left">買受人</th><th align="right">数量</th><th align="right">単価</th><th align="right">金額</th></tr></thead>
        <tbody>{row("訂正前", c.change.before)}{row("訂正後", c.change.after)}</tbody></table>
      <p className="muted" style={{ margin: 0 }}>申請：{c.requested_by ? staff[c.requested_by] : "—"} ／ 一次承認：{c.approver1 ? staff[c.approver1] : "—"} ／ 二次承認：{c.approver2 ? staff[c.approver2] : "—"}</p>
      {c.reject_reason && <p>却下理由：{c.reject_reason}</p>}
      {data.adjustments.length > 0 && (
        <ul>{data.adjustments.map((a) => <li key={a.id}>{a.business_date} {a.kind === "REVERSE" ? "取消行" : "差額行"} {buyers[a.buyer_id] ?? a.buyer_id} 数量 {a.qty_delta} 金額 {Number(a.amount_delta_jpy).toLocaleString("ja-JP")}</li>)}</ul>
      )}
      {canDecide && (
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <button type="button" className="button-primary" onClick={() => act("approve")}>承認する（MFAは試作では省略）</button>
          <input placeholder="却下理由（必須）" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <button type="button" className="button-secondary" disabled={!rejectReason.trim()} onClick={() => act("reject")}>却下する</button>
        </div>
      )}
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <ScreenIdFooter screenId="SC-08-03" trace="FT-08-02..04 / FR-CORR-02/03, 07-03, D.4（承認者は申請者と別人）" />
    </section>
  );
}
