// Usage: npm run verify:phase06   (+ APP_BASE_URL with `npm run dev` for G08)
// Phase 06 targets: partial / 「残り全部」 deliveries, over-delivery refused, settlement totals, day close
// only by 照合部門長, blocked by unconfirmed せり, final (DAY_LOCKED → 423). Re-seeds demo data at start AND end
// (closing the day moves the demo calendar).

import { AppHttpSession } from "./lib/app-http-session";
import { compactDate, currentDay, demoClient, participantId, resetDemoData, settlementTotal, todayLot, tradeByNo } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, summarize, type CheckResult } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const day = await currentDay(admin);
  const [delivery, trade, trade2, settle, stlhead, intake] =
    await Promise.all(["delivery", "trade", "trade2", "settle", "stlhead", "intake"].map(demoClient));
  const seedTrade = await tradeByNo(admin, `T${compactDate(day)}-5-1`);   // today, 30 kg, not delivered
  // Captured BEFORE closing: after the close, "today" moves to the next day.
  const [provisional1, provisional2] = [await todayLot(admin, 1), await todayLot(admin, 2)];
  const deliver = (id: string, qty: number | null, all: boolean, c = delivery) =>
    c.rpc("record_delivery", { p_trade_id: id, p_qty: qty, p_all_remaining: all });
  const r: CheckResult[] = [];

  r.push(await runCheck("G01", "Partial delivery 10 then 「残り全部」 → 2 rows, complete", async () => {
    const a = await deliver(seedTrade.id, 10, false);
    const b = await deliver(seedTrade.id, null, true);
    if (a.error || b.error) return (a.error ?? b.error)?.message ?? "";
    const { count } = await admin.from("deliveries").select("id", { count: "exact", head: true }).eq("trade_id", seedTrade.id);
    return a.data.complete === false && b.data.complete === true && count === 2 ? null : `a=${JSON.stringify(a.data)} b=${JSON.stringify(b.data)} rows=${count}`;
  }));
  r.push(await runCheck("G02", "Delivering more than the trade quantity → OVER_DELIVERY", async () => {
    const { data } = await trade.rpc("confirm_aitai_trade", { p_lot_id: await todayLot(admin, 6), p_buyer_id: await participantId(admin, "N01"), p_qty: 10, p_unit_price_jpy: 1000, p_over_limit_reason: "" });
    return expectRejected(await deliver(data.trade_id, 11, false), "OVER_DELIVERY");
  }));
  r.push(await runCheck("G03", "取引担当 cannot record a delivery (FORBIDDEN)", async () =>
    expectRejected(await deliver(seedTrade.id, 1, false, trade), "FORBIDDEN")));
  r.push(await runCheck("G04", "照合事務局 without 照合部門長 cannot close the day (FORBIDDEN)", async () =>
    expectRejected(await settle.rpc("close_business_day", { p_day: day }), "FORBIDDEN")));
  r.push(await runCheck("G05", "日次照合表 total (read as settle@) = sum of confirmed trades of the day", async () => {
    const { data } = await settle.from("v_daily_settlement").select("amount_total_jpy").eq("business_date", day);
    const viaSettle = (data ?? []).reduce((s, x) => s + Number(x.amount_total_jpy), 0);
    const { data: trades } = await admin.from("trades").select("amount_jpy").eq("business_date", day).eq("status", "CONFIRMED");
    const direct = (trades ?? []).reduce((s, x) => s + Number(x.amount_jpy), 0);
    return viaSettle === direct && viaSettle === (await settlementTotal(admin, day)) ? null : `${viaSettle} vs ${direct}`;
  }));
  r.push(await runCheck("G06", "Close is refused while a せり session is unconfirmed (CONFLICT)", async () => {
    const s = (await trade.rpc("create_seri_session")).data as string;
    await trade.rpc("add_seri_result", { p_session_id: s, p_lot_id: await todayLot(admin, 5), p_buyer_id: await participantId(admin, "N02"), p_qty: 1, p_unit_price_jpy: 1000 });
    const refused = expectRejected(await stlhead.rpc("close_business_day", { p_day: day }), "CONFLICT");
    await trade2.rpc("confirm_seri_session", { p_session_id: s, p_same_person_reason: "" });
    return refused;
  }));
  r.push(await runCheck("G07", "照合部門長 closes the day → LOCKED, next day OPEN; writing the closed day → DAY_LOCKED", async () => {
    const { data: next, error } = await stlhead.rpc("close_business_day", { p_day: day });
    if (error) return error.message;
    const { data: days } = await admin.from("business_days").select("business_date, status").in("business_date", [day, next]);
    const st = Object.fromEntries((days ?? []).map((d) => [d.business_date, d.status]));
    if (st[day] !== "LOCKED" || st[next] !== "OPEN") return `days=${JSON.stringify(st)}`;
    return expectRejected(await intake.rpc("register_lot", { p_lot_id: provisional1, p_shipper_name: "x", p_species: "x", p_unit: "kg", p_qty: 1 }), "DAY_LOCKED");
  }));
  r.push(await runCheck("G08", "HTTP: settle@ close → 403; completing a lot of the closed day → 423 (SC-00-05)", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const pw = requireEnv("DEMO_ACCOUNT_PASSWORD");
    const s = await (await AppHttpSession.signIn("settle@sakura-demo.example", pw)).request(`/api/business-days/${day}/close`, { method: "POST" });
    const i = await (await AppHttpSession.signIn("intake@sakura-demo.example", pw)).request("/api/lots", {
      method: "POST", body: { lotId: provisional2, shipperName: "サンプル第一丸", species: "サンプル真鯛", unit: "kg", qty: 1 } });
    return s.status === 403 && i.status === 423 && i.json?.error?.code === "DAY_LOCKED" ? null : `settle=${s.status} intake=${i.status} ${i.json?.error?.code}`;
  }));

  await Promise.all([delivery, trade, trade2, settle, stlhead, intake].map((c) => c.auth.signOut()));
  await resetDemoData(admin);
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
