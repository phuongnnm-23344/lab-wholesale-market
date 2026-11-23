"use client";

import Link from "next/link";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { StatusBadge } from "@/components/ui/status-states";
import { menuItemsFor } from "@/lib/auth/role-menu-config";
import type { DailySettlement } from "@/lib/settlement/daily-settlement-types";

type Item = { label: string; count: number; note?: string; href: string; blocking?: boolean };

export function checklistItems(data: DailySettlement): Item[] {
  const c = data.checklist;
  return [
    { label: "未確認のせり結果", count: c?.seri_unconfirmed ?? 0, href: "/seri", blocking: true, note: "確認されるまで締められません" },
    { label: "入力者本人が確認したせり", count: c?.seri_same_person ?? 0, href: "/seri", note: "理由を確認してください" },
    { label: "引渡しが終わっていない取引", count: c?.undelivered_trades ?? 0, href: "/deliveries", note: "翌日以降も記録できます" },
    { label: "本登録待ちの仮受付ロット", count: c?.provisional_lots ?? 0, href: "/lots/new" },
  ];
}

// Number of open points for the 「要確認（n）」 label.
export const openCheckCount = (data: DailySettlement | null) =>
  data ? checklistItems(data).filter((i) => i.count > 0).reduce((s, i) => s + i.count, 0) : 0;

// 要確認 list shared by 日次照合表 and 日次締め: count, what it means, and a link to the screen that
// resolves it — only when the current user can open that screen.
export function DayChecklistTable({ data }: { data: DailySettlement }) {
  const me = useCurrentUser();
  const reachable = new Set(me.status === "ready" ? menuItemsFor(me.user).map((m) => m.href) : []);
  const reasons = (data.seriToReview ?? []).filter((s) => s.same_person_reason);
  return (
    <table className="detail-table" style={{ maxWidth: 760 }}>
      <tbody>
        {checklistItems(data).map((i) => (
          <tr key={i.label}>
            <th>{i.label}</th>
            <td>
              {i.count > 0 ? <StatusBadge tone={i.blocking ? "danger" : "warning"}>{i.count}件</StatusBadge> : <StatusBadge tone="success">0件</StatusBadge>}
              {i.count > 0 && i.note && <span className="muted">　{i.note}</span>}
              {i.count > 0 && reachable.has(i.href) && <>　<Link href={i.href}>確認する →</Link></>}
              {i.label === "入力者本人が確認したせり" && reasons.map((s) => <div key={s.id} className="muted">第{s.session_no}回：{s.same_person_reason}</div>)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
