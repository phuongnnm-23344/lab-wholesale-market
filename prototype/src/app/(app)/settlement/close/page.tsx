"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { InfoAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate, formatYen } from "@/lib/format/display-format";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";

// 日次締め (照合部門長). Checklist first; closing is final (no unlock — later fixes via 修正申請).
// Success → toast + 日次照合表.
export default function DayClosePage() {
  const { data } = useApiResource<DailySettlement>("/api/settlement/daily");
  const { showToast, toastAndGo } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const c = data?.checklist;
  const blocked = (c?.seri_unconfirmed ?? 0) > 0;

  async function close() {
    if (!data) return;
    const res = await apiRequest<{ nextBusinessDate: string }>(`/api/business-days/${data.date}/close`, { method: "POST" });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo(`${formatDate(data.date)} を締めました。次の業務日：${formatDate(res.data.nextBusinessDate)}`, "/settlement");
  }

  if (!data) return <><PageHeader title="日次締め" /><LoadingState /></>;
  const locked = data.dayStatus === "LOCKED";
  return (
    <>
      <PageHeader title="日次締め" actions={<Link href="/settlement" className="button-secondary">日次照合表</Link>} />
      <table className="detail-table" style={{ maxWidth: 640 }}>
        <tbody>
          <tr><th>業務日</th><td>{formatDate(data.date)}　{locked ? <StatusBadge tone="neutral">締め済</StatusBadge> : <StatusBadge tone="warning">未締め</StatusBadge>}</td></tr>
          <tr><th>未確定のせり</th><td>{c?.seri_unconfirmed ?? 0} 回 {blocked && <StatusBadge tone="danger">確定するまで締められません</StatusBadge>}</td></tr>
          <tr><th>入力者が確定したせり</th><td>{c?.seri_same_person ?? 0} 回（要確認）</td></tr>
          <tr><th>引渡し未完了</th><td>{c?.undelivered_trades ?? 0} 件（翌日以降も記録できます）</td></tr>
          <tr><th>本登録待ちの仮受付</th><td>{c?.provisional_lots ?? 0} 件</td></tr>
          <tr><th>合計金額</th><td>{formatYen(data.totalJpy)}</td></tr>
        </tbody>
      </table>
      <InfoAlert tone="warning">締めた後は直接修正できません（締め解除の機能はありません）。訂正は修正申請で行います。</InfoAlert>
      <div className="form-grid">
        <FormField label="確認のため業務日を入力" required hint={`「${data.date}」と入力してください`}>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={data.date} />
        </FormField>
      </div>
      <div className="form-actions">
        <ConfirmButton label="この業務日を締める" disabled={blocked || confirmText !== data.date || locked}
          message={`${formatDate(data.date)} を締めます。締めた後は元に戻せません。よろしいですか？`} confirmLabel="締める" onConfirm={close} />
        <Link href="/settlement" className="button-secondary">キャンセル</Link>
      </div>
    </>
  );
}
