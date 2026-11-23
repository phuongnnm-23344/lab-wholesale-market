"use client";

import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { LOT_STATUS_TONES, type LotListResponse } from "@/lib/lots/lot-types";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

// 目利き・下見結果入力: the 目利き person records grade + note for one or many lots.
// The system never suggests or derives a grade (rule 3 — the person decides).
export default function InspectionPage() {
  const { data, error, reload } = useApiResource<LotListResponse>("/api/lots");
  const { showToast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [grade, setGrade] = useState("A");
  const [note, setNote] = useState("");
  const candidates = (data?.lots ?? []).filter((l) => l.status === "RECEIVED" || l.status === "INSPECTED");

  async function submit() {
    const res = await apiRequest<{ count: number }>("/api/lots/inspections", { method: "POST", body: { lotIds: selected, grade, note } });
    if (!res.ok) return showToast(res.message, "error");
    showToast(`${res.data.count}件の目利き結果を記録しました`);
    setSelected([]);
    setNote("");
    reload();
  }

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <>
      <PageHeader title="目利き・下見結果入力" />
      <p className="muted">等級・鮮度は担当者が判断して入力します（システムは判定しません）。</p>
      <ListStates loading={!data} error={error} empty={candidates.length === 0} emptyText="対象のロット（受付済・下見済）はありません。">
        <table>
          <thead><tr><th style={{ width: 40 }} /><th>ロット番号</th><th>出荷者</th><th>品目</th><th>状態</th></tr></thead>
          <tbody>{candidates.map((l) => (
            <tr key={l.id}>
              <td><input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} aria-label={`${l.lot_no}を選択`} /></td>
              <td>{l.lot_no}</td><td>{l.shipper_name}</td><td>{l.species}</td>
              <td><StatusBadge tone={LOT_STATUS_TONES[l.status]}>{LOT_STATUS_LABELS[l.status]}</StatusBadge></td>
            </tr>
          ))}</tbody>
        </table>
      </ListStates>
      <h2>結果入力</h2>
      <div className="form-grid">
        <FormField label="等級" required htmlFor="f-grade">
          <select id="f-grade" value={grade} onChange={(e) => setGrade(e.target.value)}>{["S", "A", "B", "C"].map((g) => <option key={g}>{g}</option>)}</select>
        </FormField>
        <FormField label="所見（鮮度・状態）" htmlFor="f-note">
          <input id="f-note" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        </FormField>
      </div>
      <div className="form-actions">
        <button type="button" className="button-primary" disabled={selected.length === 0} onClick={submit}>記録する（{selected.length}件）</button>
      </div>
    </>
  );
}
