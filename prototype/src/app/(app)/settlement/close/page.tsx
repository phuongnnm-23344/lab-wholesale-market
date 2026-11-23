"use client";

import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";

// SC-07-02 日次締め (照合部門長). Checklist first; closing is final (no unlock — later fixes via 修正申請).
export default function DayClosePage() {
  const { data, reload } = useApiResource<DailySettlement>("/api/settlement/daily");
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const c = data?.checklist;
  const blocked = (c?.seri_unconfirmed ?? 0) > 0;

  async function close() {
    if (!data) return;
    const res = await apiRequest<{ nextBusinessDate: string }>(`/api/business-days/${data.date}/close`, { method: "POST" });
    setMessage(res.ok ? { error: false, text: `${data.date} を締めました。次の業務日：${res.data.nextBusinessDate}` } : { error: true, text: res.message });
    if (res.ok) reload();
  }

  return (
    <section className="card" style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>日次締め（{data?.date ?? "—"}）</h1>
      <ul>
        <li className={blocked ? "error-text" : undefined}>未確定のせり：{c?.seri_unconfirmed ?? 0}回 {blocked ? "→ 確定するまで締められません" : ""}</li>
        <li>入力者が確定したせり：{c?.seri_same_person ?? 0}回（要確認）</li>
        <li>引渡し未完了：{c?.undelivered_trades ?? 0}件（翌日以降も記録可）</li>
        <li>本登録待ちの仮受付：{c?.provisional_lots ?? 0}件</li>
        <li>合計金額：{Number(data?.totalJpy ?? 0).toLocaleString("ja-JP")} 円</li>
      </ul>
      <p className="muted" style={{ margin: 0 }}>締め後は直接修正できません（締め解除の機能はありません）。多要素認証は試作では省略しています。</p>
      <label>確認のため業務日を入力：<input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={data?.date} /></label>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <button type="button" className="button-primary" disabled={blocked || !data || confirmText !== data.date || data.dayStatus === "LOCKED"} onClick={close}>この業務日を締める</button>
      <ScreenIdFooter screenId="SC-07-02" trace="FT-07-04 / FR-SETTLE-02, BR-CLOSE-01" />
    </section>
  );
}
