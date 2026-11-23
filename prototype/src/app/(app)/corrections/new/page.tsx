"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { apiRequest } from "@/lib/http/api-client";

type TradeInfo = { trade: { trade_no: string; business_date: string; qty: number; unit_price_jpy: number; participants: { buyer_no: string } | null } };

// SC-08-01 修正申請作成 (FORM-CORR-01): new qty / price / buyer + mandatory reason. The original trade is
// never edited; approval creates REVERSE + DELTA rows dated on the open business day.
function CorrectionForm() {
  const router = useRouter();
  const tradeId = useSearchParams().get("tradeId") ?? "";
  const { data } = useApiResource<TradeInfo>(tradeId ? `/api/trades/${tradeId}` : null);
  const { buyers } = useSaleOptions();
  const [form, setForm] = useState({ qty: "", price: "", buyerId: "", reason: "" });
  const [message, setMessage] = useState<string | null>(null);
  const t = data?.trade;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<{ id: string }>("/api/corrections", {
      method: "POST",
      body: { tradeId, newQty: Number(form.qty || t?.qty), newUnitPriceJpy: Number(form.price || t?.unit_price_jpy), newBuyerId: form.buyerId, reason: form.reason },
    });
    if (!res.ok) return setMessage(res.message);
    router.push(`/corrections/${res.data.id}`);
  }

  if (!tradeId) return <p>取引詳細の「修正申請」から開いてください。</p>;
  const field = { display: "grid", gap: 4 } as const;
  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 460 }}>
      <p style={{ margin: 0 }}>対象：{t?.trade_no}（{t?.business_date}）現在 {t?.participants?.buyer_no} / {t?.qty} × {t?.unit_price_jpy}円</p>
      <label style={field}>訂正後の数量<input inputMode="decimal" placeholder={String(t?.qty ?? "")} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></label>
      <label style={field}>訂正後の単価（円）<input inputMode="numeric" placeholder={String(t?.unit_price_jpy ?? "")} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
      <label style={field}>訂正後の買受人
        <select required value={form.buyerId} onChange={(e) => setForm({ ...form, buyerId: e.target.value })}>
          <option value="">選択してください（変更しない場合も同じ買受人を選択）</option>
          {buyers.map((b) => <option key={b.id} value={b.id}>{b.buyer_no} {b.name}</option>)}
        </select>
      </label>
      <label style={field}>理由（必須）<input required maxLength={200} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
      {message && <p className="error-text" role="alert">{message}</p>}
      <button type="submit" className="button-primary">修正申請を提出</button>
    </form>
  );
}

export default function NewCorrectionPage() {
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>修正申請作成</h1>
      <Suspense fallback={<p>読み込み中…</p>}><CorrectionForm /></Suspense>
      <ScreenIdFooter screenId="SC-08-01" trace="FT-08-01 / FR-CORR-01, FORM-CORR-01, BR-CLOSE-01" />
    </section>
  );
}
