// Phase 03 targets through the real Next.js routes (needs `npm run dev` and APP_BASE_URL).
// Account state changes use test-* accounts and are always restored.

import type { SupabaseClient } from "@supabase/supabase-js";
import { AppHttpSession } from "./app-http-session";
import { runCheck, type CheckResult } from "./security-check-runner";
import { requireEnv } from "./script-supabase-clients";

const D = "sakura-demo.example";
const expectStatus = (actual: number, expected: number, what: string) =>
  actual === expected ? null : `${what}: HTTP ${actual} (expected ${expected})`;

export async function runPhase03HttpChecks(admin: SupabaseClient): Promise<CheckResult[]> {
  const r: CheckResult[] = [];
  if (!process.env.APP_BASE_URL) {
    return [await runCheck("H00", "HTTP route checks", async () => "APP_BASE_URL not set (start npm run dev, then APP_BASE_URL=http://localhost:PORT)")];
  }
  const demoPw = requireEnv("DEMO_ACCOUNT_PASSWORD");
  const testPw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const pin = requireEnv("DEMO_ACCOUNT_PIN");
  const uid = async (emp: string) => (await admin.from("profiles").select("user_id").eq("employee_no", emp).single()).data?.user_id as string;
  const n01 = (await admin.from("participants").select("id").eq("buyer_no", "N01").single()).data?.id as string;
  const testTrade = await uid("T9002");
  const testTradeBody = (isActive: boolean) => ({ employeeNo: "T9002", displayName: "テスト用 取引", role: "TRADE", authorities: [], isActive, pin: "" });

  r.push(await runCheck("H01", "No session: POST /api/auth/pin-switch → 401", async () =>
    expectStatus((await AppHttpSession.anonymous().request("/api/auth/pin-switch", { method: "POST", body: { employeeNo: "S1002", pin } })).status, 401, "pin-switch")));

  r.push(await runCheck("H02", "intake@ → PIN of sysadm → 403; → judge with correct PIN → 200 and /api/me = judge", async () => {
    const s = await AppHttpSession.signIn(`intake@${D}`, demoPw);
    const denied = await s.request("/api/auth/pin-switch", { method: "POST", body: { employeeNo: "S1010", pin } });
    const me1 = await s.request("/api/me");
    const ok = await s.request("/api/auth/pin-switch", { method: "POST", body: { employeeNo: "S1002", pin } });
    const me2 = await s.request("/api/me");
    return expectStatus(denied.status, 403, "to sysadm") ??
      (me1.json?.user?.employeeNo === "S1001" ? null : "session changed after denied switch") ??
      expectStatus(ok.status, 200, "to judge") ??
      (me2.json?.user?.employeeNo === "S1002" ? null : `after switch /api/me = ${me2.json?.user?.employeeNo}`);
  }));

  r.push(await runCheck("H03", "trade@ POST 許可 → 403; stlhead@ PATCH /api/accounts → 403", async () => {
    const t = await AppHttpSession.signIn(`trade@${D}`, demoPw);
    const a = await t.request(`/api/participants/${n01}/permits`, { method: "POST", body: { permitNo: "X", validFrom: "2026-11-01", validTo: "2027-11-01" } });
    const h = await AppHttpSession.signIn(`stlhead@${D}`, demoPw);
    const b = await h.request(`/api/accounts/${testTrade}`, { method: "PATCH", body: testTradeBody(true) });
    return expectStatus(a.status, 403, "trade permits") ?? expectStatus(b.status, 403, "stlhead accounts");
  }));

  r.push(await runCheck("H04", "test-sysadm deactivates test-trade → its old session 403, re-login fails; restore", async () => {
    const sys = await AppHttpSession.signIn(`test-sysadm@${D}`, testPw);
    const victim = await AppHttpSession.signIn(`test-trade@${D}`, testPw);
    const off = await sys.request(`/api/accounts/${testTrade}`, { method: "PATCH", body: testTradeBody(false) });
    const oldSession = await victim.request("/api/me");
    let relogin = "succeeded";
    try { await AppHttpSession.signIn(`test-trade@${D}`, testPw); } catch { relogin = "failed"; }
    const on = await sys.request(`/api/accounts/${testTrade}`, { method: "PATCH", body: testTradeBody(true) });
    // A banned user's JWT is already rejected by Supabase Auth in the proxy (401) or, if still
    // accepted, by get_my_profile() (403). Both mean "no access".
    const oldDenied = [401, 403].includes(oldSession.status) ? null : `old session: HTTP ${oldSession.status}`;
    return expectStatus(off.status, 200, "deactivate") ?? oldDenied ??
      (relogin === "failed" ? null : "banned user could sign in") ?? expectStatus(on.status, 200, "reactivate");
  }));

  r.push(await runCheck("H05", "GET /api/accounts never exposes PIN hashes; PATCH demo account → 409", async () => {
    const sys = await AppHttpSession.signIn(`test-sysadm@${D}`, testPw);
    const list = await sys.request("/api/accounts");
    const demo = await sys.request(`/api/accounts/${await uid("S1003")}`, { method: "PATCH", body: { employeeNo: "S1003", displayName: "x", role: "SYSADM", authorities: [], isActive: true, pin: "" } });
    if (list.status !== 200) return `list HTTP ${list.status}`;
    if (/pin_hash|\$2[aby]\$/.test(list.text)) return "hash-like data in response";
    return expectStatus(demo.status, 409, "demo PATCH");
  }));
  return r;
}
