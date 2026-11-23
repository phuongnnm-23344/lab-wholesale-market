"use client";

import Link from "next/link";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/format/display-format";

type Session = { id: string; session_no: number; status: string; confirmed_at: string | null; same_person_reason: string | null };

// せり結果入力（回の一覧）. The system records the FINAL results of the せり held on the floor only;
// there is no live bidding screen (相対取引 is the main flow — rule 1).
export default function SeriSessionListPage() {
  const { showToast, toastAndGo } = useToast();
  const { data, error } = useApiResource<{ sessions: Session[] }>("/api/seri-sessions");
  const sessions = data?.sessions ?? [];

  async function openSession() {
    const res = await apiRequest<{ id: string }>("/api/seri-sessions", { method: "POST" });
    if (!res.ok) return showToast(res.message, "error");
    toastAndGo("新しい回を作成しました", `/seri/${res.data.id}`);
  }

  return (
    <>
      <PageHeader title="せり結果入力・確認" actions={<button type="button" className="button-primary" onClick={openSession}>新しい回の結果を入力</button>} />
      <p className="muted">せり場で決まった最終結果のみを記録します。確定は入力者とは別の担当者が行います。</p>
      <ListStates loading={!data} error={error} empty={sessions.length === 0} emptyText="本日のせりの回はまだありません。">
        <table>
          <thead><tr><th>回</th><th>状態</th><th>確定日時</th><th>操作</th></tr></thead>
          <tbody>{sessions.map((s) => (
            <tr key={s.id}>
              <td>第{s.session_no}回</td>
              <td>
                {s.status === "CONFIRMED" ? <StatusBadge tone="success">確定済</StatusBadge> : <StatusBadge tone="warning">入力中</StatusBadge>}{" "}
                {s.same_person_reason && <StatusBadge tone="danger">入力者が確定</StatusBadge>}
              </td>
              <td>{formatDateTime(s.confirmed_at)}</td>
              <td>
                <Link href={`/seri/${s.id}`}>結果</Link>
                {s.status !== "CONFIRMED" && <>　<Link href={`/seri/${s.id}/confirm`}>確認・確定</Link></>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </ListStates>
    </>
  );
}
