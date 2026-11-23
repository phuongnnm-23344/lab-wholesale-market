"use client";

import { useParams } from "next/navigation";
import { QualificationPageBody } from "@/components/participants/qualification-page-body";

// SC-01-03 許可登録・更新（仲卸）
export default function PermitPage() {
  const { id } = useParams<{ id: string }>();
  return <QualificationPageBody id={id} mode="permit" />;
}
