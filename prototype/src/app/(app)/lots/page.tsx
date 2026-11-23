"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import type { LotListResponse } from "@/lib/lots/lot-types";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

// SC-03-03 ロット一覧・検索 + 一括販売公開 (only 下見済 lots can be selected).
export default function LotListPage() {
  const state = useCurrentUser();
  const canPublish = state.status === "ready" && ["INTAKE", "JUDGE"].includes(state.user.role);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const { data, error, reload } = useApiResource<LotListResponse>(`/api/lots${status ? `?status=${status}` : ""}`);

  async function publish() {
    const res = await apiRequest<{ count: number }>("/api/lots/publish", { method: "POST", body: { lotIds: selected } });
    setMessage(res.ok ? { error: false, text: `${res.data.count}件を販売公開しました` } : { error: true, text: res.message });
    if (res.ok) {
      setSelected([]);
      reload();
    }
  }

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>ロット一覧（業務日 {data?.date ?? "—"}）</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="状態">
        <option value="">すべての状態</option>
        {Object.entries(LOT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {canPublish && <button type="button" className="button-secondary" style={{ marginLeft: 8 }} disabled={selected.length === 0} onClick={publish}>選択を販売公開（{selected.length}）</button>}
      {(error || message) && <p className={error || message?.error ? "error-text" : undefined} role="status">{error ?? message?.text}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead><tr><th /><th align="left">ロット</th><th align="left">出荷者</th><th align="left">品目</th><th align="right">残数量</th><th align="left">状態</th></tr></thead>
        <tbody>
          {(data?.lots ?? []).map((l) => (
            <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td>{canPublish && l.status === "INSPECTED" && <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} aria-label={`${l.lot_no}を選択`} />}</td>
              <td><Link href={`/lots/${l.id}`}>{l.lot_no}</Link></td>
              <td>{l.shipper_name}</td><td>{l.species}</td>
              <td align="right">{l.available_qty} {l.unit}</td>
              <td>{LOT_STATUS_LABELS[l.status] ?? l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ScreenIdFooter screenId="SC-03-03" trace="FT-03-03, FT-03-04 / FIG-011, BR-LOT-02, PRM-117" />
    </section>
  );
}
