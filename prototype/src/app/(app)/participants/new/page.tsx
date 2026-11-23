"use client";

import { useRouter } from "next/navigation";
import { ParticipantForm } from "@/components/participants/participant-form";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";

// 参加者の新規登録. Server re-checks the role (照合事務局 / 照合部門長). Success → 参加者詳細.
export default function NewParticipantPage() {
  const router = useRouter();
  const { toastAndGo } = useToast();
  return (
    <>
      <PageHeader title="参加者の新規登録" />
      <ParticipantForm readOnly={false} onCancel={() => router.push("/participants")}
        onSaved={(id) => toastAndGo("参加者を登録しました", `/participants/${id}`)} />
    </>
  );
}
