"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/http/api-client";

type Mode = "permit" | "approval";

// Registers / renews 許可 (mode=permit, 仲卸) or 承認 + 参加上限 (mode=approval, 売買参加者).
// Two separate endpoints and DB tables — the screen never offers a merged "qualification".
export function QualificationRegistrationForm({ participantId, mode, onSaved }: {
  participantId: string; mode: Mode; onSaved: () => void;
}) {
  const [number, setNumber] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const label = mode === "permit" ? "許可" : "承認";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = mode === "permit"
      ? { permitNo: number, validFrom, validTo }
      : { approvalNo: number, validFrom, validTo, limitJpy: Number(limit) };
    const path = `/api/participants/${participantId}/${mode === "permit" ? "permits" : "approvals"}`;
    const res = await apiRequest<{ id: string }>(path, { method: "POST", body });
    if (!res.ok) return setMessage({ error: true, text: res.message });
    setMessage({ error: false, text: `${label}を登録しました（旧${label}は「更新済（旧）」として保存）` });
    setNumber("");
    onSaved();
  }

  const field = { display: "grid", gap: 4 } as const;
  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <label style={field}>{label}番号<input required value={number} onChange={(e) => setNumber(e.target.value)} /></label>
      <label style={field}>有効開始日<input type="date" required value={validFrom} onChange={(e) => setValidFrom(e.target.value)} /></label>
      <label style={field}>有効終了日<input type="date" required value={validTo} onChange={(e) => setValidTo(e.target.value)} /></label>
      {mode === "approval" && (
        <label style={field}>参加上限（円）<input type="number" min={1} required value={limit} onChange={(e) => setLimit(e.target.value)} /></label>
      )}
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <button type="submit" className="button-primary">{label}を登録・更新</button>
    </form>
  );
}
