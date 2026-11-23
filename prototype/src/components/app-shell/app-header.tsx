"use client";

import Link from "next/link";
import { APP_TITLE } from "@/lib/app-title";
import { AUTHORITY_LABELS, ROLE_LABELS, type CurrentUser } from "@/lib/auth/app-role-types";
import { formatDate } from "@/lib/format/display-format";
import { SignOutButton } from "./sign-out-button";

// Header: system name, 業務日 (from DB, never the client clock), current user, ログアウト.
export function AppHeader({ user, onToggleMenu }: { user: CurrentUser | null; onToggleMenu?: () => void }) {
  const authorityText = user?.authorities.map((a) => AUTHORITY_LABELS[a]).join("・");
  return (
    <header className="app-header">
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && onToggleMenu && <button type="button" className="button-secondary menu-toggle" onClick={onToggleMenu}>メニュー</button>}
        <Link href="/" className="app-header-title">{APP_TITLE}</Link>
      </span>
      {user && (
        <div className="app-header-meta">
          <span><span className="label">業務日</span><strong>{user.businessDate ? formatDate(user.businessDate) : "未設定"}</strong></span>
          <span>
            <span className="label">{ROLE_LABELS[user.role]}{authorityText ? `／${authorityText}` : ""}</span>
            <strong>{user.displayName}</strong>
          </span>
          <SignOutButton />
        </div>
      )}
    </header>
  );
}
