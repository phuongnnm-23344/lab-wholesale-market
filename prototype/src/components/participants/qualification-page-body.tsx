"use client";

import Link from "next/link";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { QualificationHistoryTable } from "./qualification-history-table";
import { QualificationRegistrationForm } from "./qualification-registration-form";
import { useParticipantDetail } from "./use-participant-detail";

const CONFIG = {
  permit: { kind: "NAKAOROSHI", title: "許可登録・更新（仲卸）", screenId: "SC-01-03", trace: "FT-01-02 / FR-PARTY-01, 02-08, B.2", only: "仲卸" },
  approval: { kind: "BAIBAI", title: "承認登録・更新（売買参加者）", screenId: "SC-01-04", trace: "FT-01-03 / FR-PARTY-01, TBL-ACTOR-01, 02-08", only: "売買参加者" },
} as const;

// Shared body of SC-01-03 (許可) and SC-01-04 (承認). Wrong participant kind → no form (API also 422).
export function QualificationPageBody({ id, mode }: { id: string; mode: "permit" | "approval" }) {
  const cfg = CONFIG[mode];
  const { participant, error, reload, canEdit } = useParticipantDetail(id);
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!participant) return <p>読み込み中…</p>;
  const rows = mode === "permit" ? participant.nakaoroshi_permits : participant.baibai_approvals;

  return (
    <section className="card" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>{cfg.title}</h1>
      <p style={{ margin: 0 }}><Link href={`/participants/${id}`}>{participant.name}</Link>（{participant.buyer_no ?? "—"}）</p>
      {participant.kind !== cfg.kind ? (
        <p className="error-text" role="alert">この画面は{cfg.only}専用です。この参加者には登録できません。</p>
      ) : (
        <>
          <QualificationHistoryTable rows={rows} />
          {canEdit ? <QualificationRegistrationForm participantId={id} mode={mode} onSaved={reload} />
            : <p className="muted">登録・更新は照合事務局が行います。</p>}
        </>
      )}
      <ScreenIdFooter screenId={cfg.screenId} trace={cfg.trace} />
    </section>
  );
}
