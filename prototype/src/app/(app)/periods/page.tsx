"use client";

import Link from "next/link";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import type { PeriodRow } from "@/lib/periods/period-types";

// Period list → SC-09-03 (お支払額・入金状況) and SC-09-04 (奨励金計算・期ロック).
export default function PeriodListPage() {
  const { data, error } = useApiResource<{ periods: PeriodRow[] }>("/api/periods");
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>期別お支払額・完納奨励金</h1>
      <p><Link href="/payments/import">入金CSV取込へ</Link></p>
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th align="left">期</th><th align="left">期間</th><th align="left">支払期日</th><th align="left">奨励金計算</th><th align="left">状態</th><th /></tr></thead>
        <tbody>{(data?.periods ?? []).map((p) => (
          <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
            <td>{p.period_code}</td><td>{p.start_date}〜{p.end_date}</td><td>{p.due_date}</td>
            <td>{p.run_at ? "計算済" : "未計算"}</td><td>{p.status === "LOCKED" ? "期ロック済" : "未ロック"}</td>
            <td><Link href={`/periods/${p.id}`}>お支払額</Link> ・ <Link href={`/periods/${p.id}/incentives`}>奨励金</Link></td>
          </tr>
        ))}</tbody>
      </table>
      <ScreenIdFooter screenId="SC-09-03" trace="FT-09-04, FT-09-05 / BR-INC-01, FR-INC-01" />
    </section>
  );
}
