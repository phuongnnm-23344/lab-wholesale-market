"use client";

import Link from "next/link";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { ROLE_LABELS } from "@/lib/auth/app-role-types";
import { menuItemsFor } from "@/lib/auth/role-menu-config";

// SC-00-03 ホーム（業務メニュー）: 業務日, current user, role-based shortcuts.
// For 取引担当 the first shortcut is 相対取引入力 (相対取引 = main flow, rule 1).
export default function HomePage() {
  const state = useCurrentUser();
  if (state.status !== "ready") return null;
  const { user } = state;
  const shortcuts = menuItemsFor(user).slice(0, 6);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>ホーム</h1>
        <p style={{ margin: 0 }}>
          業務日 <strong>{user.businessDate ?? "未設定"}</strong> ・ 操作中：
          <strong>{user.displayName}</strong>（{ROLE_LABELS[user.role]}・社員番号 {user.employeeNo}）
        </p>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>よく使う業務</h2>
        {shortcuts.length === 0 && <p className="muted">このロールで利用できる業務はまだありません。</p>}
        <ul style={{ display: "grid", gap: 8, paddingLeft: 20 }}>
          {shortcuts.map((item) => (
            <li key={item.screenId}>
              {item.available ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span className="muted">{item.label}（準備中・フェーズ{item.phase}）</span>
              )}{" "}
              <span className="muted" style={{ fontSize: 12 }}>{item.screenId}</span>
            </li>
          ))}
        </ul>
      </div>
      <ScreenIdFooter screenId="SC-00-03" trace="FT-12-04, FT-07-01 / FR-NOTIFY-01, 02-07（通知は試作対象外）" />
    </section>
  );
}
