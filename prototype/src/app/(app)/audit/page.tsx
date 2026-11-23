"use client";

import { Fragment, useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatDateTime } from "@/lib/format/display-format";

type Log = { id: number; actor_id: string | null; action: string; table_name: string; record_id: string | null; before: unknown; after: unknown; business_date: string | null; at: string };
type Response = { logs: Log[]; staff: Record<string, string>; nextBefore: number | null };

const ACTION_LABELS: Record<string, string> = {
  INSERT: "登録", UPDATE: "更新", DELETE: "削除", PIN_SWITCH: "利用者切替", PIN_SWITCH_FAILED: "利用者切替（失敗）", PIN_SET: "PIN設定",
};
const TABLE_LABELS: Record<string, string> = {
  trades: "取引", trade_adjustments: "取消・差額", correction_requests: "修正申請", lots: "ロット", lot_inspections: "目利き",
  lot_quantity_ledger: "数量台帳", deliveries: "引渡し", business_days: "業務日", seri_sessions: "せり", participants: "参加者",
  nakaoroshi_permits: "許可", baibai_approvals: "承認", payments: "入金", payment_import_batches: "入金取込",
  payment_periods: "期", rule_versions: "規則版", incentive_rate_rows: "交付率", incentive_runs: "奨励金計算",
  incentive_results: "奨励金結果", profiles: "アカウント", user_authorities: "権限",
};

// 監査ログ検索 (read-only; the log is append-only and cannot be edited or deleted from the app).
export default function AuditLogPage() {
  const [filters, setFilters] = useState({ table: "", action: "", record: "", from: "", to: "" });
  const [before, setBefore] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const query = new URLSearchParams(Object.entries({ ...filters, before: before ? String(before) : "" }).filter(([, v]) => v));
  const { data, error } = useApiResource<Response>(`/api/audit-logs?${query}`);
  const set = (k: keyof typeof filters, v: string) => { setBefore(null); setFilters((f) => ({ ...f, [k]: v })); };
  const logs = data?.logs ?? [];

  return (
    <>
      <PageHeader title="監査ログ検索" />
      <div className="toolbar">
        <label>対象 <select value={filters.table} onChange={(e) => set("table", e.target.value)}>
          <option value="">すべて</option>
          {Object.entries(TABLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select></label>
        <label>操作 <select value={filters.action} onChange={(e) => set("action", e.target.value)}>
          <option value="">すべて</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select></label>
        <label>レコード <input value={filters.record} onChange={(e) => set("record", e.target.value)} style={{ width: 160 }} /></label>
        <label>業務日 <input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} /></label>
        <span>〜</span>
        <input type="date" aria-label="業務日（まで）" value={filters.to} onChange={(e) => set("to", e.target.value)} />
      </div>
      <p className="muted" style={{ fontSize: 13 }}>行をクリックすると変更前・変更後の内容を表示します。監査ログは追記のみで、修正・削除はできません。</p>
      <ListStates loading={!data} error={error} empty={logs.length === 0} emptyText="該当する記録はありません。">
        <table>
          <thead><tr><th>日時</th><th>業務日</th><th>操作者</th><th>操作</th><th>対象</th><th>レコード</th></tr></thead>
          <tbody>{logs.map((l) => (
            <Fragment key={l.id}>
              <tr style={{ cursor: "pointer" }} onClick={() => setOpen(open === l.id ? null : l.id)}>
                <td>{formatDateTime(l.at)}</td><td>{formatDate(l.business_date)}</td>
                <td>{l.actor_id ? data?.staff[l.actor_id] ?? l.actor_id : "システム"}</td>
                <td><StatusBadge tone={l.action.startsWith("PIN_SWITCH_FAILED") ? "danger" : "neutral"}>{ACTION_LABELS[l.action] ?? l.action}</StatusBadge></td>
                <td>{TABLE_LABELS[l.table_name] ?? l.table_name}</td>
                <td className="muted" style={{ fontSize: 12 }}>{l.record_id}</td>
              </tr>
              {open === l.id && (
                <tr><td colSpan={6} style={{ background: "var(--surface-muted)" }}>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, margin: 0 }}>{JSON.stringify({ 変更前: l.before, 変更後: l.after }, null, 2)}</pre>
                </td></tr>
              )}
            </Fragment>
          ))}</tbody>
        </table>
      </ListStates>
      <div className="page-actions">
        {before && <button type="button" className="button-secondary" onClick={() => setBefore(null)}>最新へ戻る</button>}
        {data?.nextBefore && <button type="button" className="button-secondary" onClick={() => setBefore(data.nextBefore)}>次の50件</button>}
      </div>
    </>
  );
}
