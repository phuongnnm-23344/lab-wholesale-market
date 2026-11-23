"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import type { RuleVersion } from "@/lib/rules/rule-version-types";

// SC-10-02 規則版作成（起票）: new version (empty bands) or rollback = new version copying an approved one.
export default function NewRuleVersionPage() {
  const router = useRouter();
  const { data } = useApiResource<{ versions: RuleVersion[] }>("/api/rule-versions");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const approved = (data?.versions ?? []).filter((v) => v.status === "ACTIVE" || v.status === "SUPERSEDED");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<{ id: string }>("/api/rule-versions", {
      method: "POST", body: { effectiveFrom: `${month}-01`, note, rollbackSourceId: source || undefined },
    });
    if (!res.ok) return setMessage(res.message);
    router.push(`/rules/${res.data.id}/rates`);
  }

  const field = { display: "grid", gap: 4 } as const;
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>規則版の起票</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label style={field}>発効月（月初から適用）<input type="month" required value={month} onChange={(e) => setMonth(e.target.value)} /></label>
        <label style={field}>ロールバック元（任意：この版の交付率をコピー）
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">新規（交付率を入力）</option>
            {approved.map((v) => <option key={v.id} value={v.id}>第{v.version_no}版（{v.effective_from}〜）</option>)}
          </select>
        </label>
        <label style={field}>備考<input maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        {message && <p className="error-text" role="alert">{message}</p>}
        <button type="submit" className="button-primary">起票</button>
      </form>
      <ScreenIdFooter screenId="SC-10-02" trace="FT-10-01 / FR-RULE-01, GOV-RULE-01, PRM-042" />
    </section>
  );
}
