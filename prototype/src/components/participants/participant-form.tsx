"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/http/api-client";
import type { ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS, PARTICIPANT_KINDS, type ParticipantKind } from "@/lib/validators/participant-schemas";

type Props = { initial?: ParticipantRow; onSaved: (id: string) => void; readOnly: boolean };

// SC-01-02 create / edit. Kind is chosen once at creation and is locked afterwards (DB enforces too).
export function ParticipantForm({ initial, onSaved, readOnly }: Props) {
  const [kind, setKind] = useState<ParticipantKind>(initial?.kind ?? "NAKAOROSHI");
  const [name, setName] = useState(initial?.name ?? "");
  const [buyerNo, setBuyerNo] = useState(initial?.buyer_no ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [deposit, setDeposit] = useState(String(initial?.deposit_jpy ?? 0));
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = { kind, name, buyerNo, email, depositJpy: Number(deposit), status };
    const res = initial
      ? await apiRequest<{ id: string }>(`/api/participants/${initial.id}`, { method: "PATCH", body })
      : await apiRequest<{ id: string }>("/api/participants", { method: "POST", body });
    if (!res.ok) return setMessage({ error: true, text: res.message });
    setMessage({ error: false, text: "保存しました" });
    onSaved(res.data.id);
  }

  const field = { display: "grid", gap: 4 } as const;
  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
      <label style={field}>種別
        <select value={kind} disabled={readOnly || Boolean(initial)} onChange={(e) => setKind(e.target.value as ParticipantKind)}>
          {PARTICIPANT_KINDS.map((k) => <option key={k} value={k}>{PARTICIPANT_KIND_LABELS[k]}</option>)}
        </select>
      </label>
      <label style={field}>名称<input required value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} /></label>
      <label style={field}>買受人番号<input value={buyerNo} disabled={readOnly} onChange={(e) => setBuyerNo(e.target.value)} /></label>
      <label style={field}>連絡先メール<input type="email" value={email} disabled={readOnly} onChange={(e) => setEmail(e.target.value)} /></label>
      <label style={field}>保証金（円）<input type="number" min={0} value={deposit} disabled={readOnly} onChange={(e) => setDeposit(e.target.value)} /></label>
      <label style={field}>状態
        <select value={status} disabled={readOnly} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "SUSPENDED")}>
          <option value="ACTIVE">有効</option><option value="SUSPENDED">停止</option>
        </select>
      </label>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      {!readOnly && <button type="submit" className="button-primary">保存</button>}
    </form>
  );
}
