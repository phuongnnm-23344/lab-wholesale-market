// Roles (TBL-ROLE-01) and additive authorities (role-list.md §1). Labels shown in Japanese UI.

export const APP_ROLES = ["INTAKE", "JUDGE", "TRADE", "DELIVERY", "SETTLE", "RULE", "SYSADM"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const AUTHORITIES = ["STL_HEAD", "OPS_HEAD", "DEL_HEAD"] as const;
export type Authority = (typeof AUTHORITIES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  INTAKE: "受付担当",
  JUDGE: "目利き記録担当",
  TRADE: "取引担当",
  DELIVERY: "配送担当",
  SETTLE: "照合事務局",
  RULE: "ルール管理者",
  SYSADM: "システム管理者",
};

export const AUTHORITY_LABELS: Record<Authority, string> = {
  STL_HEAD: "照合部門長",
  OPS_HEAD: "運用部門長",
  DEL_HEAD: "配送部門責任者",
};

export type CurrentUser = {
  userId: string;
  employeeNo: string;
  displayName: string;
  role: AppRole;
  authorities: Authority[];
  isDemoProtected: boolean;
  businessDate: string | null;
};

type ProfileRow = {
  user_id: string;
  employee_no: string;
  display_name: string;
  role: string;
  is_demo_protected: boolean;
  authorities: string[];
  business_date: string | null;
};

function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

function isAuthority(value: string): value is Authority {
  return (AUTHORITIES as readonly string[]).includes(value);
}

// Maps the get_my_profile() RPC payload to CurrentUser; returns null on any unexpected shape.
export function toCurrentUser(payload: unknown): CurrentUser | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as ProfileRow;
  if (typeof row.user_id !== "string" || !isAppRole(String(row.role))) return null;
  return {
    userId: row.user_id,
    employeeNo: String(row.employee_no),
    displayName: String(row.display_name),
    role: row.role as AppRole,
    authorities: (Array.isArray(row.authorities) ? row.authorities : []).filter(isAuthority),
    isDemoProtected: Boolean(row.is_demo_protected),
    businessDate: row.business_date ?? null,
  };
}
