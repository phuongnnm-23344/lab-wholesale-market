import type { RateRow } from "@/lib/rules/rule-version-types";

const yen = (n: number | null) => (n === null ? "上限なし" : `${Number(n).toLocaleString("ja-JP")} 円`);

// Read-only view of 交付率 bands (‰ of the period payable).
export function RateBandTable({ rows, title }: { rows: RateRow[]; title: string }) {
  return (
    <div>
      <h3 style={{ fontSize: 16, margin: "8px 0" }}>{title}</h3>
      {rows.length === 0 ? <p className="muted">なし</p> : (
        <table style={{ borderCollapse: "collapse" }}>
          <thead><tr><th align="left">お支払額 以上</th><th align="left">未満</th><th align="right">交付率（‰）</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.min_paid_jpy} style={{ borderTop: "1px solid var(--border)" }}>
              <td>{yen(r.min_paid_jpy)}</td><td>{yen(r.max_paid_jpy)}</td><td align="right">{r.rate_permille}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
