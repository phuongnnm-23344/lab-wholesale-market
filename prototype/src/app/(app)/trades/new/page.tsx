"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { DayLockedNotice } from "@/components/common/day-locked-notice";
import { fieldForError, LotAndBuyerFields, type SaleField } from "@/components/trades/lot-and-buyer-fields";
import { isRepeatOfLastTrade, rememberLastTrade } from "@/components/trades/repeat-trade-guard";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { enterMovesToNextField } from "@/components/ui/enter-moves-to-next-field";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatNumber, formatYen } from "@/lib/format/display-format";

type Confirmed = { trade_id: string; trade_no: string; amount_jpy: number; over_limit: boolean };


// 相対取引入力・確定 — the MAIN screen (rule 1). Type lot no. / buyer no., qty, price; Enter moves to the
// next field and confirms on 単価. The server re-checks 許可 / 承認 and quantity at this moment.
// After a confirmation the form stays open (DEC-033): same lot kept, 残 refreshed, other fields cleared,
// focus back on 買受人 for the next buyer; the toast links to the 取引確認票.
export default function AitaiEntryPage() {
  const { lots, buyers, error, reloadLots } = useSaleOptions();
  const { showToast } = useToast();
  const [formKey, setFormKey] = useState(0);
  const [form, setForm] = useState({ lotId: "", buyerId: "", qty: "", price: "" });
  const [errors, setErrors] = useState<Partial<Record<SaleField, string>>>({});
  const [reason, setReason] = useState("");
  const [needReason, setNeedReason] = useState(false);
  const [locked, setLocked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const amount = Math.floor(Number(form.qty) * Number(form.price)) || 0;
  const lot = lots.find((l) => l.id === form.lotId);
  const buyer = buyers.find((b) => b.id === form.buyerId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const entry = { lotId: form.lotId, buyerId: form.buyerId, qty: form.qty, price: form.price };
    if (isRepeatOfLastTrade(entry) && !window.confirm("直前に確定した取引と同じ内容です。もう一度確定しますか？")) return;
    setSubmitting(true);
    const res = await apiRequest<Confirmed>("/api/trades/aitai", {
      method: "POST",
      body: { lotId: form.lotId, buyerId: form.buyerId, qty: Number(form.qty), unitPriceJpy: Number(form.price), overLimitReason: reason },
    });
    setSubmitting(false);
    if (!res.ok) {
      const over = res.message.includes("参加上限");
      setNeedReason(over);
      setLocked(res.status === 423 ? res.message : null);
      setErrors({ [fieldForError(res.message)]: res.message });
      if (over) setTimeout(() => document.getElementById("f-reason")?.focus(), 0);
      return showToast(res.message, "error");
    }
    rememberLastTrade(entry);
    const what = `${buyer?.buyer_no} ${buyer?.name}／${lot?.species} ${formatNumber(form.qty)}${lot?.unit} × ${formatYen(form.price)} = ${formatYen(res.data.amount_jpy)}`;
    const over = res.data.over_limit ? "（参加上限超過・理由記録済）" : "";
    showToast(`確定：${what}（${res.data.trade_no}）${over}`, "success", { href: `/trades/${res.data.trade_id}`, label: "詳細を見る" });
    setForm((f) => ({ lotId: f.lotId, buyerId: "", qty: "", price: "" }));
    setReason("");
    setNeedReason(false);
    setErrors({});
    setFormKey((k) => k + 1); // re-mounts the fields: lot kept, buyer text cleared
    reloadLots();
    setTimeout(() => document.getElementById("f-buyer")?.focus(), 0);
  }

  return (
    <>
      <PageHeader title="相対取引入力・確定" actions={<Link href="/trades" className="button-secondary">取引一覧</Link>} />
      <ErrorAlert message={error} />
      {locked && <DayLockedNotice detail={locked} />}
      <form onSubmit={handleSubmit} onKeyDown={enterMovesToNextField}>
        <div className="form-grid">
          <LotAndBuyerFields key={formKey} lots={lots} buyers={buyers} {...form} errors={errors} priceNext={needReason ? "f-reason" : undefined}
            onChange={(field, value) => { setErrors((e) => ({ ...e, [field]: undefined })); setForm((f) => ({ ...f, [field]: value })); }} />
          {needReason && (
            <FormField label="参加上限の超過理由" required htmlFor="f-reason">
              <input id="f-reason" required value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
            </FormField>
          )}
          <FormField label="金額（税抜）">
            <strong style={{ fontSize: 20 }}>{formatYen(amount)}</strong>
          </FormField>
        </div>
        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={submitting}>{submitting ? "確定中…" : "確定する"}</button>
          <Link href="/trades" className="button-secondary">キャンセル</Link>
          <span className="form-hint" style={{ alignSelf: "center" }}>Enter で次の項目へ移動し、最後の項目（単価）で Enter を押すと確定します。</span>
        </div>
      </form>
    </>
  );
}
