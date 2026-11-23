"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { CORRECTION_STATUS_LABELS, CORRECTION_STATUS_TONES } from "@/lib/corrections/correction-status-labels";
import { canApproveCorrections, isWaitingForMe } from "@/lib/corrections/pending-for-approver";
import { formatDate, formatDateTime, formatYen } from "@/lib/format/display-format";

type Row = {
  id: string; status: string; reason: string; requested_by: string | null; approver1: string | null; created_at: string;
  change: { before: { amount_jpy: number }; after: { amount_jpy: number } };
  trades: { trade_no: string; business_date: string } | null;
};

const MINE = "MINE";

// 修正申請一覧. Approvers start on 「自分の承認待ち」 with its count; others see every request.
// New requests start from the 取引確認票.
export default function CorrectionListPage() {
  const me = useCurrentUser();
  const user = me.status === "ready" ? me.user : null;
  const approver = Boolean(user && canApproveCorrections(user));
  const [status, setStatus] = useState<string | null>(null);
  const filter = status ?? (approver ? MINE : "");
  const { data, error } = useApiResource<{ corrections: Row[]; staff: Record<string, string> }>(
    `/api/corrections${filter && filter !== MINE ? `?status=${filter}` : ""}`);
  const all = data?.corrections ?? [];
  const mineCount = user ? all.filter((c) => isWaitingForMe(c, user)).length : 0;
  const rows = filter === MINE && user ? all.filter((c) => isWaitingForMe(c, user)) : all;

  return (
    <>
      <PageHeader title="修正申請" />
      <div className="toolbar">
        <label>表示{" "}
          <select value={filter} onChange={(e) => setStatus(e.target.value)}>
            {approver && <option value={MINE}>自分の承認待ち{filter === MINE ? `（${mineCount}件）` : ""}</option>}
            <option value="">すべて</option>
            {Object.entries(CORRECTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        {approver && filter === MINE && <StatusBadge tone={mineCount > 0 ? "warning" : "success"}>承認待ち {mineCount}件</StatusBadge>}
        <span className="muted" style={{ fontSize: 13 }}>新しい申請は、取引確認票の「修正申請を作成する」から行います。</span>
      </div>
      <ListStates loading={!data} error={error} empty={rows.length === 0}
        emptyText={filter === MINE ? "あなたの承認を待っている修正申請はありません。" : "該当する修正申請はありません。"}>
        <table>
          <thead><tr><th>申請日時</th><th>取引番号</th><th>取引日</th><th className="num">差額</th><th>理由</th><th>申請者</th><th>状態</th></tr></thead>
          <tbody>{[...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((c) => (
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
