import type { AppRole, Authority, CurrentUser } from "./app-role-types";

// Menu per role, from role-list.md §2 (write/approve rights). Order matters: 相対取引 is the
// main business flow (rule 1), so it is the first entry and the first home shortcut for TRADE.
// `available: false` = screen planned in a later phase; shown disabled (no dead links).
export type MenuItem = {
  href: string;
  label: string;
  screenId: string;
  roles: readonly AppRole[];
  authorities?: readonly Authority[];
  phase: number;
  available: boolean;
};

const FIELD: readonly AppRole[] = ["INTAKE", "JUDGE", "TRADE", "DELIVERY"];

export const MENU_ITEMS: readonly MenuItem[] = [
  { href: "/trades/new", label: "相対取引入力・確定", screenId: "SC-04-01", roles: ["TRADE"], phase: 5, available: true },
  { href: "/trades", label: "取引一覧", screenId: "SC-04-03", roles: ["TRADE", "SETTLE"], phase: 5, available: true },
  { href: "/seri", label: "せり結果入力・確認", screenId: "SC-05-01", roles: ["TRADE"], phase: 5, available: true },
  { href: "/lots/provisional", label: "ロット仮受付", screenId: "SC-03-02", roles: ["INTAKE"], phase: 4, available: true },
  { href: "/lots/new", label: "ロット本登録", screenId: "SC-03-01", roles: ["INTAKE"], phase: 4, available: true },
  { href: "/lots/inspection", label: "目利き・下見結果入力", screenId: "SC-03-05", roles: ["JUDGE"], phase: 4, available: true },
  { href: "/lots", label: "ロット一覧", screenId: "SC-03-03", roles: ["INTAKE", "JUDGE", "TRADE"], phase: 4, available: true },
  { href: "/deliveries", label: "引渡し記録", screenId: "SC-06-02", roles: ["DELIVERY"], phase: 6, available: true },
  { href: "/settlement", label: "日次照合表", screenId: "SC-07-01", roles: ["SETTLE"], phase: 6, available: true },
  { href: "/settlement/close", label: "日次締め", screenId: "SC-07-02", roles: [], authorities: ["STL_HEAD"], phase: 6, available: true },
  { href: "/corrections", label: "修正申請", screenId: "SC-08-02", roles: ["TRADE", "DELIVERY", "SETTLE"], authorities: ["STL_HEAD", "OPS_HEAD"], phase: 7, available: true },
  { href: "/participants", label: "参加者（許可・承認）", screenId: "SC-01-01", roles: ["SETTLE"], phase: 3, available: true },
  { href: "/payments/import", label: "入金CSV取込", screenId: "SC-09-01", roles: ["SETTLE"], phase: 9, available: true },
  { href: "/periods", label: "期別お支払額・奨励金", screenId: "SC-09-03", roles: ["SETTLE"], authorities: ["STL_HEAD"], phase: 9, available: true },
  { href: "/rules", label: "規則版・交付率", screenId: "SC-10-01", roles: ["RULE"], authorities: ["STL_HEAD"], phase: 8, available: true },
  { href: "/audit", label: "監査ログ検索", screenId: "SC-13-01", roles: ["SETTLE", "SYSADM"], authorities: ["STL_HEAD"], phase: 10, available: true },
  { href: "/admin/accounts", label: "アカウント・ロール管理", screenId: "SC-02-03", roles: ["SYSADM"], phase: 3, available: true },
  { href: "/switch-user", label: "利用者切替（PIN）", screenId: "SC-00-02", roles: FIELD, authorities: ["DEL_HEAD", "STL_HEAD", "OPS_HEAD"], phase: 3, available: true },
];

export function menuItemsFor(user: CurrentUser): MenuItem[] {
  return MENU_ITEMS.filter(
    (item) =>
      item.roles.includes(user.role) ||
      (item.authorities ?? []).some((a) => user.authorities.includes(a)),
  );
}
