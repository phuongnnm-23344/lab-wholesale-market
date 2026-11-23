"use client";

import { useParams } from "next/navigation";
import { QualificationPageBody } from "@/components/participants/qualification-page-body";

// SC-01-04 承認登録・更新（売買参加者）
export default function ApprovalPage() {
  const { id } = useParams<{ id: string }>();
  return <QualificationPageBody id={id} mode="approval" />;
}
