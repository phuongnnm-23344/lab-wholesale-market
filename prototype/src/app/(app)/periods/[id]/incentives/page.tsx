"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import { yen, type IncentiveRow, type PeriodDetail } from "@/lib/periods/period-types";

// SC-09-04 奨励金計算・期ロック: 試算 (writes nothing) → 計算 (once per period; MAIN for this period + DELTA for
// locked earlier periods changed by CORR, PRM-043) → 期ロック (opens the next period). 照合部門長 only.
export default function IncentivePage() {
  const { id } = useParams<{ id: string }>();
  const { data, reload } = useApiResource<PeriodDetail>(`/api/periods/${id}`);
  const [preview, setPreview] = useState<IncentiveRow[] | null>(null);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  if (!data) return <p>読み込み中…</p>;
  const head = data.me.authorities.includes("STL_HEAD");
  const open = data.period.status === "OPEN";

  async function act(action: "preview" | "run" | "lock") {
    const res = await apiRequest<{ result: unknown }>(`/api/periods/${id}`, { method: "POST", body: { action } });
    if (!res.ok) return setMessage({ error: true, text: res.message });
    if (action === "preview") setPreview(res.data.result as IncentiveRow[]);
    setMessage({ error: false, text: action === "preview" ? "試算しました（保存していません）" : action === "run" ? "計算結果を記録しました" : `期ロックしました（次の期：${res.data.result}）` });
    reload();
  }
  const rows = preview ?? data.results;
  const name = (r: IncentiveRow) => (r.participants ? `${r.participants.buyer_no} ${r.participants.name}` : `${r.buyer_no} ${r.name}`);

  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>{data.period.period_code} 完納奨励金（適用規則版 第{data.ruleVersionNo ?? "—"}版）</h1>
      <p className="muted" style={{ margin: 0 }}>{data.runAt ? `計算済（${new Date(data.runAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}）` : "未計算"} ・ {open ? "未ロック" : "期ロック済"} ・ 試算ロジックは簡略化（サンプル）</p>
      {open && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="button-secondary" onClick={() => act("preview")}>試算</button>
          {head && <button type="button" className="button-primary" disabled={Boolean(data.runAt)} onClick={() => act("run")}>計算して記録（1回のみ）</button>}
          {head && <button type="button" className="button-secondary" disabled={!data.runAt} onClick={() => act("lock")}>期ロック（MFAは試作では省略）</button>}
        </div>
      )}
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th align="left">区分</th><th align="left">買受人</th><th align="right">お支払額</th><th align="right">入金</th><th align="left">完納</th><th align="right">奨励金</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={r.id ?? i} style={{ borderTop: "1px solid var(--border)" }}>
            <td>{r.kind === "MAIN" ? "当期" : `差額（${r.payment_periods?.period_code ?? "前期"}分）`}</td><td>{name(r)}</td>
            <td align="right">{yen(r.payable_jpy)}</td><td align="right">{yen(r.paid_jpy)}</td><td>{r.kanno ? "完納" : "未完納"}</td>
            <td align="right">{yen(r.incentive_jpy)}</td>
          </tr>
        ))}</tbody>
      </table>
      <ScreenIdFooter screenId="SC-09-04" trace="FT-09-06..08 / BR-INC-01, FR-INC-01/03, PRM-043（再審査・端数調整は試作対象外）" />
    </section>
  );
}
