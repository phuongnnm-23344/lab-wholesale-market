// Demo accounts (DEC-029, kept usable until LAB-6) and test-only accounts (Expert M3).
// Passwords / PIN are NOT stored here: they come from environment variables (see README).
// Employee numbers S1001–S1010 are referenced by the demo seed SQL (0008/0009) to attribute actors.

import type { AppRole, Authority } from "../../src/lib/auth/app-role-types";

export const DEMO_EMAIL_DOMAIN = "sakura-demo.example";

export type DemoAccount = {
  localPart: string;
  employeeNo: string;
  displayName: string;
  role: AppRole;
  authorities: Authority[];
  // true = listed in README, protected from role/status/PIN changes in the app (is_demo_protected)
  isDemo: boolean;
};

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { localPart: "intake", employeeNo: "S1001", displayName: "サンプル 受付 一郎", role: "INTAKE", authorities: [], isDemo: true },
  { localPart: "judge", employeeNo: "S1002", displayName: "サンプル 目利 二郎", role: "JUDGE", authorities: [], isDemo: true },
  { localPart: "trade", employeeNo: "S1003", displayName: "サンプル 取引 三郎", role: "TRADE", authorities: [], isDemo: true },
  { localPart: "trade2", employeeNo: "S1004", displayName: "サンプル 取引 四郎", role: "TRADE", authorities: [], isDemo: true },
  { localPart: "delivery", employeeNo: "S1005", displayName: "サンプル 配送 五郎", role: "DELIVERY", authorities: [], isDemo: true },
  { localPart: "settle", employeeNo: "S1006", displayName: "サンプル 照合 六子", role: "SETTLE", authorities: [], isDemo: true },
  { localPart: "stlhead", employeeNo: "S1007", displayName: "サンプル 照合部長 七子", role: "SETTLE", authorities: ["STL_HEAD"], isDemo: true },
  { localPart: "opshead", employeeNo: "S1008", displayName: "サンプル 運用部長 八郎", role: "SETTLE", authorities: ["OPS_HEAD"], isDemo: true },
  { localPart: "rule", employeeNo: "S1009", displayName: "サンプル 規則 九子", role: "RULE", authorities: [], isDemo: true },
  { localPart: "sysadm", employeeNo: "S1010", displayName: "サンプル 管理 十郎", role: "SYSADM", authorities: [], isDemo: true },
  { localPart: "test-settle", employeeNo: "T9001", displayName: "テスト用 照合", role: "SETTLE", authorities: [], isDemo: false },
  { localPart: "test-trade", employeeNo: "T9002", displayName: "テスト用 取引", role: "TRADE", authorities: [], isDemo: false },
  { localPart: "test-sysadm", employeeNo: "T9003", displayName: "テスト用 管理", role: "SYSADM", authorities: [], isDemo: false },
  // Phase 08+: rule maker / checker for verify scripts, so demo rule@ / stlhead@ never spend the version quota.
  { localPart: "test-rule", employeeNo: "T9004", displayName: "テスト用 規則", role: "RULE", authorities: [], isDemo: false },
  { localPart: "test-stlhead", employeeNo: "T9005", displayName: "テスト用 照合部長", role: "SETTLE", authorities: ["STL_HEAD"], isDemo: false },
];

export function emailOf(account: DemoAccount): string {
  return `${account.localPart}@${DEMO_EMAIL_DOMAIN}`;
}

// role-list P12: only shop-floor roles / head authorities use the shared-device PIN (N1).
const PIN_ROLES: readonly AppRole[] = ["INTAKE", "JUDGE", "TRADE", "DELIVERY"];
const PIN_AUTHORITIES: readonly Authority[] = ["DEL_HEAD", "STL_HEAD", "OPS_HEAD"];

export function usesSharedDevicePin(account: DemoAccount): boolean {
  return PIN_ROLES.includes(account.role) || account.authorities.some((a) => PIN_AUTHORITIES.includes(a));
}
