"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { yen, type PeriodDetail } from "@/lib/periods/period-types";

// SC-09-03 期別お支払額・入金状況: payable = floor(amount × 110/100) per buyer; 完納 = paid on or before 期日
// (no grace, BR-INC-01). Simplified calculation — mock M08 (one tax rate, no 端数調整).
export default function PeriodPayablesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<PeriodDetail>(`/api/periods/${id}`);
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!data) return <p>読み込み中…</p>;
  const p = data.period;
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>{p.period_code} お支払額・入金状況（期日 {p.due_date}・{p.status === "LOCKED" ? "期ロック済" : "未ロック"}）</h1>
      <p className="muted" style={{ margin: 0 }}>試算ロジックは簡略化（サンプル）：税率1種・端数調整なし・入金は翌月分を当期に充当。</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead><tr><th align="left">買受人</th><th align="right">お支払額（税込）</th><th align="right">期日までの入金</th><th align="right">入金合計</th><th align="left">完納</th></tr></thead>
        <tbody>{data.payables.map((r) => (
          <tr key={r.participant_id} style={{ borderTop: "1px solid var(--border)" }}>
            <td>{r.buyer_no} {r.name}</td><td align="right">{yen(r.payable_jpy)}</td><td align="right">{yen(r.paid_on_time_jpy)}</td>
            <td align="right">{yen(r.paid_total_jpy)}</td><td className={r.kanno ? undefined : "error-text"}>{r.kanno ? "完納" : "未完納"}</td>
          </tr>
        ))}</tbody>
      </table>
      <p><Link href={`/periods/${id}/incentives`}>奨励金計算・期ロックへ</Link></p>
      <ScreenIdFooter screenId="SC-09-03" trace="FT-09-04, FT-09-05 / BR-INC-01, FR-INC-01（簡略化：M08）" />
    </section>
  );
}
