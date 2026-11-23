// Usage: npm run verify:phase08   (+ APP_BASE_URL with `npm run dev` for V09)
// Phase 08 targets (rule 5 / PRM-042): 1st-of-month, maker ≠ checker, SUPERSEDED / CANCELLED, rollback = new
// version, quota 4 per fiscal year, locked periods unchanged. Writes use test-rule@ / test-stlhead@ only; demo
// data (quota 2/4) is re-seeded at start and end so the demo quota is never spent (n5).

import { AppHttpSession } from "./lib/app-http-session";
import { currentDay, demoClient, resetDemoData } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, signedInClient, summarize, type CheckResult } from "./lib/security-check-runner";

const firstOfMonth = (iso: string, add: number) => { const d = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + add); return d.toISOString().slice(0, 10); };
const V2_RATES = [{ min: 0, max: 1000000, rate: 6 }, { min: 1000000, max: 5000000, rate: 9 }, { min: 5000000, max: null, rate: 12 }];
const NEW_RATES = [{ min: 0, max: 2000000, rate: 7 }, { min: 2000000, max: null, rate: 11 }];

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const pw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const [rule, head, sys] = await Promise.all(["test-rule", "test-stlhead", "test-sysadm"].map((u) => signedInClient(`${u}@sakura-demo.example`, pw)));
  const trade = await demoClient("trade");
  const today = await currentDay(admin);
  const [m1, m2, m3] = [firstOfMonth(today, 1), firstOfMonth(today, 2), firstOfMonth(today, 3)];
  const ver = async (no: number) => (await admin.from("rule_versions").select("id, status, rollback_of").eq("version_no", no).single()).data as { id: string; status: string; rollback_of: string | null };
  const activeOn = async (d: string) => (await admin.rpc("active_rule_version_on", { p_day: d })).data as string;
  const create = async (eff: string, rows: object[] | null, source?: string) => {
    const { data: id, error } = await rule.rpc("create_rule_version", { p_effective_from: eff, p_note: "テスト", p_rollback_source: source ?? null });
    if (error) throw new Error(error.message);
    if (rows) { const s = await rule.rpc("save_rate_rows", { p_version_id: id, p_rows: rows }); if (s.error) throw new Error(s.error.message); }
    const sub = await rule.rpc("submit_rule_version", { p_id: id }); if (sub.error) throw new Error(sub.error.message);
    return id as string;
  };
  const p1Total = async () => ((await admin.from("incentive_results").select("incentive_jpy")).data ?? []).reduce((s, r) => s + Number(r.incentive_jpy), 0);
  const r: CheckResult[] = [];
  const v2 = await ver(2);
  let v3 = "", v4 = "";

  r.push(await runCheck("V01", "Effective date not 1st of month, or not after this month → VALIDATION", async () =>
    expectRejected(await rule.rpc("create_rule_version", { p_effective_from: `${m1.slice(0, 7)}-15`, p_note: "", p_rollback_source: null }), "VALIDATION") ??
    expectRejected(await rule.rpc("create_rule_version", { p_effective_from: firstOfMonth(today, 0), p_note: "", p_rollback_source: null }), "VALIDATION")));
  r.push(await runCheck("V02", "Rate bands with a gap → VALIDATION; valid bands + submit → PENDING; 取引担当 cannot approve", async () => {
    const { data: id } = await rule.rpc("create_rule_version", { p_effective_from: m1, p_note: "テスト", p_rollback_source: null });
    const gap = expectRejected(await rule.rpc("save_rate_rows", { p_version_id: id, p_rows: [{ min: 0, max: 100, rate: 1 }, { min: 200, max: null, rate: 2 }] }), "VALIDATION");
    if (gap) return gap;
    await rule.rpc("save_rate_rows", { p_version_id: id, p_rows: NEW_RATES });
    await rule.rpc("submit_rule_version", { p_id: id });
    v3 = id as string;
    const { data } = await admin.from("rule_versions").select("status").eq("id", v3).single();
    return data?.status !== "PENDING" ? `status=${data?.status}` : expectRejected(await trade.rpc("approve_rule_version", { p_id: v3 }), "FORBIDDEN");
  }));
  r.push(await runCheck("V03", "Maker cannot approve own version even with 照合部門長 authority (S4)", async () => {
    const { data: me } = await rule.auth.getUser();
    const set = (auths: string[]) => sys.rpc("admin_upsert_account", { p_user_id: me.user?.id, p_employee_no: "T9004", p_display_name: "テスト用 規則", p_role: "RULE", p_authorities: auths, p_is_active: true });
    await set(["STL_HEAD"]);
    const res = expectRejected(await rule.rpc("approve_rule_version", { p_id: v3 }), "FORBIDDEN");
    await set([]);
    return res;
  }));
  r.push(await runCheck("V04", "Checker approves → v3 ACTIVE, v2 SUPERSEDED; day before m1 still v2; locked-period results unchanged", async () => {
    const before = await p1Total();
    const { error } = await head.rpc("approve_rule_version", { p_id: v3 });
    if (error) return error.message;
    const dayBefore = new Date(Date.parse(`${m1}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    const ok = (await ver(2)).status === "SUPERSEDED" && (await activeOn(dayBefore)) === v2.id && (await activeOn(m1)) === v3 && (await p1Total()) === before;
    return ok ? null : `v2=${(await ver(2)).status}`;
  }));
  r.push(await runCheck("V05", "Rates of an approved version cannot change (RATE_LOCKED)", async () =>
    expectRejected(await rule.rpc("save_rate_rows", { p_version_id: v3, p_rows: V2_RATES }), "RATE_LOCKED")));
  r.push(await runCheck("V06", "Rollback = new version copying v2 rates, effective m2; after approval m2 uses it, m1 still v3", async () => {
    v4 = await create(m2, null, v2.id);
    const { error } = await head.rpc("approve_rule_version", { p_id: v4 });
    if (error) return error.message;
    const rates = (await admin.from("incentive_rate_rows").select("min_paid_jpy, rate_permille").eq("rule_version_id", v4).order("min_paid_jpy")).data ?? [];
    const same = JSON.stringify(rates.map((x) => [Number(x.min_paid_jpy), x.rate_permille])) === JSON.stringify(V2_RATES.map((x) => [x.min, x.rate]));
    const rb = (await admin.from("rule_versions").select("rollback_of").eq("id", v4).single()).data?.rollback_of;
    return same && rb === v3 && (await activeOn(m2)) === v4 && (await activeOn(m1)) === v3 ? null : `same=${same} rollback_of=${rb}`;
  }));
  r.push(await runCheck("V07", "5th approval in the fiscal year (rollback counted) → QUOTA_EXCEEDED", async () => {
    const used = (await admin.rpc("rule_version_quota_used", { p_day: m1 })).data;
    if (used !== 4) return `quota used ${used} (dates may cross fiscal years)`;
    const v5 = await create(m3, NEW_RATES);
    return expectRejected(await head.rpc("approve_rule_version", { p_id: v5 }), "QUOTA_EXCEEDED");
  }));
  r.push(await runCheck("V08", "Cancel v4 before it takes effect → CANCELLED, v3 ACTIVE again, quota back to 3", async () => {
    const { error } = await head.rpc("cancel_rule_version", { p_id: v4, p_reason: "テスト：取消" });
    if (error) return error.message;
    const ok = (await ver(4)).status === "CANCELLED" && (await activeOn(m2)) === v3
      && (await admin.from("rule_versions").select("status").eq("id", v3).single()).data?.status === "ACTIVE"
      && (await admin.rpc("rule_version_quota_used", { p_day: m1 })).data === 3;
    return ok ? null : "state not restored";
  }));
  r.push(await runCheck("V09", "HTTP: list shows 適用中 = v2 today; trade@ POST action → 403", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const demoPw = requireEnv("DEMO_ACCOUNT_PASSWORD");
    const list = await (await AppHttpSession.signIn("rule@sakura-demo.example", demoPw)).request("/api/rule-versions");
    const t = await (await AppHttpSession.signIn("trade@sakura-demo.example", demoPw)).request(`/api/rule-versions/${v3}/actions`, { method: "POST", body: { action: "approve" } });
    return list.json?.appliedVersionId === v2.id && t.status === 403 ? null : `applied=${list.json?.appliedVersionId} trade=${t.status}`;
  }));

  await Promise.all([rule, head, sys, trade].map((c) => c.auth.signOut()));
  await resetDemoData(admin);
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
