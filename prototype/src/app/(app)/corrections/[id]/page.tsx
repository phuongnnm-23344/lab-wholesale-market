"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { CORRECTION_STATUS_LABELS, CORRECTION_STATUS_TONES } from "@/lib/corrections/correction-status-labels";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate, formatNumber, formatYen } from "@/lib/format/display-format";

type Side = { qty: number; unit_price_jpy: number; buyer_id: string; amount_jpy: number };
type Detail = {
  correction: { status: string; reason: string; reject_reason: string | null; requested_by: string | null; approver1: string | null; approver2: string | null; target_trade_id: string; change: { before: Side; after: Side }; trades: { trade_no: string; business_date: string } | null };
  buyers: Record<string, string>; adjustments: { id: string; kind: string; qty_delta: number; amount_delta_jpy: number; business_date: string; buyer_id: string }[];
  staff: Record<string, string>; me: CurrentUser;
};

// 修正申請の詳細・承認・却下: before / after side by side. Approve or reject (reason required);
// after a decision the approver returns to the list of requests.
export default function CorrectionDecisionPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<Detail>(`/api/corrections/${id}`);
  const { showToast, toastAndGo } = useToast();
  const [rejectReason, setRejectReason] = useState("");
  if (error) return <><PageHeader title="修正申請" /><ErrorAlert message={error} /></>;
  if (!data) return <><PageHeader title="修正申請" /><LoadingState /></>;
  const { correction: c, buyers, staff, me } = data;
  const pending = c.status === "SUBMITTED" || c.status === "FIRST_APPROVED";
  const canDecide = pending && (me.authorities.includes("STL_HEAD") || me.authorities.includes("OPS_HEAD"));
  const name = (uid: string | null) => (uid ? staff[uid] ?? "—" : "—");

  async function act(kind: "approve" | "reject") {
    const res = await apiRequest<{ status: string }>(`/api/corrections/${id}/${kind}`, { method: "POST", body: kind === "reject" ? { reason: rejectReason } : {} });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo(kind === "reject" ? "修正申請を却下しました" : `承認しました（${CORRECTION_STATUS_LABELS[res.data.status] ?? res.data.status}）`, "/corrections");
  }
  const row = (label: string, s: Side) => (
    <tr><th>{label}</th><td>{buyers[s.buyer_id]}</td><td className="num">{formatNumber(s.qty)}</td><td className="num">{formatYen(s.unit_price_jpy)}</td><td className="num">{formatYen(s.amount_jpy)}</td></tr>
  );

  return (
    <>
      <PageHeader title="修正申請の詳細" actions={<Link href="/corrections" className="button-secondary">一覧へ戻る</Link>} />
      <table className="detail-table">
        <tbody>
          <tr><th>状態</th><td><StatusBadge tone={CORRECTION_STATUS_TONES[c.status]}>{CORRECTION_STATUS_LABELS[c.status]}</StatusBadge></td></tr>
          <tr><th>対象取引</th><td><Link href={`/trades/${c.target_trade_id}`}>{c.trades?.trade_no}</Link>（{formatDate(c.trades?.business_date)}）</td></tr>
          <tr><th>理由</th><td>{c.reason}</td></tr>
          <tr><th>申請者／一次承認／二次承認</th><td>{name(c.requested_by)} ／ {name(c.approver1)} ／ {name(c.approver2)}</td></tr>
          {c.reject_reason && <tr><th>却下理由</th><td>{c.reject_reason}</td></tr>}
        </tbody>
      </table>
      <h2>訂正内容</h2>
      <table>
        <thead><tr><th /><th>買受人</th><th className="num">数量</th><th className="num">単価</th><th className="num">金額</th></tr></thead>
        <tbody>{row("訂正前", c.change.before)}{row("訂正後", c.change.after)}</tbody>
      </table>
      {data.adjustments.length > 0 && (
        <>
          <h2>反映された取消・差額</h2>
          <table>
            <thead><tr><th>計上日</th><th>区分</th><th>買受人</th><th className="num">数量</th><th className="num">金額</th></tr></thead>
            <tbody>{data.adjustments.map((a) => (
              <tr key={a.id}>
                <td>{formatDate(a.business_date)}</td>
                <td>{a.kind === "REVERSE" ? <StatusBadge tone="danger">取消</StatusBadge> : <StatusBadge tone="info">差額</StatusBadge>}</td>
                <td>{buyers[a.buyer_id] ?? a.buyer_id}</td><td className="num">{formatNumber(a.qty_delta)}</td><td className="num">{formatYen(a.amount_delta_jpy)}</td>
              </tr>
            ))}</tbody>
          </table>
        </>
      )}
      {canDecide && (
        <>
          <h2>承認・却下</h2>
          <div className="form-grid">
            <FormField label="却下理由" hint="却下する場合のみ必須">
              <input value={rejectReason} maxLength={200} onChange={(e) => setRejectReason(e.target.value)} />
            </FormField>
          </div>
          <div className="form-actions">
            <ConfirmButton danger={false} label="承認する" confirmLabel="承認する" onConfirm={() => act("approve")}
              message={`この修正申請を承認します。${c.status === "FIRST_APPROVED" || Math.abs(c.change.after.amount_jpy - c.change.before.amount_jpy) < 300000 ? "承認すると、元の取引に対する取消・差額が本日の業務日に記録され、元に戻せません。" : "一次承認として記録され、二次承認を待ちます。"}本番ではこの操作の直前に多要素認証を行います（試作では省略）。`} />
            <ConfirmButton label="却下する" disabled={!rejectReason.trim()} message="この修正申請を却下します。よろしいですか？" confirmLabel="却下する" onConfirm={() => act("reject")} />
          </div>
        </>
      )}
    </>
  );
}
