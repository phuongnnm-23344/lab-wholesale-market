"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { LotAndBuyerFields } from "@/components/trades/lot-and-buyer-fields";
import { SeriResultsTable, type SeriSessionDetail } from "@/components/trades/seri-results-table";
import { useSaleOptions } from "@/components/trades/use-sale-options";
import { apiRequest } from "@/lib/http/api-client";

// SC-05-01 せり結果入力: enter the final result rows of one session (仮). Stock moves only when a
// person confirms the session on SC-05-02.
export default function SeriEntryPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useApiResource<SeriSessionDetail>(`/api/seri-sessions/${id}`);
  const { lots, buyers } = useSaleOptions();
  const [form, setForm] = useState({ lotId: "", buyerId: "", qty: "", price: "" });
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const session = detail.data?.session;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest(`/api/seri-sessions/${id}/results`, {
      method: "POST", body: { lotId: form.lotId, buyerId: form.buyerId, qty: Number(form.qty), unitPriceJpy: Number(form.price) },
    });
    setMessage(res.ok ? { error: false, text: "追加しました（仮）" } : { error: true, text: res.message });
    if (res.ok) {
      setForm({ ...form, buyerId: "", qty: "", price: "" });
      detail.reload();
    }
  }

  if (detail.error) return <p className="error-text" role="alert">{detail.error}</p>;
  if (!session) return <p>読み込み中…</p>;
  return (
    <section className="card" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>せり結果入力 第{session.session_no}回（{session.status === "CONFIRMED" ? "確定済" : "入力中"}）</h1>
      <p className="muted" style={{ margin: 0 }}>入力者：{session.entered_by ? detail.data?.staff[session.entered_by] : "—"}</p>
      <SeriResultsTable results={detail.data?.results ?? []} />
      {session.status !== "CONFIRMED" && (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 460 }}>
          <LotAndBuyerFields lots={lots} buyers={buyers} {...form} onChange={(f, v) => setForm((x) => ({ ...x, [f]: v }))} />
          {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
          <button type="submit" className="button-primary">結果を追加</button>
        </form>
      )}
      {session.status !== "CONFIRMED" && <Link href={`/seri/${id}/confirm`}>確認者による確定へ</Link>}
      <ScreenIdFooter screenId="SC-05-01" trace="FT-05-01 / FR-SERI-01/02, FORM-SERI-01" />
    </section>
  );
}
