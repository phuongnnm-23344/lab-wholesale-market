"use client";

import Link from "next/link";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/status-states";
import { ROLE_LABELS } from "@/lib/auth/app-role-types";
import { MENU_GROUPS, menuItemsFor } from "@/lib/auth/role-menu-config";
import { formatDate } from "@/lib/format/display-format";

// ホーム（業務メニュー）: 業務日, current user, role-based shortcuts grouped by business area.
// For 取引担当 the first shortcut is 相対取引入力 (相対取引 = main flow, rule 1).
export default function HomePage() {
  const state = useCurrentUser();
  if (state.status !== "ready") return null;
  const { user } = state;
  const items = menuItemsFor(user);

  return (
    <>
      <PageHeader title="ホーム" />
      <table className="detail-table" style={{ maxWidth: 640 }}>
        <tbody>
          <tr><th>業務日</th><td>{user.businessDate ? formatDate(user.businessDate) : "未設定"}</td></tr>
          <tr><th>操作者</th><td>{user.displayName}（{ROLE_LABELS[user.role]}・社員番号 {user.employeeNo}）</td></tr>
        </tbody>
      </table>
      <h2>業務メニュー</h2>
      {items.length === 0 && <EmptyState text="このロールで利用できる業務はありません。" />}
      {MENU_GROUPS.map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 12 }}>
            <h3>{group}</h3>
            <div className="page-actions">
              {groupItems.map((item, i) => (
                <Link key={item.href} href={item.href} className={i === 0 && group === "取引" ? "button-primary" : "button-secondary"}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
