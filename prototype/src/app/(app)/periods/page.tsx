"use client";

import Link from "next/link";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate } from "@/lib/format/display-format";
import type { PeriodRow } from "@/lib/periods/period-types";

// 期の一覧 → お支払額・入金状況 / 奨励金計算・期ロック.
export default function PeriodListPage() {
  const { data, error } = useApiResource<{ periods: PeriodRow[] }>("/api/periods");
  const periods = data?.periods ?? [];
  return (
    <>
      <PageHeader title="期別お支払額・奨励金" actions={<Link href="/payments/import" className="button-secondary">入金CSV取込</Link>} />
      <ListStates loading={!data} error={error} empty={periods.length === 0} emptyText="期のデータはありません。">
        <table>
          <thead><tr><th>期</th><th>期間</th><th>支払期日</th><th>奨励金計算</th><th>状態</th><th>操作</th></tr></thead>
          <tbody>{periods.map((p) => (
            <tr key={p.id}>
              <td>{p.period_code}</td><td>{formatDate(p.start_date)} 〜 {formatDate(p.end_date)}</td><td>{formatDate(p.due_date)}</td>
              <td>{p.run_at ? <StatusBadge tone="success">計算済</StatusBadge> : <StatusBadge tone="neutral">未計算</StatusBadge>}</td>
              <td>{p.status === "LOCKED" ? <StatusBadge tone="neutral">期ロック済</StatusBadge> : <StatusBadge tone="warning">未ロック</StatusBadge>}</td>
              <td><Link href={`/periods/${p.id}`}>お支払額</Link>　<Link href={`/periods/${p.id}/incentives`}>奨励金</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </ListStates>
    </>
  );
}
