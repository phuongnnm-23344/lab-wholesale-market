"use client";

import { useState } from "react";
import { DayLockedNotice } from "@/components/common/day-locked-notice";
import { TabletNumericPad } from "@/components/common/tablet-numeric-pad";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorAlert } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate, formatNumber } from "@/lib/format/display-format";

type Pending = { trade_id: string; trade_no: string; business_date: string; effective_qty: number; delivered_qty: number };

// 引渡し記録（タブレット）: search by 買受人番号, deliver part or 「残り全部」 (several deliveries per
// trade). Online only. Continuous work: after each record the toast confirms and the list refreshes.
export default function DeliveryPage() {
  const { showToast } = useToast();
  const [buyerNo, setBuyerNo] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<string | null>(null);
  const { data, reload } = useApiResource<{ buyer: { name: string; buyer_no: string } | null; pending: Pending[] }>(
    query ? `/api/deliveries?buyerNo=${encodeURIComponent(query)}` : null);

  async function deliver(tradeId: string, allRemaining: boolean) {
    const body = allRemaining ? { tradeId, allRemaining: true } : { tradeId, qty: Number(qty[tradeId]) };
    const res = await apiRequest<{ delivered: number; effective: number; complete: boolean }>("/api/deliveries", { method: "POST", body });
    setLocked(!res.ok && res.status === 423 ? res.message : null);
    if (!res.ok) return showToast(res.message, "error");
    showToast(`引渡しを記録しました（${formatNumber(res.data.delivered)} / ${formatNumber(res.data.effective)}${res.data.complete ? "・引渡完了" : ""}）`);
    setQty((q) => ({ ...q, [tradeId]: "" }));
    reload();
  }

  return (
    <div className="tablet-screen">
      <PageHeader title="引渡し記録" />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 600 }}>買受人番号<br />
            <input value={buyerNo} onChange={(e) => setBuyerNo(e.target.value.toUpperCase())} style={{ width: 220 }} />
          </label>
          <div className="page-actions">
            {["N", "B"].map((p) => <button key={p} type="button" className="button-secondary button-large" onClick={() => setBuyerNo(p)}>{p}</button>)}
            <button type="button" className="button-primary button-large" onClick={() => setQuery(buyerNo)}>検索</button>
          </div>
        </div>
        <TabletNumericPad onKey={(k) => setBuyerNo((v) => (k === "C" ? "" : k === "←" ? v.slice(0, -1) : v + k))} />
      </div>
      {locked && <DayLockedNotice detail={locked} />}
      {data?.buyer === null && <ErrorAlert message="該当する買受人がありません。" />}
      {data?.buyer && (
        <>
          <h2>{data.buyer.buyer_no} {data.buyer.name} — 未引渡し {data.pending.length}件</h2>
          {data.pending.length === 0 ? <EmptyState text="未引渡しの取引はありません。" /> : (
            <table>
              <thead><tr><th>取引番号</th><th>取引日</th><th className="num">引渡済 / 数量</th><th>今回の数量</th><th>操作</th></tr></thead>
              <tbody>{data.pending.map((t) => (
                <tr key={t.trade_id}>
                  <td>{t.trade_no}</td><td>{formatDate(t.business_date)}</td>
                  <td className="num">{formatNumber(t.delivered_qty)} / {formatNumber(t.effective_qty)}</td>
                  <td><input inputMode="decimal" aria-label={`${t.trade_no}の数量`} value={qty[t.trade_id] ?? ""} style={{ width: 120 }}
                    onChange={(e) => setQty((q) => ({ ...q, [t.trade_id]: e.target.value }))} /></td>
                  <td className="page-actions">
                    <button type="button" className="button-secondary button-large" disabled={!(Number(qty[t.trade_id]) > 0)} onClick={() => deliver(t.trade_id, false)}>記録</button>
                    <button type="button" className="button-primary button-large" onClick={() => deliver(t.trade_id, true)}>残り全部</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
