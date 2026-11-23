// Code review 2026-11-23 — integrity / authorization fixes (C1 void, W2, W5, W6, W7, W8, W9, W11b, S1).
// Each check FAILS on the code before migration 0024–0026 and must PASS after.

import type { SupabaseClient } from "@supabase/supabase-js";
import { parsePaymentCsv } from "../../src/lib/services/payment-csv-parser";
import { AppHttpSession } from "./app-http-session";
import { demoClient, participantId, todayLot } from "./demo-sessions-and-lookups";
import { requireEnv } from "./script-supabase-clients";
import { expectRejected, runCheck, signedInClient, type CheckResult } from "./security-check-runner";

export async function runIntegrityFixChecks(admin: SupabaseClient, today: string): Promise<CheckResult[]> {
  const r: CheckResult[] = [];
  const pw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const [trade, settle, ruleDemo] = await Promise.all(["trade", "settle", "rule"].map(demoClient));
  const [tRule, head, sys, tTrade] = await Promise.all(["test-rule", "test-stlhead", "test-sysadm", "test-trade"].map((u) => signedInClient(`${u}@sakura-demo.example`, pw)));

  r.push(await runCheck("R07", "C1: importer cannot void own batch; 照合部門長 voids → payments excluded from 完納", async () => {
    const { data, error } = await settle.rpc("import_payments", { p_file_name: "取消テスト.csv", p_rows: [{ line: 2, buyer_no: "N01", paid_on: today, amount: 777 }], p_file_sha256: "b".repeat(64) });
    if (error) return error.message;
    const own = expectRejected(await settle.rpc("void_payment_batch", { p_batch_id: data.batch_id, p_reason: "テスト" }), "FORBIDDEN");
    if (own) return own;
    const v = await head.rpc("void_payment_batch", { p_batch_id: data.batch_id, p_reason: "テスト：二重取込" });
    const { count } = await admin.from("payment_batch_voids").select("id", { count: "exact", head: true }).eq("batch_id", data.batch_id);
    return v.error ? v.error.message : count === 1 ? null : "void row missing";
  }));
  r.push(await runCheck("R08", "W2: qty with more than 2 decimals is refused (amount would differ from qty × price)", async () =>
    expectRejected(await trade.rpc("confirm_aitai_trade", { p_lot_id: await todayLot(admin, 6), p_buyer_id: await participantId(admin, "N01"), p_qty: 0.333, p_unit_price_jpy: 1000000, p_over_limit_reason: "" }), "VALIDATION")));
  r.push(await runCheck("R09", "W8: システム管理者 cannot grant an authority to itself", async () => {
    const { data: me } = await sys.auth.getUser();
    const res = await sys.rpc("admin_upsert_account", { p_user_id: me.user?.id, p_employee_no: "T9003", p_display_name: "テスト用 管理", p_role: "SYSADM", p_authorities: ["STL_HEAD"], p_is_active: true });
    if (!res.error) await admin.from("user_authorities").delete().eq("user_id", me.user?.id ?? "");
    return expectRejected(res, "FORBIDDEN");
  }));
  r.push(await runCheck("R10", "W9: another ルール管理者 cannot edit the rates of someone else's draft", async () => {
    const nextMonth = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7), 1)).toISOString().slice(0, 10);
    const { data: draft, error } = await tRule.rpc("create_rule_version", { p_effective_from: nextMonth, p_note: "テスト", p_rollback_source: null });
    if (error) return error.message;
    return expectRejected(await ruleDemo.rpc("save_rate_rows", { p_version_id: draft, p_rows: [{ min: 0, max: null, rate: 1 }] }), "FORBIDDEN");
  }));
  r.push(await runCheck("R11", "W5: buyer_no must be upper-case A–Z0–9 (1–10) and present for 仲卸 / 売買参加者", async () =>
    expectRejected(await settle.rpc("upsert_participant", { p_id: null, p_kind: "NAKAOROSHI", p_name: "サンプル仲卸テスト", p_buyer_no: "n99", p_email: "", p_deposit_jpy: 0, p_status: "ACTIVE" }), "VALIDATION", "23514", "check")));
  r.push(await runCheck("R12", "W7: 取引担当 cannot read period payables; staff_display_names hides employee_no outside 管理", async () => {
    const { data: p } = await admin.from("payment_periods").select("id").eq("status", "LOCKED").limit(1).single();
    const denied = expectRejected(await trade.rpc("period_payables", { p_period_id: p?.id }), "FORBIDDEN");
    if (denied) return denied;
    const { data: me } = await settle.auth.getUser();
    const { data } = await trade.rpc("staff_display_names", { p_user_ids: [me.user?.id] });
    return (data ?? [])[0]?.employee_no == null ? null : "employee_no exposed";
  }));
  r.push(await runCheck("R13", "W11: a correction cannot reduce qty below what was already delivered", async () => {
    const { data: t } = await admin.from("trades").select("id, unit_price_jpy, buyer_id").lt("business_date", today).eq("channel", "AITAI").order("trade_no", { ascending: false }).limit(1).single();
    const { data: id } = await tTrade.rpc("submit_correction", { p_trade_id: t?.id, p_new_qty: 1, p_new_unit_price_jpy: t?.unit_price_jpy, p_new_buyer_id: t?.buyer_id, p_reason: "テスト：引渡済より少ない" });
    return expectRejected(await head.rpc("approve_correction", { p_id: id }), "CONFLICT");
  }));
  r.push(await runCheck("R14", "W6: impossible dates (2026-02-31) are a per-line CSV error", async () => {
    const res = parsePaymentCsv("買受人番号,入金日,金額\nN01,2026-02-31,1000\nN01,2026-02-28,1000");
    return res.errors.length === 1 && res.errors[0].line === 2 && res.rows.length === 1 ? null : `errors=${res.errors.length} rows=${res.rows.length}`;
  }));
  r.push(await runCheck("R15", "S1: malformed id / qty via API → 404 / 422, never 500", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const s = await AppHttpSession.signIn("trade@sakura-demo.example", requireEnv("DEMO_ACCOUNT_PASSWORD"));
    const a = await s.request("/api/trades/not-a-uuid");
    const b = await s.request("/api/trades/aitai", { method: "POST", body: { lotId: await todayLot(admin, 6), buyerId: await participantId(admin, "N01"), qty: 0.333, unitPriceJpy: 1000 } });
    return a.status === 404 && b.status === 422 ? null : `id=${a.status} qty=${b.status}`;
  }));
  await Promise.all([trade, settle, ruleDemo, tRule, head, sys, tTrade].map((c) => c.auth.signOut()));
  return r;
}
