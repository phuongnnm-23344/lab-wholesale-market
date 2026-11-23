"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate } from "@/lib/format/display-format";
import type { RuleVersion } from "@/lib/rules/rule-version-types";

// "2026/12" or "2026-12" → "2026-12-01" (月初 only). Anything else is sent as-is and the server refuses it.
const monthToFirstDay = (text: string) => {
  const m = text.trim().match(/^(\d{4})[/-](\d{1,2})$/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-01` : text;
};

// 規則版の起票: new version (empty bands) or rollback = new version copying an approved one.
// Success → toast + 交付率の入力.
export default function NewRuleVersionPage() {
  const { showToast, toastAndGo } = useToast();
  const { data } = useApiResource<{ versions: RuleVersion[] }>("/api/rule-versions");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const approved = (data?.versions ?? []).filter((v) => v.status === "ACTIVE" || v.status === "SUPERSEDED");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<{ id: string }>("/api/rule-versions", {
      method: "POST", body: { effectiveFrom: monthToFirstDay(month), note, rollbackSourceId: source || undefined },
    });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo("規則版を起票しました。交付率を入力してください", `/rules/${res.data.id}/rates`);
  }

  return (
    <>
      <PageHeader title="規則版の起票" />
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="発効月" required htmlFor="r-month" hint="月初から適用されます">
            <input id="r-month" required inputMode="numeric" placeholder="YYYY/MM" value={month} style={{ maxWidth: 140 }}
              onChange={(e) => setMonth(e.target.value)} />
          </FormField>
          <FormField label="ロールバック元" htmlFor="r-src" hint="選択すると、その版の交付率をコピーします">
            <select id="r-src" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">新規（交付率を入力）</option>
              {approved.map((v) => <option key={v.id} value={v.id}>第{v.version_no}版（{formatDate(v.effective_from)}〜）</option>)}
            </select>
          </FormField>
          <FormField label="備考" htmlFor="r-note">
            <input id="r-note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="submit" className="button-primary">起票する</button>
          <Link href="/rules" className="button-secondary">キャンセル</Link>
        </div>
      </form>
    </>
  );
}
