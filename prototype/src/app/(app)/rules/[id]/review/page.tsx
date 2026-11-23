"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { RateBandTable } from "@/components/rules/rate-band-table";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate } from "@/lib/format/display-format";
import { RULE_STATUS_LABELS, RULE_STATUS_TONES, type RateRow, type RuleVersion } from "@/lib/rules/rule-version-types";

type Detail = { version: RuleVersion; rates: RateRow[]; applied: { versionNo: number | null; rates: RateRow[] }; staff: Record<string, string>; me: CurrentUser };

const DONE: Record<string, string> = { approve: "規則版を承認しました", return: "規則版を差し戻しました", cancel: "規則版を取り消しました" };

// 規則版の承認・ロールバック (照合部門長 = checker; maker ≠ checker). Compare with the version applied
// today, then approve / return / cancel (cancel only before the effective date). Success → 規則版一覧.
export default function RuleVersionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useApiResource<Detail>(`/api/rule-versions/${id}`);
  const { showToast, toastAndGo } = useToast();
  const [reason, setReason] = useState("");
  const title = data ? `規則版の承認（第${data.version.version_no}版）` : "規則版の承認";
  if (!data) return <><PageHeader title={title} /><LoadingState /></>;
  const { version: v, staff, me } = data;
  const isChecker = me.authorities.includes("STL_HEAD");

  async function act(action: "approve" | "return" | "cancel") {
    const res = await apiRequest(`/api/rule-versions/${id}/actions`, { method: "POST", body: { action, reason } });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo(DONE[action], "/rules");
  }

  return (
    <>
      <PageHeader title={title} actions={<Link href="/rules" className="button-secondary">一覧へ戻る</Link>} />
      <table className="detail-table" style={{ maxWidth: 720 }}>
        <tbody>
          <tr><th>状態</th><td><StatusBadge tone={RULE_STATUS_TONES[v.status]}>{RULE_STATUS_LABELS[v.status]}</StatusBadge></td></tr>
          <tr><th>発効日</th><td>{formatDate(v.effective_from)}〜</td></tr>
          <tr><th>起票者／承認者</th><td>{v.maker_id ? staff[v.maker_id] : "—"} ／ {v.checker_id ? staff[v.checker_id] : "—"}</td></tr>
          <tr><th>備考</th><td>{v.note ?? ""}</td></tr>
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <RateBandTable rows={data.rates} title={`この版（第${v.version_no}版）`} />
        <RateBandTable rows={data.applied.rates} title={`現在適用中（第${data.applied.versionNo ?? "—"}版）`} />
      </div>
      {isChecker && (v.status === "PENDING" || v.status === "ACTIVE") && (
        <>
          <h2>承認・差戻し・取消</h2>
          <div className="form-grid">
            <FormField label="差戻し・取消の理由" hint="差戻し・取消の場合は必須">
              <input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
            </FormField>
          </div>
          <div className="form-actions">
            {v.status === "PENDING" && <button type="button" className="button-primary" onClick={() => act("approve")}>承認する</button>}
            {v.status === "PENDING" && <button type="button" className="button-secondary" disabled={!reason.trim()} onClick={() => act("return")}>差し戻す</button>}
            <ConfirmButton label="取り消す（発効前のみ）" disabled={!reason.trim()} message="この規則版を取り消します。よろしいですか？" confirmLabel="取り消す" onConfirm={() => act("cancel")} />
          </div>
        </>
      )}
    </>
  );
}
