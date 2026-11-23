// Usage: npm run verify:phase09   (+ APP_BASE_URL with `npm run dev` for P09)
// Phase 09 targets: payables / 完納 (no grace), CSV import with per-line errors, preview writes nothing, run once,
// test vector 100 % match, CORR between run and lock caught next run (n4), DELTA per PRM-043 (old version, no
// re-judging 完納), lock opens next period (n5). Test accounts only; demo data re-seeded at start and end.

import { AppHttpSession } from "./lib/app-http-session";
import { resetDemoData } from "./lib/demo-sessions-and-lookups";
import { incentiveFor, paidOnTime, payableOf, periodAmounts, periods } from "./lib/phase-09-incentive-expectations";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, signedInClient, summarize, type CheckResult } from "./lib/security-check-runner";
import { parsePaymentCsv } from "../src/lib/services/payment-csv-parser";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const pw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const [settle, head, trade] = await Promise.all(["test-settle", "test-stlhead", "test-trade"].map((u) => signedInClient(`${u}@sakura-demo.example`, pw)));
  const [p1, p2, p3] = await periods(admin);
  const buyerNo = new Map(((await admin.from("participants").select("id, buyer_no")).data ?? []).map((x) => [x.id, x.buyer_no as string]));
  const results = async (periodId: string, kind: string) => (await admin.from("incentive_results").select("participant_id, ref_period_id, incentive_jpy, payable_jpy, kanno, rule_version_id").eq("period_id", periodId).eq("kind", kind)).data ?? [];
  const corr = async (tradeId: string, price: number) => {
    const { data: t } = await admin.from("trades").select("qty, buyer_id").eq("id", tradeId).single();
    const { data: id, error } = await trade.rpc("submit_correction", { p_trade_id: tradeId, p_new_qty: t?.qty, p_new_unit_price_jpy: price, p_new_buyer_id: t?.buyer_id, p_reason: "テスト：単価訂正" });
    if (error) throw new Error(error.message);
    const ok = await head.rpc("approve_correction", { p_id: id });
    if (ok.error) throw new Error(ok.error.message);
  };
  const firstTradeOf = async (p: { start_date: string; end_date: string }, buyer?: string) => {
    let q = admin.from("trades").select("id, buyer_id").eq("channel", "AITAI").gte("business_date", p.start_date).lte("business_date", p.end_date).order("trade_no").limit(1);
    if (buyer) q = q.eq("buyer_id", buyer);
    return (await q.single()).data as { id: string; buyer_id: string };
  };
  const r: CheckResult[] = [];

  r.push(await runCheck("P01", "Payables of locked P1 = seeded MAIN payables; B03 (−1 yen) and N03 (1 day late) not 完納", async () => {
    const { data } = await admin.rpc("period_payables", { p_period_id: p1.id });
    const main = new Map((await results(p1.id, "MAIN")).map((x) => [x.participant_id, x]));
    const rows = (data ?? []) as { participant_id: string; buyer_no: string; payable_jpy: number; kanno: boolean }[];
    const bad = rows.filter((x) => Number(main.get(x.participant_id)?.payable_jpy) !== Number(x.payable_jpy) || x.kanno !== (x.buyer_no !== "B03" && x.buyer_no !== "N03"));
    return rows.length > 0 && bad.length === 0 ? null : `${bad.length} mismatches of ${rows.length}`;
  }));
  r.push(await runCheck("P02", "CSV import for P2: unknown 買受人番号 and malformed line reported, the rest imported", async () => {
    const pay = ((await admin.rpc("period_payables", { p_period_id: p2.id })).data ?? []) as { buyer_no: string; payable_jpy: number }[];
    const onTime = new Date(Date.parse(`${p2.due_date}T00:00:00Z`) - 3 * 86_400_000).toISOString().slice(0, 10);
    const csv = ["買受人番号,入金日,金額", ...pay.map((x) => `${x.buyer_no},${onTime},${x.payable_jpy}`), `Z99,${onTime},1000`, "N01,2026/11/01,=1+1"].join("\n");
    const parsed = parsePaymentCsv(csv);
    const { data, error } = await settle.rpc("import_payments", { p_file_name: "テスト入金.csv", p_rows: parsed.rows });
    if (error) return error.message;
    return data.imported === pay.length && data.errors.length === 1 && parsed.errors.length === 1 ? null : `imported=${data.imported} dbErr=${data.errors.length} csvErr=${parsed.errors.length}`;
  }));
  r.push(await runCheck("P03", "Preview writes nothing", async () => {
    const before = (await admin.from("incentive_results").select("id", { count: "exact", head: true })).count;
    const { data, error } = await settle.rpc("preview_incentives", { p_period_id: p2.id });
    const after = (await admin.from("incentive_results").select("id", { count: "exact", head: true })).count;
    return error ? error.message : (data as unknown[]).length > 0 && before === after ? null : `rows=${(data as unknown[]).length} ${before}→${after}`;
  }));
  r.push(await runCheck("P04", "照合事務局 cannot run; 照合部門長 runs once; second run → CONFLICT", async () =>
    expectRejected(await settle.rpc("run_incentive_calc", { p_period_id: p2.id }), "FORBIDDEN") ??
    ((await head.rpc("run_incentive_calc", { p_period_id: p2.id })).error?.message ?? null) ??
    expectRejected(await head.rpc("run_incentive_calc", { p_period_id: p2.id }), "CONFLICT")));
  r.push(await runCheck("P05", "Test vector: every MAIN row of P2 equals the independent TypeScript calculation", async () => {
    const amounts = await periodAmounts(admin, p2), paid = await paidOnTime(admin, p2);
    const version = (await admin.rpc("active_rule_version_on", { p_day: p2.end_date })).data as string;
    const rows = await results(p2.id, "MAIN");
    for (const x of rows) {
      const payable = payableOf(amounts.get(x.participant_id) ?? 0);
      const kanno = (paid.get(x.participant_id) ?? 0) >= payable;
      const expected = kanno ? await incentiveFor(admin, payable, version) : 0;
      if (Number(x.payable_jpy) !== payable || x.kanno !== kanno || Number(x.incentive_jpy) !== expected) return `${buyerNo.get(x.participant_id)}: ${x.incentive_jpy} vs ${expected}`;
    }
    return rows.length > 0 ? null : "no rows";
  }));
  let p2Buyer = "";
  r.push(await runCheck("P06", "CORR on a P2 trade AFTER run, then lock P2 → LOCKED; next period exists", async () => {
    const t = await firstTradeOf(p2);
    p2Buyer = t.buyer_id;
    await corr(t.id, 3000);
    const { data, error } = await head.rpc("lock_period", { p_period_id: p2.id });
    const { data: s } = await admin.from("payment_periods").select("status").eq("id", p2.id).single();
    return error ? error.message : s?.status === "LOCKED" && data === p3.period_code ? null : `status=${s?.status} next=${data}`;
  }));
  r.push(await runCheck("P07", "Run P3 → DELTA for P1 (完納 buyer, P1's own version) and P2 (n4); none for non-完納 N03", async () => {
    const n03 = [...buyerNo].find(([, no]) => no === "N03")?.[0] as string;
    const kannoP1 = (await results(p1.id, "MAIN")).find((x) => x.kanno) as { participant_id: string; rule_version_id: string; incentive_jpy: number };
    await corr((await firstTradeOf(p1, kannoP1.participant_id)).id, 3000);
    await corr((await firstTradeOf(p1, n03)).id, 3000);
    const { error } = await head.rpc("run_incentive_calc", { p_period_id: p3.id });
    if (error) return error.message;
    const deltas = await results(p3.id, "DELTA");
    const d1 = deltas.find((x) => x.participant_id === kannoP1.participant_id && x.ref_period_id === p1.id);
    const expected = (await incentiveFor(admin, payableOf((await periodAmounts(admin, p1)).get(kannoP1.participant_id) ?? 0), kannoP1.rule_version_id)) - Number(kannoP1.incentive_jpy);
    const dP2 = deltas.some((x) => x.participant_id === p2Buyer && x.ref_period_id === p2.id);
    const dN03 = deltas.some((x) => x.participant_id === n03);
    return d1 && Number(d1.incentive_jpy) === expected && d1.rule_version_id === kannoP1.rule_version_id && dP2 && !dN03
      ? null : `P1 delta=${d1?.incentive_jpy} expected=${expected} p2=${dP2} n03=${dN03}`;
  }));
  r.push(await runCheck("P08", "Locking P3 opens the following period (OPEN)", async () => {
    const { data: next, error } = await head.rpc("lock_period", { p_period_id: p3.id });
    if (error) return error.message;
    const { data } = await admin.from("payment_periods").select("status").eq("period_code", next).single();
    return data?.status === "OPEN" ? null : `next=${next} status=${data?.status}`;
  }));
  r.push(await runCheck("P09", "HTTP: settle@ run → 403; CSV import via API reports the unknown buyer line", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const s = await AppHttpSession.signIn("settle@sakura-demo.example", requireEnv("DEMO_ACCOUNT_PASSWORD"));
    const run = await s.request(`/api/periods/${p3.id}`, { method: "POST", body: { action: "run" } });
    const imp = await s.request("/api/payments/import", { method: "POST", body: { fileName: "サンプル.csv", csv: "買受人番号,入金日,金額\nN01,2026-11-05,1000\nZ99,2026-11-05,1000" } });
    return [403, 409].includes(run.status) && imp.status === 201 && imp.json?.errors?.length === 1 ? null : `run=${run.status} import=${imp.status}`;
  }));

  await Promise.all([settle, head, trade].map((c) => c.auth.signOut()));
  await resetDemoData(admin);
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
