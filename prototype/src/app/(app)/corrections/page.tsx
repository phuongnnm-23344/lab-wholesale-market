"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { CORRECTION_STATUS_LABELS, CORRECTION_STATUS_TONES } from "@/lib/corrections/correction-status-labels";
import { formatDate, formatDateTime, formatYen } from "@/lib/format/display-format";

type Row = {
  id: string; status: string; reason: string; requested_by: string | null; created_at: string;
  change: { before: { amount_jpy: number }; after: { amount_jpy: number } };
  trades: { trade_no: string; business_date: string } | null;
};

// 修正申請一覧: filter by status; approvers open an item to decide. New requests start from 取引確認票.
export default function CorrectionListPage() {
  const [status, setStatus] = useState("");
  const { data, error } = useApiResource<{ corrections: Row[]; staff: Record<string, string> }>(`/api/corrections${status ? `?status=${status}` : ""}`);
  const rows = data?.corrections ?? [];

  return (
    <>
      <PageHeader title="修正申請" />
      <div className="toolbar">
        <label>状態{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">すべて</option>
            {Object.entries(CORRECTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <span className="muted" style={{ fontSize: 13 }}>新しい申請は、取引確認票の「修正申請を作成」から行います。</span>
      </div>
      <ListStates loading={!data} error={error} empty={rows.length === 0} emptyText="該当する修正申請はありません。">
        <table>
          <thead><tr><th>申請日時</th><th>取引番号</th><th>取引日</th><th className="num">差額</th><th>理由</th><th>申請者</th><th>状態</th></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id}>
              <td><Link href={`/corrections/${c.id}`}>{formatDateTime(c.created_at)}</Link></td>
              <td>{c.trades?.trade_no}</td><td>{formatDate(c.trades?.business_date)}</td>
              <td className="num">{formatYen(Number(c.change.after.amount_jpy) - Number(c.change.before.amount_jpy))}</td>
              <td>{c.reason}</td><td>{c.requested_by ? data?.staff[c.requested_by] : "—"}</td>
              <td><StatusBadge tone={CORRECTION_STATUS_TONES[c.status]}>{CORRECTION_STATUS_LABELS[c.status] ?? c.status}</StatusBadge></td>
            </tr>
          ))}</tbody>
        </table>
      </ListStates>
    </>
  );
}
