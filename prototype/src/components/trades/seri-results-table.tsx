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
  if (results.length === 0) return <p className="muted">結果はまだありません。</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><th align="left">番号</th><th align="left">ロット</th><th align="left">買受人</th><th align="right">数量</th><th align="right">単価</th><th align="right">金額</th><th align="left">状態</th></tr></thead>
      <tbody>{results.map((r) => (
        <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
          <td>{r.trade_no}</td><td>{r.lots?.lot_no} {r.lots?.species}</td><td>{r.participants?.buyer_no} {r.participants?.name}</td>
          <td align="right">{r.qty}</td><td align="right">{Number(r.unit_price_jpy).toLocaleString("ja-JP")}</td>
          <td align="right">{Number(r.amount_jpy).toLocaleString("ja-JP")}</td><td>{r.status === "CONFIRMED" ? "確定" : "仮"}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
