import { EmptyState } from "@/components/ui/status-states";
import { formatYen } from "@/lib/format/display-format";
import type { RateRow } from "@/lib/rules/rule-version-types";

const bound = (n: number | null) => (n === null ? "上限なし" : formatYen(n));

// Read-only view of 交付率 bands (‰ of the period payable).
export function RateBandTable({ rows, title }: { rows: RateRow[]; title: string }) {
  return (
    <div style={{ flex: "1 1 320px" }}>
      <h3>{title}</h3>
      {rows.length === 0 ? <EmptyState text="交付率は未登録です。" /> : (
        <table>
          <thead><tr><th className="num">お支払額 以上</th><th className="num">未満</th><th className="num">交付率（‰）</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.min_paid_jpy}>
              <td className="num">{bound(r.min_paid_jpy)}</td><td className="num">{bound(r.max_paid_jpy)}</td><td className="num">{r.rate_permille}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
