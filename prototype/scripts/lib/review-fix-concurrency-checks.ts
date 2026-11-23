// Code review 2026-11-23 — races reproduced with Promise.all (two sessions hitting the same resource).
// Each check FAILS on the code before migration 0024–0026 and must PASS after (W3, W4, W10, W11, W12, C1).

import type { SupabaseClient } from "@supabase/supabase-js";
import { demoClient, participantId, todayLot } from "./demo-sessions-and-lookups";
import { requireEnv } from "./script-supabase-clients";
import { runCheck, signedInClient, type CheckResult } from "./security-check-runner";

const ok = (r: { error: unknown }) => !r.error;
const firstOfMonth = (iso: string, add: number) => { const d = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + add); return d.toISOString().slice(0, 10); };

export async function runConcurrencyChecks(admin: SupabaseClient, today: string): Promise<CheckResult[]> {
  const r: CheckResult[] = [];
  const pw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const [intake, trade, trade2] = await Promise.all(["intake", "trade", "trade2"].map(demoClient));
  const [rule, head, tTrade] = await Promise.all(["test-rule", "test-stlhead", "test-trade"].map((u) => signedInClient(`${u}@sakura-demo.example`, pw)));

  const parallel = Number(process.env.REVIEW_PARALLEL ?? 40);
  r.push(await runCheck("R01", `W4: ${parallel} parallel 仮受付 all succeed (no duplicate lot_no)`, async () => {
    const res = await Promise.all(Array.from({ length: parallel }, () => intake.rpc("provisional_receive_lot", { p_shipper_name: "サンプル第一丸", p_species: "サンプル真鯛", p_qty_estimate: 10 })));
    const failed = res.filter((x) => !ok(x));
    return failed.length === 0 ? null : `${failed.length}/${parallel} failed: ${failed[0].error?.message}`;
  }));
  r.push(await runCheck("R02", "W3: two parallel 相対 for B07 (limit 300,000) on different lots, 200,000 each → exactly one accepted", async () => {
    const b07 = await participantId(admin, "B07");
    const [l5, l6] = [await todayLot(admin, 5), await todayLot(admin, 6)];
    const res = await Promise.all([[trade, l5], [trade, l6]].map(([c, lot]) => (c as SupabaseClient).rpc("confirm_aitai_trade", { p_lot_id: lot, p_buyer_id: b07, p_qty: 10, p_unit_price_jpy: 20000, p_over_limit_reason: "" })));
    const accepted = res.filter(ok).length;
    return accepted === 1 ? null : `${accepted} accepted`;
  }));
  r.push(await runCheck("R03", "W11: two parallel 修正申請 for the same trade → only one pending", async () => {
    const { data: t } = await admin.from("trades").select("id, qty, unit_price_jpy, buyer_id").lt("business_date", today).eq("channel", "AITAI").order("trade_no").limit(1).single();
    const res = await Promise.all([1, 2].map(() => tTrade.rpc("submit_correction", { p_trade_id: t?.id, p_new_qty: Number(t?.qty) - 1, p_new_unit_price_jpy: t?.unit_price_jpy, p_new_buyer_id: t?.buyer_id, p_reason: "テスト：並行" })));
    return res.filter(ok).length === 1 ? null : `${res.filter(ok).length} accepted`;
  }));
  r.push(await runCheck("R04", "W12: two せり sessions reserve the whole remaining qty of one lot in parallel → only one accepted", async () => {
    const lot = await todayLot(admin, 5);
    const { data: q } = await admin.from("v_lot_available_qty").select("available_qty").eq("lot_id", lot).single();
    const n02 = await participantId(admin, "N02");
    const [s1, s2] = [(await trade.rpc("create_seri_session")).data, (await trade2.rpc("create_seri_session")).data];
    const res = await Promise.all([[trade, s1], [trade2, s2]].map(([c, s]) => (c as SupabaseClient).rpc("add_seri_result", { p_session_id: s, p_lot_id: lot, p_buyer_id: n02, p_qty: Number(q?.available_qty), p_unit_price_jpy: 1000 })));
    return res.filter(ok).length === 1 ? null : `${res.filter(ok).length} accepted`;
  }));
  r.push(await runCheck("R05", "W10: quota 3/4, two approvals in parallel → only one becomes ACTIVE (max 4 / fiscal year)", async () => {
    const make = async (eff: string) => {
      const { data: id, error } = await rule.rpc("create_rule_version", { p_effective_from: eff, p_note: "テスト", p_rollback_source: null });
      if (error) throw new Error(error.message);
      await rule.rpc("save_rate_rows", { p_version_id: id, p_rows: [{ min: 0, max: null, rate: 5 }] });
      await rule.rpc("submit_rule_version", { p_id: id });
      return id as string;
    };
    const v3 = await make(firstOfMonth(today, 1));
    await head.rpc("approve_rule_version", { p_id: v3 });
    const [v4, v5] = [await make(firstOfMonth(today, 2)), await make(firstOfMonth(today, 3))];
    const res = await Promise.all([v4, v5].map((id) => head.rpc("approve_rule_version", { p_id: id })));
    const used = (await admin.rpc("rule_version_quota_used", { p_day: firstOfMonth(today, 1) })).data;
    return res.filter(ok).length === 1 && used === 4 ? null : `${res.filter(ok).length} approved, quota ${used}`;
  }));
  r.push(await runCheck("R06", "C1: importing the same file twice (in parallel) → only one batch, the other DUPLICATE_FILE", async () => {
    const rows = [{ line: 2, buyer_no: "N01", paid_on: today, amount: 1000 }];
    const settle = await demoClient("settle");
    const res = await Promise.all([1, 2].map(() => settle.rpc("import_payments", { p_file_name: "重複テスト.csv", p_rows: rows, p_file_sha256: "a".repeat(64) })));
    const dup = res.find((x) => !ok(x));
    return res.filter(ok).length === 1 && dup?.error?.message.includes("DUPLICATE_FILE") ? null : `${res.filter(ok).length} accepted ${dup?.error?.message ?? ""}`;
  }));
  return r;
}
