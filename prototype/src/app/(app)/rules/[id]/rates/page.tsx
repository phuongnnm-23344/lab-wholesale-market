"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import { RULE_STATUS_LABELS, type RateRow, type RuleVersion } from "@/lib/rules/rule-version-types";

type Band = { min: string; max: string; rate: string };
type Detail = { version: RuleVersion; rates: RateRow[] };

// SC-10-03 交付率テーブル編集 (DRAFT only — the DB refuses changes after submission). Then submit.
export default function RateEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data, reload } = useApiResource<Detail>(`/api/rule-versions/${id}`);
  const [bands, setBands] = useState<Band[] | null>(null);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const rows = bands ?? (data?.rates ?? []).map((r) => ({ min: String(r.min_paid_jpy), max: r.max_paid_jpy === null ? "" : String(r.max_paid_jpy), rate: String(r.rate_permille) }));
  const editable = data?.version.status === "DRAFT";

  const update = (i: number, key: keyof Band, value: string) => setBands(rows.map((b, j) => (j === i ? { ...b, [key]: value } : b)));
  async function save() {
    const body = { rows: rows.map((b) => ({ min: Number(b.min), max: b.max === "" ? null : Number(b.max), rate: Number(b.rate) })) };
    const res = await apiRequest(`/api/rule-versions/${id}`, { method: "PUT", body });
    setMessage(res.ok ? { error: false, text: "保存しました" } : { error: true, text: res.message });
    if (res.ok) reload();
  }
  async function submit() {
    const res = await apiRequest(`/api/rule-versions/${id}/actions`, { method: "POST", body: { action: "submit" } });
    setMessage(res.ok ? { error: false, text: "承認依頼しました" } : { error: true, text: res.message });
    if (res.ok) reload();
  }

  if (!data) return <p>読み込み中…</p>;
  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>第{data.version.version_no}版 交付率（{data.version.effective_from}〜・{RULE_STATUS_LABELS[data.version.status]}）</h1>
      <table><thead><tr><th>以上（円）</th><th>未満（円・空欄=上限なし）</th><th>交付率（‰）</th></tr></thead>
        <tbody>{rows.map((b, i) => (
          <tr key={i}>{(["min", "max", "rate"] as const).map((k) => (
            <td key={k}><input disabled={!editable} inputMode="numeric" value={b[k]} onChange={(e) => update(i, k, e.target.value.replace(/\D/g, ""))} /></td>
          ))}</tr>
        ))}</tbody>
      </table>
      {editable && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="button-secondary" onClick={() => setBands([...rows, { min: rows.at(-1)?.max ?? "0", max: "", rate: "" }])}>帯を追加</button>
          <button type="button" className="button-secondary" onClick={save}>保存</button>
          <button type="button" className="button-primary" onClick={submit}>承認依頼</button>
        </div>
      )}
      {!editable && <Link href={`/rules/${id}/review`}>承認画面へ</Link>}
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <ScreenIdFooter screenId="SC-10-03" trace="FT-10-02 / FR-INC-02, TBL-RATE-01" />
    </section>
  );
}
