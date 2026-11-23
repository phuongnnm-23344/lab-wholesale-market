// Phase 01–02 targets about who can reach the DB at all (Expert M1, M2, n1, n2).
// Write attempts use TEST accounts only, so demo accounts are never modified.

import type { SupabaseClient } from "@supabase/supabase-js";
import { anonClient, expectRejected, runCheck, signedInClient, type CheckResult } from "./security-check-runner";
import { requireEnv } from "./script-supabase-clients";

// Functions `authenticated` may execute after phase 02 (helpers used by policies / app shell).
// Later phases append their RPC names here.
export const ALLOWED_AUTHENTICATED_FUNCTIONS = [
  // phase 02 helpers
  "active_rule_version_on", "app_role", "current_business_date", "get_my_profile", "has_authority",
  // phase 03
  "admin_set_account_pin", "admin_upsert_account", "register_baibai_approval", "register_nakaoroshi_permit",
  "upsert_participant",
  // phase 04
  "provisional_receive_lot", "publish_lots", "record_inspections", "register_lot", "staff_display_names",
  // phase 05
  "add_seri_result", "confirm_aitai_trade", "confirm_seri_session", "create_seri_session",
  // phase 06
  "close_business_day", "day_close_checklist", "record_delivery",
  // phase 07
  "approve_correction", "reject_correction", "submit_correction",
  // phase 08
  "approve_rule_version", "cancel_rule_version", "create_rule_version", "return_rule_version",
  "rule_version_quota_used", "save_rate_rows", "submit_rule_version",
  // phase 09
  "import_payments", "lock_period", "period_payables", "preview_incentives", "run_incentive_calc",
].sort();

const names = (signatures: string[]) => signatures.map((s) => s.split("(")[0]).sort();

export async function runPrivilegeChecks(admin: SupabaseClient): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const testPassword = requireEnv("TEST_ACCOUNT_PASSWORD");

  results.push(await runCheck("C01", "Auth sign-up is disabled (anon cannot create accounts)", async () => {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") },
    });
    const settings = (await res.json()) as { disable_signup?: boolean };
    // signUp is attempted only when the setting says disabled, so a probe user is never created.
    if (settings.disable_signup !== true) return "disable_signup is not true (Dashboard → Allow new users to sign up)";
    const { error } = await anonClient().auth.signUp({ email: `probe-${Date.now()}@sakura-demo.example`, password: testPassword });
    return error ? null : "signUp succeeded";
  }));

  const { data: snap, error: snapError } = await admin.rpc("security_audit_snapshot");
  const snapshot = (snap ?? {}) as Record<string, string[] | boolean>;
  const needSnapshot = () => (snapError ? `security_audit_snapshot unavailable (${snapError.code}) → push 0011` : null);

  results.push(await runCheck("C02", "RLS enabled on 100% of public tables", async () =>
    needSnapshot() ?? ((snapshot.tables_without_rls as string[]).length ? `no RLS: ${snapshot.tables_without_rls}` : null)));
  results.push(await runCheck("C03", "0 non-SELECT policies", async () =>
    needSnapshot() ?? ((snapshot.non_select_policies as string[]).length ? `${snapshot.non_select_policies}` : null)));
  results.push(await runCheck("C04", "anon/authenticated hold no INSERT/UPDATE/DELETE/TRUNCATE; anon reads nothing", async () => {
    const missing = needSnapshot();
    if (missing) return missing;
    const writable = snapshot.client_writable_relations as string[];
    const anonRead = snapshot.anon_readable_relations as string[];
    return writable.length || anonRead.length ? `writable=${writable} anonRead=${anonRead}` : null;
  }));
  results.push(await runCheck("C05", "Function grants: anon none; authenticated only the 5 helpers (n1)", async () => {
    const missing = needSnapshot();
    if (missing) return missing;
    const anonFns = snapshot.anon_executable_functions as string[];
    const authFns = names(snapshot.authenticated_executable_functions as string[]);
    if (anonFns.length) return `anon can execute ${anonFns}`;
    return JSON.stringify(authFns) === JSON.stringify(ALLOWED_AUTHENTICATED_FUNCTIONS) ? null : `authenticated: ${authFns}`;
  }));

  const trade = await signedInClient("test-trade@sakura-demo.example", testPassword);
  const { data: anyLot } = await admin.from("lots").select("id, business_date").limit(1).single();
  const { data: anyBuyer } = await admin.from("participants").select("id").eq("buyer_no", "N01").single();
  const { data: me } = await trade.auth.getUser();

  results.push(await runCheck("C06", "JWT test-trade@: direct REST insert into trades is rejected", async () =>
    expectRejected(await trade.from("trades").insert({
      trade_no: `PROBE-${Date.now()}`, business_date: anyLot?.business_date, lot_id: anyLot?.id,
      buyer_id: anyBuyer?.id, channel: "AITAI", qty: 1, unit_price_jpy: 1, amount_jpy: 1, status: "CONFIRMED",
    }), "42501", "permission denied")));
  results.push(await runCheck("C07", "JWT test-trade@: direct REST insert into lot_quantity_ledger is rejected", async () =>
    expectRejected(await trade.from("lot_quantity_ledger").insert({
      lot_id: anyLot?.id, business_date: anyLot?.business_date, qty_delta: 999, reason: "probe",
    }), "42501", "permission denied")));
  results.push(await runCheck("C08", "JWT test-trade@: changing own role to SYSADM is rejected", async () => {
    const attempt = await trade.from("profiles").update({ role: "SYSADM" }).eq("user_id", me.user?.id ?? "");
    const { data: after } = await admin.from("profiles").select("role").eq("user_id", me.user?.id ?? "").single();
    if (after?.role !== "TRADE") return `role is now ${after?.role}`;
    return expectRejected(attempt, "42501", "permission denied");
  }));
  results.push(await runCheck("C09", "JWT test-trade@: profile_pins is unreadable (n2)", async () =>
    expectRejected(await trade.from("profile_pins").select("user_id").limit(1), "42501", "permission denied")));
  results.push(await runCheck("C10", "anon: rpc get_my_profile / reset_demo_business_data rejected", async () => {
    const a = await anonClient().rpc("get_my_profile");
    const b = await anonClient().rpc("reset_demo_business_data");
    return expectRejected(a, "42501", "permission denied") ?? expectRejected(b, "42501", "permission denied");
  }));
  results.push(await runCheck("C11", "JWT test-trade@: rpc reset_demo_business_data rejected", async () =>
    expectRejected(await trade.rpc("reset_demo_business_data"), "42501", "permission denied")));
  await trade.auth.signOut();
  return results;
}
