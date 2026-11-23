"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ParticipantForm } from "@/components/participants/participant-form";
import { QualificationHistoryTable } from "@/components/participants/qualification-history-table";
import { useParticipantDetail } from "@/components/participants/use-participant-detail";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, LoadingState } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";

// 参加者詳細・編集. Shows 許可 (仲卸) OR 承認 (売買参加者) — the other is never offered.
export default function ParticipantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { participant, error, reload, canEdit } = useParticipantDetail(id);
  const { showToast } = useToast();
  const back = <Link href="/participants" className="button-secondary">一覧へ戻る</Link>;

  if (error) return <><PageHeader title="参加者詳細" actions={back} /><ErrorAlert message={error} /></>;
  if (!participant) return <><PageHeader title="参加者詳細" actions={back} /><LoadingState /></>;

  return (
    <>
      <PageHeader title={`参加者詳細：${participant.name}`} actions={back} />
      <ParticipantForm initial={participant} readOnly={!canEdit} onSaved={() => { showToast("参加者情報を保存しました"); reload(); }} />
      {participant.kind === "NAKAOROSHI" && (
        <>
          <h2>許可（仲卸）</h2>
          <QualificationHistoryTable rows={participant.nakaoroshi_permits} />
          {canEdit && <Link href={`/participants/${id}/permits`} className="button-secondary">許可の登録・更新</Link>}
        </>
      )}
      {participant.kind === "BAIBAI" && (
        <>
          <h2>承認（売買参加者）・参加上限</h2>
          <QualificationHistoryTable rows={participant.baibai_approvals} />
          {canEdit && <Link href={`/participants/${id}/approvals`} className="button-secondary">承認の登録・更新</Link>}
        </>
      )}
    </>
  );
}
