import type { AppRole, Authority, CurrentUser } from "./app-role-types";

// Menu per role, from role-list.md §2 (write/approve rights). Order matters: 相対取引 is the
// main business flow (rule 1), so it is the first entry and the first home shortcut for TRADE.
// `screenId` is an internal key for traceability tests only — it is never rendered on screen.
export type MenuGroup = "取引" | "ロット" | "引渡し・照合" | "精算・奨励金" | "マスタ・管理";

export type MenuItem = {
  href: string;
  label: string;
  screenId: string;
  group: MenuGroup;
  roles: readonly AppRole[];
  authorities?: readonly Authority[];
};

export const MENU_GROUPS: readonly MenuGroup[] = ["取引", "ロット", "引渡し・照合", "精算・奨励金", "マスタ・管理"];

const FIELD: readonly AppRole[] = ["INTAKE", "JUDGE", "TRADE", "DELIVERY"];

export const MENU_ITEMS: readonly MenuItem[] = [
  { href: "/trades/new", label: "相対取引入力・確定", screenId: "SC-04-01", group: "取引", roles: ["TRADE"] },
  { href: "/trades", label: "取引一覧", screenId: "SC-04-03", group: "取引", roles: ["TRADE", "SETTLE"] },
  { href: "/seri", label: "せり結果入力・確認", screenId: "SC-05-01", group: "取引", roles: ["TRADE"] },
  { href: "/corrections", label: "修正申請", screenId: "SC-08-02", group: "取引", roles: ["TRADE", "DELIVERY", "SETTLE"], authorities: ["STL_HEAD", "OPS_HEAD"] },
  { href: "/lots/provisional", label: "ロット仮受付", screenId: "SC-03-02", group: "ロット", roles: ["INTAKE"] },
  { href: "/lots/new", label: "ロット本登録", screenId: "SC-03-01", group: "ロット", roles: ["INTAKE"] },
  { href: "/lots/inspection", label: "目利き・下見結果入力", screenId: "SC-03-05", group: "ロット", roles: ["JUDGE"] },
  { href: "/lots", label: "ロット一覧", screenId: "SC-03-03", group: "ロット", roles: ["INTAKE", "JUDGE", "TRADE"] },
  { href: "/deliveries", label: "引渡し記録", screenId: "SC-06-02", group: "引渡し・照合", roles: ["DELIVERY"] },
  { href: "/settlement", label: "日次照合表", screenId: "SC-07-01", group: "引渡し・照合", roles: ["SETTLE"] },
  { href: "/settlement/close", label: "日次締め", screenId: "SC-07-02", group: "引渡し・照合", roles: [], authorities: ["STL_HEAD"] },
  { href: "/payments/import", label: "入金CSV取込", screenId: "SC-09-01", group: "精算・奨励金", roles: ["SETTLE"] },
  { href: "/periods", label: "期別お支払額・奨励金", screenId: "SC-09-03", group: "精算・奨励金", roles: ["SETTLE"], authorities: ["STL_HEAD"] },
  { href: "/participants", label: "参加者（許可・承認）", screenId: "SC-01-01", group: "マスタ・管理", roles: ["SETTLE"] },
  { href: "/rules", label: "規則版・交付率", screenId: "SC-10-01", group: "マスタ・管理", roles: ["RULE"], authorities: ["STL_HEAD"] },
  { href: "/audit", label: "監査ログ検索", screenId: "SC-13-01", group: "マスタ・管理", roles: ["SETTLE", "SYSADM"], authorities: ["STL_HEAD"] },
  { href: "/admin/accounts", label: "アカウント・ロール管理", screenId: "SC-02-03", group: "マスタ・管理", roles: ["SYSADM"] },
  { href: "/switch-user", label: "利用者切替（PIN）", screenId: "SC-00-02", group: "マスタ・管理", roles: FIELD, authorities: ["DEL_HEAD", "STL_HEAD", "OPS_HEAD"] },
];

export function menuItemsFor(user: CurrentUser): MenuItem[] {
  return MENU_ITEMS.filter(
    (item) =>
      item.roles.includes(user.role) ||
      (item.authorities ?? []).some((a) => user.authorities.includes(a)),
  );
}

// Menu entry owning a path: exact match, else the longest href that is a parent path.
export function menuItemForPath(pathname: string): MenuItem | undefined {
  const exact = MENU_ITEMS.find((m) => m.href === pathname);
  if (exact) return exact;
  return [...MENU_ITEMS]
    .filter((m) => pathname.startsWith(`${m.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export type Crumb = { label: string; href?: string };

export function breadcrumbFor(pathname: string, title: string): Crumb[] {
  if (pathname === "/") return [{ label: "ホーム" }];
  const item = menuItemForPath(pathname);
  const crumbs: Crumb[] = [{ label: "ホーム", href: "/" }];
  if (item) {
    crumbs.push({ label: item.group });
    crumbs.push({ label: item.label, href: item.href });
  }
  if (!item || item.label !== title) crumbs.push({ label: title });
  return crumbs;
}
