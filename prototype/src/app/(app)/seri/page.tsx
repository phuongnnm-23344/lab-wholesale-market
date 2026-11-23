"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";

type Session = { id: string; session_no: number; status: string; confirmed_at: string | null; same_person_reason: string | null };

// SC-05-01 せり結果入力 (session list). The system records the FINAL results of the せり held on the floor only;
// there is no live bidding screen (相対取引 is the main flow — rule 1).
export default function SeriSessionListPage() {
  const router = useRouter();
  const { data, error } = useApiResource<{ sessions: Session[] }>("/api/seri-sessions");
  const [message, setMessage] = useState<string | null>(null);

  async function openSession() {
    const res = await apiRequest<{ id: string }>("/api/seri-sessions", { method: "POST" });
    if (!res.ok) return setMessage(res.message);
    router.push(`/seri/${res.data.id}`);
  }

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>せり結果（回ごと）</h1>
      <button type="button" className="button-secondary" onClick={openSession}>新しい回の結果を入力</button>
      {(error || message) && <p className="error-text" role="alert">{error ?? message}</p>}
      <ul>
        {(data?.sessions ?? []).map((s) => (
          <li key={s.id}>
            第{s.session_no}回 — {s.status === "CONFIRMED" ? "確定済" : "入力中"}
            {s.same_person_reason ? "（入力者が確定：要確認）" : ""}{" "}
            <Link href={`/seri/${s.id}`}>結果</Link>{s.status !== "CONFIRMED" && <> ・ <Link href={`/seri/${s.id}/confirm`}>確認・確定</Link></>}
          </li>
        ))}
      </ul>
      <ScreenIdFooter screenId="SC-05-01" trace="FT-05-01 / FR-SERI-01/02, FORM-SERI-01" />
    </section>
  );
}
