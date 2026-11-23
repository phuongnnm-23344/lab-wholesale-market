"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import { DayChecklistTable, openCheckCount } from "@/components/settlement/day-checklist-table";
import { DateTextInput } from "@/components/ui/date-text-input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate, formatNumber, formatYen } from "@/lib/format/display-format";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";

const qtyText = (q: Record<string, number> | undefined) =>
  Object.entries(q ?? {}).map(([u, n]) => `${formatNumber(n)}${u}`).join("・") || "—";

// 日次照合表: per buyer, 相対 / せり / 訂正 (取消・差額 with their own buyer) shown separately before the total,
// quantity per unit, and the 要確認 tab with its count.
export default function DailySettlementPage() {
  const me = useCurrentUser();
  const isHead = me.status === "ready" && me.user.authorities.includes("STL_HEAD");
  const [date, setDate] = useState("");
  const [tab, setTab] = useState<"sum" | "check">("sum");
  const { data, error } = useApiResource<DailySettlement>(`/api/settlement/daily${date ? `?date=${date}` : ""}`);
  const rows = data?.rows ?? [];
  const open = openCheckCount(data);
  const sum = (k: "aitai_jpy" | "seri_jpy" | "correction_jpy") => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0);

  return (
    <>
      <PageHeader title="日次照合表" actions={isHead ? <Link href="/settlement/close" className="button-secondary">日次締めへ</Link> : undefined} />
      <div className="toolbar">
        <label>業務日 <DateTextInput value={date} onChange={setDate} label="業務日" /></label>
        <span>{formatDate(data?.date)}</span>
        {data && (data.dayStatus === "LOCKED" ? <StatusBadge tone="neutral">締め済</StatusBadge> : <StatusBadge tone="warning">未締め</StatusBadge>)}
        <span style={{ flex: 1 }} />
        <button type="button" className={tab === "sum" ? "button-primary" : "button-secondary"} onClick={() => setTab("sum")}>照合表</button>
        <button type="button" className={tab === "check" ? "button-primary" : "button-secondary"} onClick={() => setTab("check")}
          style={open > 0 && tab !== "check" ? { borderColor: "var(--warning)", color: "var(--warning)" } : undefined}>
          要確認（{open}）
        </button>
      </div>
      <ListStates loading={!data} error={error} empty={false}>
        {data && tab === "check" && <DayChecklistTable data={data} />}
        {tab === "sum" && (rows.length === 0 ? <EmptyState text="この業務日の取引はありません。" /> : (
          <>
            <table>
              <thead><tr><th>買受人</th><th className="num">件数</th><th className="num">数量（単位別）</th><th className="num">相対</th><th className="num">せり</th><th className="num">訂正（取消・差額）</th><th className="num">合計</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.buyer_id}>
                  <td>{r.buyer_no} {r.name}</td><td className="num">{r.trade_count}</td><td className="num">{qtyText(r.qty_by_unit)}</td>
                  <td className="num">{formatYen(r.aitai_jpy ?? 0)}</td><td className="num">{formatYen(r.seri_jpy ?? 0)}</td>
                  <td className="num">{r.correction_jpy ? formatYen(r.correction_jpy) : "—"}</td>
                  <td className="num"><strong>{formatYen(r.amount_total_jpy)}</strong></td>
                </tr>
              ))}</tbody>
              <tfoot><tr><th colSpan={3}>合計</th><th className="num">{formatYen(sum("aitai_jpy"))}</th><th className="num">{formatYen(sum("seri_jpy"))}</th><th className="num">{formatYen(sum("correction_jpy"))}</th><th className="num">{formatYen(data?.totalJpy ?? 0)}</th></tr></tfoot>
            </table>
            <p className="muted" style={{ fontSize: 13 }}>取引一覧（相対のみ）の合計とは、せり・訂正の分だけ異なります。訂正は承認された日の業務日に計上されます。</p>
          </>
        ))}
      </ListStates>
    </>
  );
}
