"use client";

import { useRouter } from "next/navigation";
import { ParticipantForm } from "@/components/participants/participant-form";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";

// SC-01-02 参加者詳細・編集 (new). Server re-checks the role (照合事務局 / 照合部門長).
export default function NewParticipantPage() {
  const router = useRouter();
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>参加者の新規登録</h1>
      <ParticipantForm readOnly={false} onSaved={(id) => router.push(`/participants/${id}`)} />
      <ScreenIdFooter screenId="SC-01-02" trace="FT-01-01 / FR-PARTY-01, TBL-ACTOR-01" />
    </section>
  );
}
