"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { DayLockedNotice } from "@/components/common/day-locked-notice";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { LotAndBuyerFields } from "@/components/trades/lot-and-buyer-fields";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { apiRequest } from "@/lib/http/api-client";

type Confirmed = { trade_id: string; trade_no: string; amount_jpy: number; over_limit: boolean };

// SC-04-01 相対取引入力・確定 — the MAIN screen (rule 1). Select lot / buyer, enter qty + price,
// check the summary, confirm with Enter. The server re-checks 許可 / 承認 and quantity at this moment.
export default function AitaiEntryPage() {
  const { lots, buyers, reloadLots, error } = useSaleOptions();
  const [form, setForm] = useState({ lotId: "", buyerId: "", qty: "", price: "" });
  const [reason, setReason] = useState("");
  const [needReason, setNeedReason] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string; tradeId?: string; status?: number } | null>(null);
  const first = useRef<HTMLSelectElement>(null);
  const amount = Math.floor(Number(form.qty) * Number(form.price)) || 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<Confirmed>("/api/trades/aitai", {
      method: "POST",
      body: { lotId: form.lotId, buyerId: form.buyerId, qty: Number(form.qty), unitPriceJpy: Number(form.price), overLimitReason: reason },
    });
    if (!res.ok) {
      setNeedReason(res.message.includes("参加上限"));
      return setMessage({ error: true, text: res.message, status: res.status });
    }
    setMessage({ error: false, text: `確定しました：${res.data.trade_no}（${res.data.amount_jpy.toLocaleString("ja-JP")}円）${res.data.over_limit ? "・参加上限超過（理由記録済）" : ""}`, tradeId: res.data.trade_id });
    setForm({ lotId: form.lotId, buyerId: "", qty: "", price: "" });
    setReason("");
    setNeedReason(false);
    reloadLots();
    first.current?.focus();
  }

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>相対取引入力・確定</h1>
      {error && <p className="error-text" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 460 }}>
        <LotAndBuyerFields lots={lots} buyers={buyers} {...form} firstRef={first}
          onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))} />
        {needReason && (
          <label style={{ display: "grid", gap: 4 }}>参加上限の超過理由（必須）
            <input required value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
          </label>
        )}
        <p style={{ margin: 0 }}>金額（税抜）：<strong>{amount.toLocaleString("ja-JP")} 円</strong></p>
        {message?.status === 423 && <DayLockedNotice detail={message.text} />}
        {message && message.status !== 423 && (
          <p className={message.error ? "error-text" : undefined} role="status">
            {message.text} {message.tradeId && <Link href={`/trades/${message.tradeId}`}>取引確認票を見る</Link>}
          </p>
        )}
        <button type="submit" className="button-primary">確定（Enter）</button>
      </form>
      <ScreenIdFooter screenId="SC-04-01" trace="FT-04-01..03, FT-01-05, FT-01-09 / FR-AITAI-01/02, BR-PERM-01, BR-LOT-02, NFR-USE-01" />
    </section>
  );
}
