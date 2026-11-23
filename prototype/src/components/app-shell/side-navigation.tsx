"use client";

import Link from "next/link";
import { menuItemsFor } from "@/lib/auth/role-menu-config";
import type { CurrentUser } from "@/lib/auth/app-role-types";

// Role-based menu. Screens of later phases are listed but disabled (準備中) — no dead links.
export function SideNavigation({ user }: { user: CurrentUser }) {
  const items = menuItemsFor(user);
  return (
    <nav aria-label="業務メニュー" style={{ display: "grid", gap: 4 }}>
      <Link href="/">ホーム</Link>
      {items.map((item) =>
        item.available ? (
          <Link key={item.screenId} href={item.href}>
            {item.label}
          </Link>
        ) : (
          <span key={item.screenId} className="muted" title={`フェーズ${item.phase}で実装予定`}>
            {item.label}（準備中）
          </span>
        ),
      )}
    </nav>
  );
}
