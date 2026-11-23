import { EmptyState, StatusBadge } from "@/components/ui/status-states";
import { formatNumber, formatYen } from "@/lib/format/display-format";

export type SeriResult = {
  id: string; trade_no: string; qty: number; unit_price_jpy: number; amount_jpy: number; status: string;
  lots: { lot_no: string; species: string; unit: string } | null;
  participants: { name: string; buyer_no: string } | null;
};

export type SeriSessionDetail = {
  session: { id: string; session_no: number; status: string; entered_by: string | null; confirmed_by: string | null; confirmed_at: string | null; same_person_reason: string | null };
  results: SeriResult[];
  staff: Record<string, string>;
  me: string;
};

export function SeriResultsTable({ results }: { results: SeriResult[] }) {
  if (results.length === 0) return <EmptyState text="結果はまだありません。" />;
  return (
    <table>
      <thead><tr><th>番号</th><th>ロット</th><th>買受人</th><th className="num">数量</th><th className="num">単価</th><th className="num">金額</th><th>状態</th></tr></thead>
      <tbody>{results.map((r) => (
        <tr key={r.id}>
          <td>{r.trade_no}</td><td>{r.lots?.lot_no} {r.lots?.species}</td><td>{r.participants?.buyer_no} {r.participants?.name}</td>
          <td className="num">{formatNumber(r.qty)} {r.lots?.unit}</td><td className="num">{formatYen(r.unit_price_jpy)}</td>
          <td className="num">{formatYen(r.amount_jpy)}</td>
          <td>{r.status === "CONFIRMED" ? <StatusBadge tone="success">確定</StatusBadge> : <StatusBadge tone="warning">仮</StatusBadge>}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
