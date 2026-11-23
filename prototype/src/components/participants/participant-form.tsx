"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import type { ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS, PARTICIPANT_KINDS, type ParticipantKind } from "@/lib/validators/participant-schemas";

type Props = { initial?: ParticipantRow; onSaved: (id: string) => void; onCancel?: () => void; readOnly: boolean };

// 参加者 create / edit. Kind is chosen once at creation and is locked afterwards (DB enforces too).
// Errors are shown as a toast and the input is kept; the page decides where to go after saving.
export function ParticipantForm({ initial, onSaved, onCancel, readOnly }: Props) {
  const { showToast } = useToast();
  const [kind, setKind] = useState<ParticipantKind>(initial?.kind ?? "NAKAOROSHI");
  const [name, setName] = useState(initial?.name ?? "");
  const [buyerNo, setBuyerNo] = useState(initial?.buyer_no ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [deposit, setDeposit] = useState(String(initial?.deposit_jpy ?? 0));
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = { kind, name, buyerNo, email, depositJpy: Number(deposit), status };
    const res = initial
      ? await apiRequest<{ id: string }>(`/api/participants/${initial.id}`, { method: "PATCH", body })
      : await apiRequest<{ id: string }>("/api/participants", { method: "POST", body });
    if (!res.ok) return showToast(res.message, "error");
    onSaved(res.data.id);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField label="種別" required={!initial} htmlFor="p-kind" hint={initial ? "種別は登録後に変更できません" : undefined}>
          <select id="p-kind" value={kind} disabled={readOnly || Boolean(initial)} onChange={(e) => setKind(e.target.value as ParticipantKind)}>
            {PARTICIPANT_KINDS.map((k) => <option key={k} value={k}>{PARTICIPANT_KIND_LABELS[k]}</option>)}
          </select>
        </FormField>
        <FormField label="名称" required htmlFor="p-name">
          <input id="p-name" required value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="買受人番号" htmlFor="p-no" hint="仲卸・売買参加者のみ（英大文字・数字）">
          <input id="p-no" value={buyerNo} disabled={readOnly} onChange={(e) => setBuyerNo(e.target.value)} />
        </FormField>
        <FormField label="連絡先メール" htmlFor="p-mail">
          <input id="p-mail" type="email" value={email} disabled={readOnly} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="保証金（円）" htmlFor="p-dep">
          <input id="p-dep" type="number" min={0} value={deposit} disabled={readOnly} onChange={(e) => setDeposit(e.target.value)} />
        </FormField>
        <FormField label="状態" required htmlFor="p-status">
          <select id="p-status" value={status} disabled={readOnly} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "SUSPENDED")}>
            <option value="ACTIVE">有効</option><option value="SUSPENDED">停止</option>
          </select>
        </FormField>
      </div>
      {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="button-primary">{initial ? "保存する" : "登録する"}</button>
          {onCancel && <button type="button" className="button-secondary" onClick={onCancel}>キャンセル</button>}
        </div>
      )}
    </form>
  );
}
