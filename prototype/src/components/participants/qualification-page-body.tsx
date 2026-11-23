"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, InfoAlert, LoadingState } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { QualificationHistoryTable } from "./qualification-history-table";
import { QualificationRegistrationForm } from "./qualification-registration-form";
import { useParticipantDetail } from "./use-participant-detail";

const CONFIG = {
  permit: { kind: "NAKAOROSHI", title: "許可登録・更新（仲卸）", only: "仲卸" },
  approval: { kind: "BAIBAI", title: "承認登録・更新（売買参加者）", only: "売買参加者" },
} as const;

// Shared body of 許可 and 承認 registration. Wrong participant kind → no form (API also 422).
// Success → toast + back to 参加者詳細.
export function QualificationPageBody({ id, mode }: { id: string; mode: "permit" | "approval" }) {
  const cfg = CONFIG[mode];
  const { toastAndGo } = useToast();
  const { participant, error, canEdit } = useParticipantDetail(id);
  const back = <Link href={`/participants/${id}`} className="button-secondary">参加者詳細へ戻る</Link>;
  if (error) return <><PageHeader title={cfg.title} actions={back} /><ErrorAlert message={error} /></>;
  if (!participant) return <><PageHeader title={cfg.title} actions={back} /><LoadingState /></>;
  const rows = mode === "permit" ? participant.nakaoroshi_permits : participant.baibai_approvals;

  return (
    <>
      <PageHeader title={cfg.title} actions={back} />
      <p>対象：<strong>{participant.name}</strong>（{participant.buyer_no ?? "—"}）</p>
      {participant.kind !== cfg.kind ? (
        <ErrorAlert message={`この画面は${cfg.only}専用です。この参加者には登録できません。`} />
      ) : (
        <>
          <h2>登録履歴</h2>
          <QualificationHistoryTable rows={rows} />
          <h2>新規登録・更新</h2>
          {canEdit ? <QualificationRegistrationForm participantId={id} mode={mode} onSaved={(m) => toastAndGo(m, `/participants/${id}`)} />
            : <InfoAlert>登録・更新は照合事務局が行います。</InfoAlert>}
        </>
      )}
    </>
  );
}
