"use client";

import { useState } from "react";
import { ApiResultMessage, type ResultMessage } from "@/components/common/day-locked-notice";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { TabletNumericPad } from "@/components/common/tablet-numeric-pad";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";

type Pending = { trade_id: string; trade_no: string; business_date: string; effective_qty: number; delivered_qty: number };
const big = { minHeight: 56, fontSize: 20, padding: "8px 14px", borderRadius: 8 } as const;

// SC-06-02 引渡し記録（タブレット）: search by 買受人番号, deliver part or 「残り全部」 (several deliveries per
// trade, BR-DEL-03). SC-06-01 is merged here. Online only (offline = mock M04); 例外・争い = mock M16.
export default function DeliveryPage() {
  const [buyerNo, setBuyerNo] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<ResultMessage>(null);
  const { data, reload } = useApiResource<{ buyer: { name: string; buyer_no: string } | null; pending: Pending[] }>(
    query ? `/api/deliveries?buyerNo=${encodeURIComponent(query)}` : null);

  async function deliver(tradeId: string, allRemaining: boolean) {
    const body = allRemaining ? { tradeId, allRemaining: true } : { tradeId, qty: Number(qty[tradeId]) };
    const res = await apiRequest<{ delivered: number; effective: number; complete: boolean }>("/api/deliveries", { method: "POST", body });
    setMessage(res.ok
      ? { error: false, text: `記録しました（${res.data.delivered}/${res.data.effective}${res.data.complete ? "・引渡完了" : ""}）` }
      : { error: true, text: res.message, status: res.status });
    if (res.ok) reload();
  }

  return (
    <section className="card" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>引渡し記録</h1>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 20 }}>買受人番号<br /><input value={buyerNo} onChange={(e) => setBuyerNo(e.target.value.toUpperCase())} style={{ ...big, width: 200 }} /></label>
          <div style={{ display: "flex", gap: 8 }}>
            {["N", "B"].map((p) => <button key={p} type="button" style={big} onClick={() => setBuyerNo(p)}>{p}</button>)}
            <button type="button" className="button-primary" style={big} onClick={() => setQuery(buyerNo)}>検索</button>
          </div>
        </div>
        <TabletNumericPad onKey={(k) => setBuyerNo((v) => (k === "C" ? "" : k === "←" ? v.slice(0, -1) : v + k))} />
      </div>
      {data?.buyer === null && <p className="error-text">該当する買受人がありません</p>}
      {data?.buyer && <p style={{ margin: 0, fontSize: 18 }}>{data.buyer.buyer_no} {data.buyer.name} — 未引渡し {data.pending.length}件</p>}
      {(data?.pending ?? []).map((t) => (
        <div key={t.trade_id} className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <strong>{t.trade_no}</strong>
          <span>{t.business_date} 済 {t.delivered_qty} / {t.effective_qty}</span>
          <input inputMode="decimal" placeholder="数量" value={qty[t.trade_id] ?? ""} style={{ ...big, width: 120 }}
            onChange={(e) => setQty((q) => ({ ...q, [t.trade_id]: e.target.value }))} />
          <button type="button" style={big} disabled={!(Number(qty[t.trade_id]) > 0)} onClick={() => deliver(t.trade_id, false)}>記録</button>
          <button type="button" className="button-primary" style={big} onClick={() => deliver(t.trade_id, true)}>残り全部</button>
        </div>
      ))}
      <ApiResultMessage message={message} />
      <ScreenIdFooter screenId="SC-06-02" trace="FT-06-01..03 / FR-DEL-01/02/05, BR-DEL-03（オフライン・例外登録は試作対象外）" />
    </section>
  );
}
