// Phase 03 targets at the DB layer (RPCs): 許可 ≠ 承認, role checks, demo protection, PIN switch (N1).
// Writes use TEST accounts or sample participants only; demo accounts are only used for calls that
// must be rejected, and for PIN-switch SOURCE / eligibility (their PIN counters are never incremented).

import type { SupabaseClient } from "@supabase/supabase-js";
import { expectRejected, runCheck, signedInClient, type CheckResult } from "./security-check-runner";
import { requireEnv } from "./script-supabase-clients";

const D = "sakura-demo.example";

export async function runPhase03DbChecks(admin: SupabaseClient): Promise<CheckResult[]> {
  const r: CheckResult[] = [];
  const testPw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const pin = requireEnv("DEMO_ACCOUNT_PIN");
  const id = async (emp: string) => (await admin.from("profiles").select("user_id").eq("employee_no", emp).single()).data?.user_id as string;
  const pid = async (no: string) => (await admin.from("participants").select("id").eq("buyer_no", no).single()).data?.id as string;
  const [n01, b01] = [await pid("N01"), await pid("B01")];
  const [intake, settle, trade, testTrade, testSettle] =
    [await id("S1001"), await id("S1006"), await id("S1003"), await id("T9002"), await id("T9001")];
  const settleC = await signedInClient(`test-settle@${D}`, testPw);
  const tradeC = await signedInClient(`test-trade@${D}`, testPw);
  const sysC = await signedInClient(`test-sysadm@${D}`, testPw);
  const verify = (source: string, emp: string, p: string) =>
    admin.rpc("verify_pin_for_switch", { p_source_user_id: source, p_employee_no: emp, p_pin: p });
  const code = async (q: ReturnType<typeof verify>) => ((await q).data as { code?: string } | null)?.code;
  const account = (uid: string, emp: string, role: string, auths: string[], active: boolean) =>
    sysC.rpc("admin_upsert_account", { p_user_id: uid, p_employee_no: emp, p_display_name: `テスト用 ${emp}`,
      p_role: role, p_authorities: auths, p_is_active: active });

  r.push(await runCheck("D01", "許可 renewal for 仲卸 N01: new ACTIVE row, old row SUPERSEDED (history kept)", async () => {
    const { error } = await settleC.rpc("register_nakaoroshi_permit", { p_participant_id: n01, p_permit_no: `サンプル許可-N01-${Date.now()}`, p_valid_from: "2026-11-01", p_valid_to: "2028-10-31" });
    if (error) return error.message;
    const { data } = await admin.from("nakaoroshi_permits").select("status").eq("participant_id", n01);
    const active = (data ?? []).filter((x) => x.status === "ACTIVE").length;
    const old = (data ?? []).filter((x) => x.status === "SUPERSEDED").length;
    return active === 1 && old >= 1 ? null : `ACTIVE=${active} SUPERSEDED=${old}`;
  }));
  r.push(await runCheck("D02", "許可 for 売買参加者 and 承認 for 仲卸 are rejected (rule 2)", async () =>
    expectRejected(await settleC.rpc("register_nakaoroshi_permit", { p_participant_id: b01, p_permit_no: "X", p_valid_from: "2026-11-01", p_valid_to: "2027-11-01" }), "QUALIFICATION_KIND_MISMATCH") ??
    expectRejected(await settleC.rpc("register_baibai_approval", { p_participant_id: n01, p_approval_no: "X", p_valid_from: "2026-11-01", p_valid_to: "2027-11-01", p_limit_jpy: 1000 }), "QUALIFICATION_KIND_MISMATCH")));
  r.push(await runCheck("D03", "取引担当 cannot register 許可 (FORBIDDEN)", async () =>
    expectRejected(await tradeC.rpc("register_nakaoroshi_permit", { p_participant_id: n01, p_permit_no: "X", p_valid_from: "2026-11-01", p_valid_to: "2027-11-01" }), "FORBIDDEN")));
  r.push(await runCheck("D04", "Participant kind cannot be changed (仲卸 → 売買参加者)", async () =>
    expectRejected(await settleC.rpc("upsert_participant", { p_id: n01, p_kind: "BAIBAI", p_name: "サンプル仲卸1", p_buyer_no: "N01", p_email: "", p_deposit_jpy: 0, p_status: "ACTIVE" }), "VALIDATION")));
  r.push(await runCheck("D05", "Demo account trade@: role change and PIN set → DEMO_PROTECTED", async () =>
    expectRejected(await account(trade, "S1003", "SYSADM", [], true), "DEMO_PROTECTED") ??
    expectRejected(await sysC.rpc("admin_set_account_pin", { p_user_id: trade, p_pin: "1234" }), "DEMO_PROTECTED")));
  r.push(await runCheck("D06", "Grant STL_HEAD to test-settle → visible in its profile; then revoked", async () => {
    const { error } = await account(testSettle, "T9001", "SETTLE", ["STL_HEAD"], true);
    if (error) return error.message;
    const { data } = await settleC.rpc("get_my_profile");
    await account(testSettle, "T9001", "SETTLE", [], true);
    return (data?.authorities ?? []).includes("STL_HEAD") ? null : "authority not applied";
  }));
  r.push(await runCheck("D07", "JWT test-trade@: rpc verify_pin_for_switch is NOT executable (N1)", async () =>
    expectRejected(await tradeC.rpc("verify_pin_for_switch", { p_source_user_id: testTrade, p_employee_no: "S1002", p_pin: pin }), "42501", "permission denied")));
  r.push(await runCheck("D08", "PIN switch from 受付 to SYSADM / RULE / plain SETTLE → TARGET_NOT_ALLOWED (N1)", async () => {
    const codes = [await code(verify(intake, "S1010", pin)), await code(verify(intake, "S1009", pin)), await code(verify(intake, "S1006", pin))];
    return codes.every((c) => c === "TARGET_NOT_ALLOWED") ? null : `codes=${codes}`;
  }));
  r.push(await runCheck("D09", "PIN switch from plain 照合事務局 (not P12) → SOURCE_NOT_ALLOWED", async () =>
    (await code(verify(settle, "S1002", pin))) === "SOURCE_NOT_ALLOWED" ? null : "not rejected"));
  r.push(await runCheck("D10", "5 wrong PINs lock the target for 15 min (test-trade); correct PIN then still locked", async () => {
    const codes: (string | undefined)[] = [];
    for (let i = 0; i < 5; i++) codes.push(await code(verify(intake, "T9002", "0000" === pin ? "1111" : "0000")));
    const after = await code(verify(intake, "T9002", pin));
    await admin.rpc("admin_set_pin_hash", { p_user_id: testTrade, p_pin: pin });
    return codes.slice(0, 4).every((c) => c === "PIN_INVALID") && codes[4] === "PIN_LOCKED" && after === "PIN_LOCKED"
      ? null : `codes=${codes},${after}`;
  }));
  r.push(await runCheck("D11", "Deactivated target (test-trade) → TARGET_NOT_ALLOWED; reactivated → OK", async () => {
    await account(testTrade, "T9002", "TRADE", [], false);
    const off = await code(verify(intake, "T9002", pin));
    await account(testTrade, "T9002", "TRADE", [], true);
    const on = await code(verify(intake, "T9002", pin));
    return off === "TARGET_NOT_ALLOWED" && on === "OK" ? null : `off=${off} on=${on}`;
  }));
  await Promise.all([settleC, tradeC, sysC].map((c) => c.auth.signOut()));
  return r;
}
