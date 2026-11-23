import { QUALIFICATION_STATUS_LABELS, yen, type ApprovalRow, type PermitRow } from "@/lib/participants/participant-types";

// Full history of 許可 or 承認 rows: renewals add a row, the old one stays as 更新済（旧）.
export function QualificationHistoryTable({ rows }: { rows: (PermitRow | ApprovalRow)[] }) {
  if (rows.length === 0) return <p className="muted">登録がありません。</p>;
  const sorted = [...rows].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr><th align="left">番号</th><th align="left">有効期間</th><th align="left">参加上限</th><th align="left">状態</th></tr>
      </thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={r.id ?? i} style={{ borderTop: "1px solid var(--border)" }}>
            <td>{"permit_no" in r ? r.permit_no : r.approval_no}</td>
            <td>{r.valid_from} 〜 {r.valid_to}</td>
            <td>{"participation_limit_jpy" in r ? yen(r.participation_limit_jpy) : "—"}</td>
            <td>{QUALIFICATION_STATUS_LABELS[r.status] ?? r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
