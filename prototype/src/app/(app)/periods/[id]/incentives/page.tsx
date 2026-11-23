"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, InfoAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/format/display-format";
import { yen, type IncentiveRow, type PeriodDetail } from "@/lib/periods/period-types";

// 奨励金計算・期ロック: 試算 (writes nothing) → 計算 (once per period; 当期 + 差額 for locked earlier
// periods changed by 修正申請) → 期ロック (opens the next period). 照合部門長 only.
export default function IncentivePage() {
  const { id } = useParams<{ id: string }>();
  const { data, reload } = useApiResource<PeriodDetail>(`/api/periods/${id}`);
  const { showToast, toastAndGo } = useToast();
  const [preview, setPreview] = useState<IncentiveRow[] | null>(null);
  const title = data ? `完納奨励金（${data.period.period_code}）` : "完納奨励金";
  if (!data) return <><PageHeader title={title} /><LoadingState /></>;
  const head = data.me.authorities.includes("STL_HEAD");
  const open = data.period.status === "OPEN";

  async function act(action: "preview" | "run" | "lock") {
    const res = await apiRequest<{ result: unknown }>(`/api/periods/${id}`, { method: "POST", body: { action } });
    if (!res.ok) return showToast(res.message, "error");
    if (action === "lock") return toastAndGo(`期ロックしました（次の期：${res.data.result}）`, "/periods");
    if (action === "preview") setPreview(res.data.result as IncentiveRow[]);
    showToast(action === "preview" ? "試算しました（保存はしていません）" : "計算結果を記録しました");
    reload();
  }
  const rows = preview ?? data.results;
  const name = (r: IncentiveRow) => (r.participants ? `${r.participants.buyer_no} ${r.participants.name}` : `${r.buyer_no} ${r.name}`);

  return (
    <>
      <PageHeader title={title} actions={<Link href={`/periods/${id}`} className="button-secondary">お支払額へ戻る</Link>} />
      <div className="toolbar">
        <span>適用規則版 第{data.ruleVersionNo ?? "—"}版</span>
        {data.runAt ? <StatusBadge tone="success">計算済（{formatDateTime(data.runAt)}）</StatusBadge> : <StatusBadge tone="neutral">未計算</StatusBadge>}
        {open ? <StatusBadge tone="warning">未ロック</StatusBadge> : <StatusBadge tone="neutral">期ロック済</StatusBadge>}
        {preview && <StatusBadge tone="info">試算結果を表示中</StatusBadge>}
      </div>
      <InfoAlert>試算ロジックは簡略化しています。計算は1期につき1回のみ記録できます。</InfoAlert>
      {open && (
        <div className="page-actions" style={{ marginBottom: 12 }}>
          <button type="button" className="button-secondary" onClick={() => act("preview")}>試算</button>
          {head && <button type="button" className="button-primary" disabled={Boolean(data.runAt)} onClick={() => act("run")}>計算して記録</button>}
          {head && <ConfirmButton label="期ロック" disabled={!data.runAt} message="この期をロックします。ロック後は元に戻せません。よろしいですか？" confirmLabel="ロックする" onConfirm={() => act("lock")} />}
        </div>
      )}
      {rows.length === 0 ? <EmptyState text="計算結果はまだありません。「試算」で内容を確認できます。" /> : (
        <table>
          <thead><tr><th>区分</th><th>買受人</th><th className="num">お支払額</th><th className="num">入金</th><th>完納</th><th className="num">奨励金</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.id ?? i}>
              <td>{r.kind === "MAIN" ? "当期" : `差額（${r.payment_periods?.period_code ?? "前期"}分）`}</td><td>{name(r)}</td>
              <td className="num">{yen(r.payable_jpy)}</td><td className="num">{yen(r.paid_jpy)}</td>
              <td>{r.kanno ? <StatusBadge tone="success">完納</StatusBadge> : <StatusBadge tone="danger">未完納</StatusBadge>}</td>
              <td className="num">{yen(r.incentive_jpy)}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </>
  );
}
