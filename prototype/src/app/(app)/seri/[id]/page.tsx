"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { LotAndBuyerFields } from "@/components/trades/lot-and-buyer-fields";
import { SeriResultsTable, type SeriSessionDetail } from "@/components/trades/seri-results-table";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, LoadingState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";

// せり結果入力: enter the final result rows of one session (仮). Stock moves only when a
// second person confirms the session.
export default function SeriEntryPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useApiResource<SeriSessionDetail>(`/api/seri-sessions/${id}`);
  const { lots, buyers } = useSaleOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState({ lotId: "", buyerId: "", qty: "", price: "" });
  const session = detail.data?.session;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest(`/api/seri-sessions/${id}/results`, {
      method: "POST", body: { lotId: form.lotId, buyerId: form.buyerId, qty: Number(form.qty), unitPriceJpy: Number(form.price) },
    });
    if (!res.ok) return showToast(res.message, "error");
    showToast("結果を追加しました（仮）");
    setForm({ ...form, buyerId: "", qty: "", price: "" });
    detail.reload();
  }

  const title = session ? `せり結果入力（第${session.session_no}回）` : "せり結果入力";
  if (detail.error) return <><PageHeader title={title} /><ErrorAlert message={detail.error} /></>;
  if (!session) return <><PageHeader title={title} /><LoadingState /></>;
  const open = session.status !== "CONFIRMED";
  const actions = (
    <>
      <Link href="/seri" className="button-secondary">回の一覧へ戻る</Link>
      {open && <Link href={`/seri/${id}/confirm`} className="button-primary">確認・確定へ</Link>}
    </>
  );
  return (
    <>
      <PageHeader title={title} actions={actions} />
      <p>
        {open ? <StatusBadge tone="warning">入力中</StatusBadge> : <StatusBadge tone="success">確定済</StatusBadge>}{" "}
        <span className="muted">入力者：{session.entered_by ? detail.data?.staff[session.entered_by] : "—"}</span>
      </p>
      <SeriResultsTable results={detail.data?.results ?? []} />
      {open && (
        <form onSubmit={handleSubmit}>
          <h2>結果を追加</h2>
          <div className="form-grid">
            <LotAndBuyerFields lots={lots} buyers={buyers} {...form} onChange={(f, v) => setForm((x) => ({ ...x, [f]: v }))} />
          </div>
          <div className="form-actions"><button type="submit" className="button-primary">結果を追加</button></div>
        </form>
      )}
    </>
  );
}
