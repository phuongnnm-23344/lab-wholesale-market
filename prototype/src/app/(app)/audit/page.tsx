"use client";

import { Fragment, useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";

type Log = { id: number; actor_id: string | null; action: string; table_name: string; record_id: string | null; before: unknown; after: unknown; business_date: string | null; at: string };
type Response = { logs: Log[]; staff: Record<string, string>; nextBefore: number | null };

// SC-13-01 監査ログ検索 (read-only; append-only table — FR-AUDIT-01/02). Period CSV export = mock M14.
export default function AuditLogPage() {
  const [filters, setFilters] = useState({ table: "", action: "", record: "", from: "", to: "" });
  const [before, setBefore] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const query = new URLSearchParams(Object.entries({ ...filters, before: before ? String(before) : "" }).filter(([, v]) => v));
  const { data, error } = useApiResource<Response>(`/api/audit-logs?${query}`);
  const set = (k: keyof typeof filters, v: string) => { setBefore(null); setFilters((f) => ({ ...f, [k]: v })); };

  return (
    <section className="card" style={{ display: "grid", gap: 8 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>監査ログ検索</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="テーブル（例 trades）" value={filters.table} onChange={(e) => set("table", e.target.value)} />
        <select value={filters.action} onChange={(e) => set("action", e.target.value)} aria-label="操作">
          {["", "INSERT", "UPDATE", "PIN_SWITCH", "PIN_SWITCH_FAILED", "PIN_SET"].map((a) => <option key={a} value={a}>{a || "すべての操作"}</option>)}
        </select>
        <input placeholder="レコードID" value={filters.record} onChange={(e) => set("record", e.target.value)} />
        <input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} aria-label="業務日から" />
        <input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} aria-label="業務日まで" />
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th align="left">日時</th><th align="left">業務日</th><th align="left">操作者</th><th align="left">操作</th><th align="left">テーブル</th><th align="left">レコード</th></tr></thead>
        <tbody>{(data?.logs ?? []).map((l) => (
          <Fragment key={l.id}>
            <tr style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setOpen(open === l.id ? null : l.id)}>
              <td>{new Date(l.at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</td><td>{l.business_date}</td>
              <td>{l.actor_id ? data?.staff[l.actor_id] ?? l.actor_id : "システム"}</td><td>{l.action}</td><td>{l.table_name}</td><td>{l.record_id}</td>
            </tr>
            {open === l.id && <tr><td colSpan={6}><pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify({ before: l.before, after: l.after }, null, 2)}</pre></td></tr>}
          </Fragment>
        ))}</tbody>
      </table>
      <div style={{ display: "flex", gap: 8 }}>
        {before && <button type="button" className="button-secondary" onClick={() => setBefore(null)}>最新へ</button>}
        {data?.nextBefore && <button type="button" className="button-secondary" onClick={() => setBefore(data.nextBefore)}>次の50件</button>}
      </div>
      <ScreenIdFooter screenId="SC-13-01" trace="FT-13-01, FT-13-02 / FR-AUDIT-01/02, RPT-08（期間CSV出力は試作対象外）" />
    </section>
  );
}
