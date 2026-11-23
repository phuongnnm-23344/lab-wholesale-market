"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { SeriResultsTable, type SeriSessionDetail } from "@/components/trades/seri-results-table";
import { apiRequest } from "@/lib/http/api-client";

// SC-05-02 せり結果確認: a second person confirms the whole session (CAP-HUMAN-01). If the entry person
// confirms alone, a reason is mandatory (S2, FR-SERI-02). A result over the buyer's 参加上限 needs a reason
// typed by the confirmer for THAT result (decision 2026-11-23; assumption awaiting the customer).
export default function SeriConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, reload } = useApiResource<SeriSessionDetail>(`/api/seri-sessions/${id}`);
  const [reason, setReason] = useState("");
  const [overLimit, setOverLimit] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!data) return <p>読み込み中…</p>;
  const { session, staff, me } = data;
  const samePerson = session.entered_by === me;

  async function confirm() {
    const reasons = Object.fromEntries(Object.entries(overLimit).filter(([, v]) => v.trim()));
    const res = await apiRequest<{ confirmed: number }>(`/api/seri-sessions/${id}/confirm`, {
      method: "POST", body: { samePersonReason: reason, overLimitReasons: reasons },
    });
    setMessage(res.ok ? { error: false, text: `${res.data.confirmed}件を確定しました` } : { error: true, text: res.message });
    if (res.ok) reload();
  }

  return (
    <section className="card" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>せり結果確認 第{session.session_no}回</h1>
      <p style={{ margin: 0 }}>入力者：{session.entered_by ? staff[session.entered_by] : "—"}
        {session.confirmed_by && <> ／ 確定者：{staff[session.confirmed_by]}（{new Date(session.confirmed_at ?? "").toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}）</>}
      </p>
      <SeriResultsTable results={data.results} />
      {session.status === "CONFIRMED" ? (
        <p>確定済{session.same_person_reason ? `（入力者が確定。理由：${session.same_person_reason}）` : ""}</p>
      ) : (
        <>
          <details>
            <summary>参加上限を超える結果がある場合の理由（結果ごと）</summary>
            {data.results.map((r) => (
              <label key={r.id} style={{ display: "grid", gap: 4, marginTop: 6 }}>{r.trade_no} {r.participants?.buyer_no}
                <input value={overLimit[r.id] ?? ""} maxLength={200} onChange={(e) => setOverLimit((o) => ({ ...o, [r.id]: e.target.value }))} />
              </label>
            ))}
          </details>
          {samePerson && (
            <label style={{ display: "grid", gap: 4 }}>あなたはこの回の入力者です。確定する理由（必須）
              <input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
            </label>
          )}
          {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
          <button type="button" className="button-primary" disabled={samePerson && !reason.trim()} onClick={confirm}>この回の結果を確定する</button>
        </>
      )}
      <ScreenIdFooter screenId="SC-05-02" trace="FT-05-02, FT-01-05, FT-01-09 / FR-SERI-02, BR-PERM-01, CAP-HUMAN-01" />
    </section>
  );
}
