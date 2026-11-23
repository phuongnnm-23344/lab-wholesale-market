"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApiResource } from "@/components/common/use-api-resource";
import { MENU_GROUPS, menuItemForPath, menuItemsFor } from "@/lib/auth/role-menu-config";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { canApproveCorrections, isWaitingForMe } from "@/lib/corrections/pending-for-approver";

type Pending = { status: string; requested_by: string | null; approver1: string | null };

// Role-based menu grouped by business area; the entry owning the current page is highlighted.
// Approvers see how many 修正申請 are waiting for them next to the menu entry.
export function SideNavigation({ user, onNavigate }: { user: CurrentUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = menuItemsFor(user);
  const active = menuItemForPath(pathname)?.href;
  const { data } = useApiResource<{ corrections: Pending[] }>(canApproveCorrections(user) ? `/api/corrections?k=${pathname}` : null);
  const waiting = (data?.corrections ?? []).filter((c) => isWaitingForMe(c, user)).length;
  return (
    <nav aria-label="業務メニュー" onClick={onNavigate}>
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>ホーム</Link>
      {MENU_GROUPS.map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="nav-group">
            <div className="nav-group-title">{group}</div>
            {groupItems.map((item) => (
              <Link key={item.href} href={item.href} aria-current={item.href === active ? "page" : undefined}>
                {item.label}
                {item.href === "/corrections" && waiting > 0 && <span className="nav-count" aria-label={`承認待ち${waiting}件`}>{waiting}</span>}
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
