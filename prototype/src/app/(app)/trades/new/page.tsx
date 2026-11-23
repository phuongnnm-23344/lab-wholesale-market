"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { DayLockedNotice } from "@/components/common/day-locked-notice";
import { LotAndBuyerFields } from "@/components/trades/lot-and-buyer-fields";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatYen } from "@/lib/format/display-format";

type Confirmed = { trade_id: string; trade_no: string; amount_jpy: number; over_limit: boolean };

// 相対取引入力・確定 — the MAIN screen (rule 1). Select lot / buyer, enter qty + price,
// check the amount, confirm. The server re-checks 許可 / 承認 and quantity at this moment.
// Success → toast + 取引確認票; error → toast, input kept.
export default function AitaiEntryPage() {
  const { lots, buyers, error } = useSaleOptions();
  const { showToast, toastAndGo } = useToast();
  const [form, setForm] = useState({ lotId: "", buyerId: "", qty: "", price: "" });
  const [reason, setReason] = useState("");
  const [needReason, setNeedReason] = useState(false);
  const [locked, setLocked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const first = useRef<HTMLSelectElement>(null);
  const amount = Math.floor(Number(form.qty) * Number(form.price)) || 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const res = await apiRequest<Confirmed>("/api/trades/aitai", {
      method: "POST",
      body: { lotId: form.lotId, buyerId: form.buyerId, qty: Number(form.qty), unitPriceJpy: Number(form.price), overLimitReason: reason },
    });
    setSubmitting(false);
    if (!res.ok) {
      setNeedReason(res.message.includes("参加上限"));
      setLocked(res.status === 423 ? res.message : null);
      return showToast(res.message, "error");
    }
    const over = res.data.over_limit ? "（参加上限超過・理由記録済）" : "";
    toastAndGo(`取引を確定しました：${res.data.trade_no} ${formatYen(res.data.amount_jpy)}${over}`, `/trades/${res.data.trade_id}`);
  }

  return (
    <>
      <PageHeader title="相対取引入力・確定" actions={<Link href="/trades" className="button-secondary">取引一覧</Link>} />
      <ErrorAlert message={error} />
      {locked && <DayLockedNotice detail={locked} />}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <LotAndBuyerFields lots={lots} buyers={buyers} {...form} firstRef={first}
            onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))} />
          {needReason && (
            <FormField label="参加上限の超過理由" required htmlFor="f-reason">
              <input id="f-reason" required value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
            </FormField>
          )}
          <FormField label="金額（税抜）">
            <strong style={{ fontSize: 18 }}>{formatYen(amount)}</strong>
          </FormField>
        </div>
        <div className="form-actions">
          <button type="submit" className="button-primary" disabled={submitting}>{submitting ? "確定中…" : "確定する（Enter）"}</button>
          <Link href="/trades" className="button-secondary">キャンセル</Link>
        </div>
      </form>
    </>
  );
}
