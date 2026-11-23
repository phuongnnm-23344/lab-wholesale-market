"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { breadcrumbFor } from "@/lib/auth/role-menu-config";

// Breadcrumb (ホーム › 業務グループ › 画面) + Japanese page title + optional action buttons.
export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const crumbs = breadcrumbFor(usePathname(), title);
  return (
    <>
      <nav aria-label="パンくずリスト">
        <ol className="breadcrumb">
          {crumbs.map((c, i) => (
            <li key={`${c.label}-${i}`}>
              {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ol>
      </nav>
      <div className="page-header">
        <h1>{title}</h1>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </>
  );
}
