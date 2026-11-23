"use client";

import { APP_TITLE } from "@/lib/app-title";
import { AUTHORITY_LABELS, ROLE_LABELS, type CurrentUser } from "@/lib/auth/app-role-types";
import { SignOutButton } from "./sign-out-button";

// Header: app name, 業務日 (from DB, never the client clock), current user large and always visible.
export function AppHeader({ user }: { user: CurrentUser | null }) {
  const authorityText = user?.authorities.map((a) => AUTHORITY_LABELS[a]).join("・");
  return (
    <header
      style={{
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
        justifyContent: "space-between", padding: "8px 16px",
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
      }}
    >
      <strong>{APP_TITLE}</strong>
      {user && (
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span>業務日：<strong>{user.businessDate ?? "未設定"}</strong></span>
          <span style={{ fontSize: 18 }}>
            <strong>{user.displayName}</strong>（{ROLE_LABELS[user.role]}
            {authorityText ? `／${authorityText}` : ""}）
          </span>
          <SignOutButton />
        </div>
      )}
    </header>
  );
}
