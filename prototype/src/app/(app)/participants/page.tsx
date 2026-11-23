"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { currentQualification, daysUntil, type ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS, PARTICIPANT_KINDS } from "@/lib/validators/participant-schemas";

// SC-01-01 参加者一覧・検索: kind / keyword filter; qualification shown as 許可 or 承認 (never merged).
export default function ParticipantListPage() {
  const state = useCurrentUser();
  const today = state.status === "ready" ? state.user.businessDate : null;
  const canEdit = state.status === "ready" &&
    (state.user.role === "SETTLE" || state.user.authorities.includes("STL_HEAD"));
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const params = new URLSearchParams({ ...(kind && { kind }), ...(q && { q }) });
  const { data, error } = useApiResource<{ participants: ParticipantRow[] }>(`/api/participants?${params}`);
  const rows = data?.participants ?? [];

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>参加者一覧</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="種別">
          <option value="">すべての種別</option>
          {PARTICIPANT_KINDS.map((k) => <option key={k} value={k}>{PARTICIPANT_KIND_LABELS[k]}</option>)}
        </select>
        <input placeholder="名称・買受人番号" value={q} onChange={(e) => setQ(e.target.value)} />
        {canEdit && <Link href="/participants/new" className="button-secondary">新規登録</Link>}
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">買受人番号</th><th align="left">種別</th><th align="left">名称</th><th align="left">許可／承認</th><th align="left">有効期限</th><th align="left">状態</th></tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const qual = currentQualification(p);
            const left = qual ? daysUntil(qual.validTo, today) : null;
            return (
              <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td>{p.buyer_no ?? "—"}</td>
                <td>{PARTICIPANT_KIND_LABELS[p.kind]}</td>
                <td><Link href={`/participants/${p.id}`}>{p.name}</Link></td>
                <td>{qual?.label ?? (p.kind === "NAKAOROSHI" || p.kind === "BAIBAI" ? "有効なし" : "—")}</td>
                <td className={left !== null && left <= 30 ? "error-text" : undefined}>
                  {qual ? `${qual.validTo}${left !== null && left <= 30 ? `（残り${left}日）` : ""}` : "—"}
                </td>
                <td>{p.status === "ACTIVE" ? "有効" : "停止"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ScreenIdFooter screenId="SC-01-01" trace="FT-01-01, FT-01-04 / FR-PARTY-01（許可・承認は別管理：02-08）" />
    </section>
  );
}
