"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { ParticipantForm } from "@/components/participants/participant-form";
import { QualificationHistoryTable } from "@/components/participants/qualification-history-table";
import { useParticipantDetail } from "@/components/participants/use-participant-detail";

// SC-01-02 参加者詳細・編集. Shows 許可 (仲卸) OR 承認 (売買参加者) — the other is never offered.
export default function ParticipantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { participant, error, reload, canEdit } = useParticipantDetail(id);

  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!participant) return <p>読み込み中…</p>;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>{participant.name}</h1>
        <ParticipantForm initial={participant} readOnly={!canEdit} onSaved={() => reload()} />
      </div>
      {participant.kind === "NAKAOROSHI" && (
        <div className="card">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>許可（仲卸）</h2>
          <QualificationHistoryTable rows={participant.nakaoroshi_permits} />
          {canEdit && <p><Link href={`/participants/${id}/permits`}>許可の登録・更新へ</Link></p>}
        </div>
      )}
      {participant.kind === "BAIBAI" && (
        <div className="card">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>承認（売買参加者）・参加上限</h2>
          <QualificationHistoryTable rows={participant.baibai_approvals} />
          {canEdit && <p><Link href={`/participants/${id}/approvals`}>承認の登録・更新へ</Link></p>}
        </div>
      )}
      <ScreenIdFooter screenId="SC-01-02" trace="FT-01-01 / FR-PARTY-01, TBL-ACTOR-01" />
    </section>
  );
}
