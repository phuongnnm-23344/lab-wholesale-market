"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { SeriResultsTable, type SeriSessionDetail } from "@/components/trades/seri-results-table";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, InfoAlert, LoadingState } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/format/display-format";

// せり結果確認: a second person confirms the whole session (human decision). If the entry person
// confirms alone, a reason is mandatory. A result over the buyer's 参加上限 needs a reason typed by
// the confirmer for THAT result (assumption awaiting the customer).
export default function SeriConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<SeriSessionDetail>(`/api/seri-sessions/${id}`);
  const { showToast, toastAndGo } = useToast();
  const [reason, setReason] = useState("");
  const [overLimit, setOverLimit] = useState<Record<string, string>>({});
  const title = data ? `せり結果確認（第${data.session.session_no}回）` : "せり結果確認";

  if (error) return <><PageHeader title={title} /><ErrorAlert message={error} /></>;
  if (!data) return <><PageHeader title={title} /><LoadingState /></>;
  const { session, staff, me } = data;
  const samePerson = session.entered_by === me;

  async function confirm() {
    const reasons = Object.fromEntries(Object.entries(overLimit).filter(([, v]) => v.trim()));
    const res = await apiRequest<{ confirmed: number }>(`/api/seri-sessions/${id}/confirm`, {
      method: "POST", body: { samePersonReason: reason, overLimitReasons: reasons },
    });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo(`第${session.session_no}回の結果 ${res.data.confirmed}件を確定しました`, "/seri");
  }

  return (
    <>
      <PageHeader title={title} actions={<Link href={`/seri/${id}`} className="button-secondary">戻る</Link>} />
      <p className="muted">入力者：{session.entered_by ? staff[session.entered_by] : "—"}
        {session.confirmed_by && <> ／ 確定者：{staff[session.confirmed_by]}（{formatDateTime(session.confirmed_at)}）</>}
      </p>
      <SeriResultsTable results={data.results} />
      {session.status === "CONFIRMED" ? (
        <InfoAlert>確定済みです{session.same_person_reason ? `（入力者が確定。理由：${session.same_person_reason}）` : ""}</InfoAlert>
      ) : (
        <>
          <h2>参加上限を超える結果の理由</h2>
          <p className="muted" style={{ fontSize: 13 }}>上限を超える結果がある場合のみ、その結果ごとに入力してください。</p>
          <div className="form-grid">
            {data.results.map((r) => (
              <FormField key={r.id} label={`${r.trade_no} ${r.participants?.buyer_no ?? ""}`}>
                <input value={overLimit[r.id] ?? ""} maxLength={200} onChange={(e) => setOverLimit((o) => ({ ...o, [r.id]: e.target.value }))} />
              </FormField>
            ))}
            {samePerson && (
              <FormField label="入力者本人が確定する理由" required hint="あなたはこの回の入力者です">
                <input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
              </FormField>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="button-primary" disabled={samePerson && !reason.trim()} onClick={confirm}>この回の結果を確定する</button>
            <Link href={`/seri/${id}`} className="button-secondary">キャンセル</Link>
          </div>
        </>
      )}
    </>
  );
}
