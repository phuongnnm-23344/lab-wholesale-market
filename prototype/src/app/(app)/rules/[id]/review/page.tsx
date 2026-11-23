"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { RateBandTable } from "@/components/rules/rate-band-table";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import { RULE_STATUS_LABELS, type RateRow, type RuleVersion } from "@/lib/rules/rule-version-types";

type Detail = { version: RuleVersion; rates: RateRow[]; applied: { versionNo: number | null; rates: RateRow[] }; staff: Record<string, string>; me: CurrentUser };

// SC-10-04 規則版承認・ロールバック (照合部門長 = checker; maker ≠ checker, S4). Compare with the version
// applied today, then approve / return / cancel (cancel only before the effective date). MFA = mock M02.
export default function RuleVersionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, reload } = useApiResource<Detail>(`/api/rule-versions/${id}`);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  if (!data) return <p>読み込み中…</p>;
  const { version: v, staff, me } = data;
  const isChecker = me.authorities.includes("STL_HEAD");

  async function act(action: "approve" | "return" | "cancel") {
    const res = await apiRequest(`/api/rule-versions/${id}/actions`, { method: "POST", body: { action, reason } });
    setMessage(res.ok ? { error: false, text: "処理しました" } : { error: true, text: res.message });
    if (res.ok) reload();
  }

  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>第{v.version_no}版（{v.effective_from}〜）— {RULE_STATUS_LABELS[v.status]}</h1>
      <p style={{ margin: 0 }}>起票：{v.maker_id ? staff[v.maker_id] : "—"} ／ 承認：{v.checker_id ? staff[v.checker_id] : "—"} ／ 備考：{v.note ?? ""}</p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <RateBandTable rows={data.rates} title={`この版（第${v.version_no}版）`} />
        <RateBandTable rows={data.applied.rates} title={`現在適用中（第${data.applied.versionNo ?? "—"}版）`} />
      </div>
      {isChecker && (v.status === "PENDING" || v.status === "ACTIVE") && (
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          {v.status === "PENDING" && <button type="button" className="button-primary" onClick={() => act("approve")}>承認する（MFAは試作では省略）</button>}
          <input placeholder="差戻し・取消の理由" value={reason} onChange={(e) => setReason(e.target.value)} />
          {v.status === "PENDING" && <button type="button" className="button-secondary" disabled={!reason.trim()} onClick={() => act("return")}>差し戻す</button>}
          <button type="button" className="button-secondary" disabled={!reason.trim()} onClick={() => act("cancel")}>取り消す（発効前のみ）</button>
        </div>
      )}
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <ScreenIdFooter screenId="SC-10-04" trace="FT-10-01 / GOV-RULE-01, NFR-OPS-02, PRM-042（起票者≠承認者）" />
    </section>
  );
}
