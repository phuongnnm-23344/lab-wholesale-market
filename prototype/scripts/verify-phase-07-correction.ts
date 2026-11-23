// Usage: npm run verify:phase07   (+ APP_BASE_URL with `npm run dev` for K09)
// Phase 07 targets (rule 4): CORR on a CLOSED day → original trade untouched, REVERSE + DELTA dated on the
// open day, closed-day totals unchanged; buyer change A→B moves the money (M4); S3 approvals; reject reason.
// Re-seeds demo data at start and end.

import { AppHttpSession } from "./lib/app-http-session";
import { compactDate, currentDay, demoClient, participantId, previousDay, resetDemoData, settlementTotal, tradeByNo } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, summarize, type CheckResult } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const today = await currentDay(admin);
  const closed = previousDay(today);
  const [trade, stlhead, opshead] = await Promise.all(["trade", "stlhead", "opshead"].map(demoClient));
  const t = async (j: number) => tradeByNo(admin, `T${compactDate(closed)}-${j}-1`);
  const submit = (tr: { id: string }, qty: number, price: number, buyer: string, reason = "サンプル：伝票との照合で判明") =>
    trade.rpc("submit_correction", { p_trade_id: tr.id, p_new_qty: qty, p_new_unit_price_jpy: price, p_new_buyer_id: buyer, p_reason: reason });
  const adjustments = async (corrId: string) => (await admin.from("trade_adjustments").select("kind, buyer_id, amount_delta_jpy, business_date").eq("correction_id", corrId)).data ?? [];
  const r: CheckResult[] = [];
  const t1 = await t(1);
  let corr1 = "";

  r.push(await runCheck("K01", "取引担当 submits CORR on a closed-day trade; cannot approve own request", async () => {
    // Price correction: closed-day trades are fully delivered, so qty cannot go below the delivered qty (review W11).
    const { data, error } = await submit(t1, Number(t1.qty), Number(t1.unit_price_jpy) + 100, t1.buyer_id);
    if (error) return error.message;
    corr1 = data as string;
    return expectRejected(await trade.rpc("approve_correction", { p_id: corr1 }), "FORBIDDEN");
  }));
  r.push(await runCheck("K02", "照合部門長 approves → original row unchanged, REVERSE+DELTA dated today, closed-day total unchanged", async () => {
    const closedBefore = await settlementTotal(admin, closed);
    const { data, error } = await stlhead.rpc("approve_correction", { p_id: corr1 });
    if (error) return error.message;
    const after = await tradeByNo(admin, t1.trade_no);
    const adj = await adjustments(corr1);
    const same = after.qty === t1.qty && after.amount_jpy === t1.amount_jpy && after.updated_at === t1.updated_at;
    const kinds = adj.map((a) => `${a.kind}@${a.business_date}`).sort().join(",");
    return data === "APPROVED" && same && kinds === `DELTA@${today},REVERSE@${today}` && (await settlementTotal(admin, closed)) === closedBefore
      ? null : `status=${data} same=${same} kinds=${kinds}`;
  }));
  r.push(await runCheck("K03", "Buyer change A→B (amount X): today's settlement A −X, B +X", async () => {
    const t2 = await t(2);
    const candidates = ["N01", "N02"].map((n) => participantId(admin, n));
    const ids = await Promise.all(candidates);
    const b = ids.find((id) => id !== t2.buyer_id) as string;
    const [aBefore, bBefore] = [await settlementTotal(admin, today, t2.buyer_id), await settlementTotal(admin, today, b)];
    const { data: id, error } = await submit(t2, Number(t2.qty), Number(t2.unit_price_jpy), b);
    if (error) return error.message;
    const ok = await stlhead.rpc("approve_correction", { p_id: id });
    if (ok.error) return ok.error.message;
    const x = Number(t2.amount_jpy);
    const [aAfter, bAfter] = [await settlementTotal(admin, today, t2.buyer_id), await settlementTotal(admin, today, b)];
    return aAfter - aBefore === -x && bAfter - bBefore === x ? null : `A ${aBefore}→${aAfter}, B ${bBefore}→${bAfter}, X=${x}`;
  }));
  let corrBad = "";
  r.push(await runCheck("K04", "Change to a buyer with expired 承認 (B08) → APPROVAL_INVALID at approval", async () => {
    const t3 = await t(3);
    corrBad = (await submit(t3, Number(t3.qty), Number(t3.unit_price_jpy), await participantId(admin, "B08"))).data as string;
    return expectRejected(await stlhead.rpc("approve_correction", { p_id: corrBad }), "APPROVAL_INVALID");
  }));
  r.push(await runCheck("K05", "Reject needs a reason (VALIDATION); with reason → REJECTED", async () => {
    const noReason = expectRejected(await stlhead.rpc("reject_correction", { p_id: corrBad, p_reason: "" }), "VALIDATION");
    if (noReason) return noReason;
    const { error } = await stlhead.rpc("reject_correction", { p_id: corrBad, p_reason: "サンプル：買受人の承認期限切れ" });
    const { data } = await admin.from("correction_requests").select("status").eq("id", corrBad).single();
    return error ? error.message : data?.status === "REJECTED" ? null : `status=${data?.status}`;
  }));
  r.push(await runCheck("K06", "|change| ≥ 300,000 → 2 levels: 部門長 → FIRST_APPROVED; same person again → FORBIDDEN; 運用部門長 → APPROVED", async () => {
    const t4 = await t(4);
    const { data: id, error } = await submit(t4, Number(t4.qty), 12000, t4.buyer_id);
    if (error) return error.message;
    const first = await stlhead.rpc("approve_correction", { p_id: id });
    const again = expectRejected(await stlhead.rpc("approve_correction", { p_id: id }), "FORBIDDEN");
    const second = await opshead.rpc("approve_correction", { p_id: id });
    return first.data === "FIRST_APPROVED" && !again && second.data === "APPROVED" ? null : `first=${first.data ?? first.error?.message} again=${again} second=${second.data ?? second.error?.message}`;
  }));
  r.push(await runCheck("K07", "JWT 照合部門長: direct REST insert into trade_adjustments rejected (M1)", async () =>
    expectRejected(await stlhead.from("trade_adjustments").insert({ correction_id: corr1, trade_id: t1.id, kind: "DELTA", buyer_id: t1.buyer_id, unit_price_jpy: 1, qty_delta: 1, amount_delta_jpy: 1, business_date: today }), "42501", "permission denied")));
  let corrRace = "";
  r.push(await runCheck("K08", "Two simultaneous approvals → exactly one set of REVERSE/DELTA", async () => {
    const t5 = await t(5);
    corrRace = (await submit(t5, Number(t5.qty), Number(t5.unit_price_jpy) + 50, t5.buyer_id)).data as string;
    const results = await Promise.all([1, 2].map(() => stlhead.rpc("approve_correction", { p_id: corrRace })));
    const okCount = results.filter((x) => x.data === "APPROVED").length;
    return okCount === 1 && (await adjustments(corrRace)).length === 2 ? null : `ok=${okCount}`;
  }));
  r.push(await runCheck("K09", "HTTP: trade@ POST /api/corrections/[id]/approve → 403", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const s = await AppHttpSession.signIn("trade@sakura-demo.example", requireEnv("DEMO_ACCOUNT_PASSWORD"));
    const res = await s.request(`/api/corrections/${corrRace}/approve`, { method: "POST" });
    return res.status === 403 ? null : `HTTP ${res.status}`;
  }));

  await Promise.all([trade, stlhead, opshead].map((c) => c.auth.signOut()));
  await resetDemoData(admin);
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
