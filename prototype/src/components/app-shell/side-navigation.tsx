"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_GROUPS, menuItemForPath, menuItemsFor } from "@/lib/auth/role-menu-config";
import type { CurrentUser } from "@/lib/auth/app-role-types";

// Role-based menu grouped by business area; the entry owning the current page is highlighted.
export function SideNavigation({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const items = menuItemsFor(user);
  const active = menuItemForPath(pathname)?.href;
  return (
    <nav aria-label="業務メニュー">
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
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
