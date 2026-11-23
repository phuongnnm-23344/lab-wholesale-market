"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";

type Mode = "permit" | "approval";

// Registers / renews 許可 (mode=permit, 仲卸) or 承認 + 参加上限 (mode=approval, 売買参加者).
// Two separate endpoints and DB tables — the screen never offers a merged "qualification".
export function QualificationRegistrationForm({ participantId, mode, onSaved }: {
  participantId: string; mode: Mode; onSaved: (message: string) => void;
}) {
  const { showToast } = useToast();
  const [number, setNumber] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [limit, setLimit] = useState("");
  const label = mode === "permit" ? "許可" : "承認";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = mode === "permit"
      ? { permitNo: number, validFrom, validTo }
      : { approvalNo: number, validFrom, validTo, limitJpy: Number(limit) };
    const path = `/api/participants/${participantId}/${mode === "permit" ? "permits" : "approvals"}`;
    const res = await apiRequest<{ id: string }>(path, { method: "POST", body });
    if (!res.ok) return showToast(res.message, "error");
    onSaved(`${label}を登録しました（以前の${label}は「更新済（旧）」として残ります）`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField label={`${label}番号`} required htmlFor="q-no">
          <input id="q-no" required value={number} onChange={(e) => setNumber(e.target.value)} />
        </FormField>
        <FormField label="有効開始日" required htmlFor="q-from">
          <input id="q-from" type="date" required value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
        </FormField>
        <FormField label="有効終了日" required htmlFor="q-to">
          <input id="q-to" type="date" required value={validTo} onChange={(e) => setValidTo(e.target.value)} />
        </FormField>
        {mode === "approval" && (
          <FormField label="参加上限（円）" required htmlFor="q-limit">
            <input id="q-limit" type="number" min={1} required value={limit} onChange={(e) => setLimit(e.target.value)} />
          </FormField>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" className="button-primary">{label}を登録・更新する</button>
      </div>
    </form>
  );
}
