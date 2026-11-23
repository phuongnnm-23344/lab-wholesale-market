"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate } from "@/lib/format/display-format";
import { RULE_STATUS_LABELS, RULE_STATUS_TONES, type RateRow, type RuleVersion } from "@/lib/rules/rule-version-types";

type Band = { min: string; max: string; rate: string };
type Detail = { version: RuleVersion; rates: RateRow[] };

// 交付率テーブル編集 (起票中 only — the DB refuses changes after submission). Save stays here;
// 承認依頼 → toast + 規則版一覧.
export default function RateEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data, reload } = useApiResource<Detail>(`/api/rule-versions/${id}`);
  const { showToast, toastAndGo } = useToast();
  const [bands, setBands] = useState<Band[] | null>(null);
  const rows = bands ?? (data?.rates ?? []).map((r) => ({ min: String(r.min_paid_jpy), max: r.max_paid_jpy === null ? "" : String(r.max_paid_jpy), rate: String(r.rate_permille) }));
  const editable = data?.version.status === "DRAFT";
  const title = data ? `交付率の入力（第${data.version.version_no}版）` : "交付率の入力";

  const update = (i: number, key: keyof Band, value: string) => setBands(rows.map((b, j) => (j === i ? { ...b, [key]: value } : b)));
  async function save() {
    const body = { rows: rows.map((b) => ({ min: Number(b.min), max: b.max === "" ? null : Number(b.max), rate: Number(b.rate) })) };
    const res = await apiRequest(`/api/rule-versions/${id}`, { method: "PUT", body });
    if (!res.ok) return showToast(res.message, "error");
    showToast("交付率を保存しました");
    reload();
  }
  async function submit() {
    const res = await apiRequest(`/api/rule-versions/${id}/actions`, { method: "POST", body: { action: "submit" } });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo("承認を依頼しました", "/rules");
  }

  if (!data) return <><PageHeader title={title} /><LoadingState /></>;
  return (
    <>
      <PageHeader title={title} actions={<Link href="/rules" className="button-secondary">一覧へ戻る</Link>} />
      <div className="toolbar">
        <span>発効日 {formatDate(data.version.effective_from)}〜</span>
        <StatusBadge tone={RULE_STATUS_TONES[data.version.status]}>{RULE_STATUS_LABELS[data.version.status]}</StatusBadge>
      </div>
      <table style={{ maxWidth: 640 }}>
        <thead><tr><th>以上（円）</th><th>未満（円）</th><th>交付率（‰）</th></tr></thead>
        <tbody>{rows.map((b, i) => (
          <tr key={i}>{(["min", "max", "rate"] as const).map((k) => (
            <td key={k}><input disabled={!editable} inputMode="numeric" aria-label={k} value={b[k]} placeholder={k === "max" ? "上限なし" : undefined}
              onChange={(e) => update(i, k, e.target.value.replace(/\D/g, ""))} style={{ width: "100%", textAlign: "right" }} /></td>
          ))}</tr>
        ))}</tbody>
      </table>
      <p className="muted" style={{ fontSize: 13 }}>「未満」が空欄の帯は上限なしです。保存してから承認を依頼してください。</p>
      {editable ? (
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={() => setBands([...rows, { min: rows.at(-1)?.max ?? "0", max: "", rate: "" }])}>帯を追加</button>
          <button type="button" className="button-secondary" onClick={save}>保存する</button>
          <button type="button" className="button-primary" onClick={submit}>承認を依頼する</button>
        </div>
      ) : <Link href={`/rules/${id}/review`} className="button-secondary">承認画面へ</Link>}
    </>
  );
}
