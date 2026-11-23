import Link from "next/link";

// エラー・ロック済み案内 (shared component). Shown when an API returns 423 DAY_LOCKED:
// a closed business day can never be edited directly (rule 4).
export function DayLockedNotice({ detail, tradeId }: { detail?: string; tradeId?: string }) {
  return (
    <div role="alert" className="alert alert-error">
      <strong>この業務日は締め済みです。</strong>
      <p style={{ margin: "4px 0" }}>締め済みのデータは直接修正できません。修正申請を作成し、承認を受けてください。{detail ? `（${detail}）` : ""}</p>
      <Link href={tradeId ? `/corrections/new?tradeId=${tradeId}` : "/corrections"}>修正申請へ</Link>
    </div>
  );
}

export type ResultMessage = { error: boolean; text: string; status?: number } | null;

// Renders an API result message; a 423 becomes the locked-day notice.
export function ApiResultMessage({ message, tradeId }: { message: ResultMessage; tradeId?: string }) {
  if (!message) return null;
  if (message.status === 423) return <DayLockedNotice detail={message.text} tradeId={tradeId} />;
  return <div className={`alert ${message.error ? "alert-error" : "alert-info"}`} role="status">{message.text}</div>;
}
