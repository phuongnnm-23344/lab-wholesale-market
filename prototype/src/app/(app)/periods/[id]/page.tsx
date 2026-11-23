"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorAlert, InfoAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { formatDate } from "@/lib/format/display-format";
import { yen, type PeriodDetail } from "@/lib/periods/period-types";

// 期別お支払額・入金状況: payable = floor(amount × 110/100) per buyer; 完納 = paid on or before 期日
// (no grace). The calculation is simplified for the prototype (one tax rate, no rounding adjustment).
export default function PeriodPayablesPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useApiResource<PeriodDetail>(`/api/periods/${id}`);
  const title = data ? `お支払額・入金状況（${data.period.period_code}）` : "お支払額・入金状況";
  const actions = (
    <>
      <Link href="/periods" className="button-secondary">期の一覧へ戻る</Link>
      <Link href={`/periods/${id}/incentives`} className="button-primary">奨励金計算・期ロックへ</Link>
    </>
  );
  if (error) return <><PageHeader title={title} actions={actions} /><ErrorAlert message={error} /></>;
  if (!data) return <><PageHeader title={title} actions={actions} /><LoadingState /></>;
  const p = data.period;
  return (
    <>
      <PageHeader title={title} actions={actions} />
      <div className="toolbar">
        <span>支払期日 <strong>{formatDate(p.due_date)}</strong></span>
        {p.status === "LOCKED" ? <StatusBadge tone="neutral">期ロック済</StatusBadge> : <StatusBadge tone="warning">未ロック</StatusBadge>}
      </div>
      <InfoAlert>試算ロジックは簡略化しています（税率1種・端数調整なし・入金は翌月分を当期に充当）。</InfoAlert>
      {data.payables.length === 0 ? <EmptyState text="この期のお支払額はありません。" /> : (
        <table>
          <thead><tr><th>買受人</th><th className="num">お支払額（税込）</th><th className="num">期日までの入金</th><th className="num">入金合計</th><th>完納</th></tr></thead>
          <tbody>{data.payables.map((r) => (
            <tr key={r.participant_id}>
              <td>{r.buyer_no} {r.name}</td><td className="num">{yen(r.payable_jpy)}</td><td className="num">{yen(r.paid_on_time_jpy)}</td>
              <td className="num">{yen(r.paid_total_jpy)}</td>
              <td>{r.kanno ? <StatusBadge tone="success">完納</StatusBadge> : <StatusBadge tone="danger">未完納</StatusBadge>}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}
