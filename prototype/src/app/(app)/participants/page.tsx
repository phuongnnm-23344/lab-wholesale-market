"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { formatDate } from "@/lib/format/display-format";
import { currentQualification, daysUntil, type ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS, PARTICIPANT_KINDS } from "@/lib/validators/participant-schemas";

// 参加者一覧・検索: kind / keyword filter; qualification shown as 許可 or 承認 (never merged).
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
    <>
      <PageHeader title="参加者（許可・承認）" actions={canEdit ? <Link href="/participants/new" className="button-primary">新規登録</Link> : undefined} />
      <div className="toolbar">
        <label>種別{" "}
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">すべて</option>
            {PARTICIPANT_KINDS.map((k) => <option key={k} value={k}>{PARTICIPANT_KIND_LABELS[k]}</option>)}
          </select>
        </label>
        <label>キーワード <input placeholder="名称・買受人番号" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>
      <ListStates loading={!data} error={error} empty={rows.length === 0} emptyText="該当する参加者はありません。">
        <table>
          <thead><tr><th>買受人番号</th><th>種別</th><th>名称</th><th>許可／承認</th><th>有効期限</th><th>状態</th></tr></thead>
          <tbody>
            {rows.map((p) => {
              const qual = currentQualification(p);
              const left = qual ? daysUntil(qual.validTo, today) : null;
              const soon = left !== null && left <= 30;
              return (
                <tr key={p.id}>
                  <td>{p.buyer_no ?? "—"}</td>
                  <td>{PARTICIPANT_KIND_LABELS[p.kind]}</td>
                  <td><Link href={`/participants/${p.id}`}>{p.name}</Link></td>
                  <td>{qual?.label ?? (p.kind === "NAKAOROSHI" || p.kind === "BAIBAI" ? <StatusBadge tone="danger">有効なし</StatusBadge> : "—")}</td>
                  <td>{qual ? formatDate(qual.validTo) : "—"} {soon && <StatusBadge tone="warning">残り{left}日</StatusBadge>}</td>
                  <td>{p.status === "ACTIVE" ? <StatusBadge tone="success">有効</StatusBadge> : <StatusBadge tone="neutral">停止</StatusBadge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="summary-row"><span>{rows.length} 件</span></div>
      </ListStates>
    </>
  );
}
