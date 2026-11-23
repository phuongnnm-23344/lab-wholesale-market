"use client";

import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import type { LotListResponse } from "@/lib/lots/lot-types";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

// SC-03-05 目利き・下見結果入力: the 目利き person records grade + note for one or many lots.
// The system never suggests or derives a grade (rule 3, CAP-HUMAN-01).
export default function InspectionPage() {
  const { data, reload } = useApiResource<LotListResponse>("/api/lots");
  const [selected, setSelected] = useState<string[]>([]);
  const [grade, setGrade] = useState("A");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const candidates = (data?.lots ?? []).filter((l) => l.status === "RECEIVED" || l.status === "INSPECTED");

  async function submit() {
    const res = await apiRequest<{ count: number }>("/api/lots/inspections", { method: "POST", body: { lotIds: selected, grade, note } });
    setMessage(res.ok ? { error: false, text: `${res.data.count}件を記録しました（下見済）` } : { error: true, text: res.message });
    if (res.ok) {
      setSelected([]);
      setNote("");
      reload();
    }
  }

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>目利き・下見結果入力</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {candidates.map((l) => (
          <li key={l.id}><label><input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} /> {l.lot_no} {l.shipper_name} {l.species}（{LOT_STATUS_LABELS[l.status]}）</label></li>
        ))}
        {candidates.length === 0 && <li className="muted">対象ロット（受付済）がありません</li>}
      </ul>
      <label>等級 <select value={grade} onChange={(e) => setGrade(e.target.value)}>{["S", "A", "B", "C"].map((g) => <option key={g}>{g}</option>)}</select></label>
      <label>所見（鮮度・状態）<input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} style={{ width: "100%" }} /></label>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <button type="button" className="button-primary" disabled={selected.length === 0} onClick={submit}>記録する（{selected.length}件）</button>
      <ScreenIdFooter screenId="SC-03-05" trace="FT-03-02 / FR-LOT-02, CAP-HUMAN-01（判定は人が行う）" />
    </section>
  );
}
