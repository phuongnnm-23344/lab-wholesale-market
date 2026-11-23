import { EmptyState, StatusBadge, type BadgeTone } from "@/components/ui/status-states";
import { formatDate } from "@/lib/format/display-format";
import { QUALIFICATION_STATUS_LABELS, yen, type ApprovalRow, type PermitRow } from "@/lib/participants/participant-types";

const TONES: Record<string, BadgeTone> = { ACTIVE: "success", SUPERSEDED: "neutral", EXPIRED: "danger" };

// Full history of 許可 or 承認 rows: renewals add a row, the old one stays as 更新済（旧）.
export function QualificationHistoryTable({ rows }: { rows: (PermitRow | ApprovalRow)[] }) {
  if (rows.length === 0) return <EmptyState text="登録はありません。" />;
  const sorted = [...rows].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return (
    <table>
      <thead><tr><th>番号</th><th>有効期間</th><th className="num">参加上限</th><th>状態</th></tr></thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={r.id ?? i}>
            <td>{"permit_no" in r ? r.permit_no : r.approval_no}</td>
            <td>{formatDate(r.valid_from)} 〜 {formatDate(r.valid_to)}</td>
            <td className="num">{"participation_limit_jpy" in r ? yen(r.participation_limit_jpy) : "—"}</td>
            <td><StatusBadge tone={TONES[r.status] ?? "neutral"}>{QUALIFICATION_STATUS_LABELS[r.status] ?? r.status}</StatusBadge></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
