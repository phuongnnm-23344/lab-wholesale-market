"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { InfoAlert, LoadingState } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate, formatNumber, formatYen } from "@/lib/format/display-format";

type TradeInfo = { trade: { trade_no: string; business_date: string; qty: number; unit_price_jpy: number; participants: { buyer_no: string; name: string } | null } };

// 修正申請作成: new qty / price / buyer + mandatory reason. The original trade is never edited;
// approval creates 取消 + 差額 rows dated on the open business day. Success → 申請の詳細.
function CorrectionForm() {
  const { showToast, toastAndGo } = useToast();
  const tradeId = useSearchParams().get("tradeId") ?? "";
  const { data } = useApiResource<TradeInfo>(tradeId ? `/api/trades/${tradeId}` : null);
  const { buyers } = useSaleOptions();
  const [form, setForm] = useState({ qty: "", price: "", buyerId: "", reason: "" });
  const t = data?.trade;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<{ id: string }>("/api/corrections", {
      method: "POST",
      body: { tradeId, newQty: Number(form.qty || t?.qty), newUnitPriceJpy: Number(form.price || t?.unit_price_jpy), newBuyerId: form.buyerId, reason: form.reason },
    });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo("修正申請を提出しました", `/corrections/${res.data.id}`);
  }

  if (!tradeId) return <InfoAlert>取引確認票の「修正申請を作成」から開いてください。</InfoAlert>;
  if (!t) return <LoadingState />;
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormField label="対象取引">
          <span>{t.trade_no}（{formatDate(t.business_date)}）</span>
          <span className="form-hint">現在：{t.participants?.buyer_no} {t.participants?.name} ／ {formatNumber(t.qty)} × {formatYen(t.unit_price_jpy)}</span>
        </FormField>
        <FormField label="訂正後の数量" hint="変更しない場合は空欄">
          <input inputMode="decimal" placeholder={String(t.qty)} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        </FormField>
        <FormField label="訂正後の単価（円）" hint="変更しない場合は空欄">
          <input inputMode="numeric" placeholder={String(t.unit_price_jpy)} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </FormField>
        <FormField label="訂正後の買受人" required hint="変更しない場合も同じ買受人を選択してください">
          <select required value={form.buyerId} onChange={(e) => setForm({ ...form, buyerId: e.target.value })}>
            <option value="">選択してください</option>
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.buyer_no} {b.name}</option>)}
          </select>
        </FormField>
        <FormField label="理由" required>
          <input required maxLength={200} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </FormField>
      </div>
      <div className="form-actions">
        <button type="submit" className="button-primary">修正申請を提出</button>
        <Link href={`/trades/${tradeId}`} className="button-secondary">キャンセル</Link>
      </div>
    </form>
  );
}

export default function NewCorrectionPage() {
  return (
    <>
      <PageHeader title="修正申請作成" />
      <Suspense fallback={<LoadingState />}><CorrectionForm /></Suspense>
    </>
  );
}
