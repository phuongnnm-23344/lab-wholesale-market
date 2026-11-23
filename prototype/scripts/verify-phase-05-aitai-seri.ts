// Usage: npm run verify:phase05   (+ APP_BASE_URL=http://localhost:PORT with `npm run dev` for F10–F11)
// Phase 05 targets: 相対 main flow, 許可 / 承認 checked at confirmation with DIFFERENT errors, qty never
// negative, 参加上限 reason, せり results confirmed by a person (S2). Re-seeds demo data first.

import { AppHttpSession } from "./lib/app-http-session";
import { availableQty, demoClient, participantId, resetDemoData, todayLot } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, summarize, type CheckResult } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const [trade, trade2, delivery] = [await demoClient("trade"), await demoClient("trade2"), await demoClient("delivery")];
  const lot6 = await todayLot(admin, 6);
  const lot5 = await todayLot(admin, 5);
  const p = { n01: await participantId(admin, "N01"), n08: await participantId(admin, "N08"), b08: await participantId(admin, "B08"), b07: await participantId(admin, "B07"), n02: await participantId(admin, "N02") };
  const { data: kaidashi } = await admin.from("participants").select("id").eq("kind", "KAIDASHI").limit(1).single();
  const aitai = (buyer: string, qty: number, price: number, reason = "", client = trade) =>
    client.rpc("confirm_aitai_trade", { p_lot_id: lot6, p_buyer_id: buyer, p_qty: qty, p_unit_price_jpy: price, p_over_limit_reason: reason });
  const r: CheckResult[] = [];

  r.push(await runCheck("F01", "相対 confirm (仲卸 N01, 10 kg) → CONFIRMED trade, ledger −10", async () => {
    const before = await availableQty(admin, lot6);
    const { data, error } = await aitai(p.n01, 10, 1500);
    if (error) return error.message;
    const after = await availableQty(admin, lot6);
    return data?.amount_jpy === 15000 && after === before - 10 ? null : `amount=${data?.amount_jpy} qty ${before}→${after}`;
  }));
  r.push(await runCheck("F02", "Expired 許可 (N08) → PERMIT_INVALID; expired 承認 (B08) → APPROVAL_INVALID (rule 2)", async () =>
    expectRejected(await aitai(p.n08, 1, 1000), "PERMIT_INVALID") ?? expectRejected(await aitai(p.b08, 1, 1000), "APPROVAL_INVALID")));
  r.push(await runCheck("F03", "qty > available → INSUFFICIENT_QTY; 買出人 as buyer → BUYER_NOT_ALLOWED", async () =>
    expectRejected(await aitai(p.n01, 10_000, 1000), "INSUFFICIENT_QTY") ??
    expectRejected(await aitai(kaidashi?.id as string, 1, 1000), "BUYER_NOT_ALLOWED")));
  r.push(await runCheck("F04", "売買参加者 B07 over 参加上限: no reason → rejected; with reason → confirmed + reason stored", async () => {
    const first = expectRejected(await aitai(p.b07, 30, 12000), "OVER_LIMIT_REASON_REQUIRED");
    if (first) return first;
    const { data, error } = await aitai(p.b07, 30, 12000, "サンプル：上長了承済み");
    if (error) return error.message;
    const { data: row } = await admin.from("trades").select("over_limit_reason").eq("id", data.trade_id).single();
    return data.over_limit && row?.over_limit_reason ? null : "reason not stored";
  }));
  r.push(await runCheck("F05", "配送担当 cannot confirm a 相対 trade (FORBIDDEN)", async () =>
    expectRejected(await aitai(p.n01, 1, 1000, "", delivery), "FORBIDDEN")));

  let session1 = "";
  r.push(await runCheck("F06", "せり: result row is PROVISIONAL and does not move stock", async () => {
    const before = await availableQty(admin, lot5);
    session1 = (await trade.rpc("create_seri_session")).data as string;
    const { error } = await trade.rpc("add_seri_result", { p_session_id: session1, p_lot_id: lot5, p_buyer_id: p.n02, p_qty: 5, p_unit_price_jpy: 3000 });
    if (error) return error.message;
    const { data: rows } = await admin.from("trades").select("status").eq("seri_session_id", session1);
    return rows?.[0]?.status === "PROVISIONAL" && (await availableQty(admin, lot5)) === before ? null : "stock moved or wrong status";
  }));
  r.push(await runCheck("F07", "Entry person confirms own session without reason → SAME_PERSON_REASON_REQUIRED (S2)", async () =>
    expectRejected(await trade.rpc("confirm_seri_session", { p_session_id: session1, p_same_person_reason: "" }), "SAME_PERSON_REASON_REQUIRED")));
  r.push(await runCheck("F08", "Second person (trade2@) confirms → CONFIRMED, ledger −5, confirmer + time stored", async () => {
    const before = await availableQty(admin, lot5);
    const { error } = await trade2.rpc("confirm_seri_session", { p_session_id: session1, p_same_person_reason: "" });
    if (error) return error.message;
    const { data: s } = await admin.from("seri_sessions").select("status, confirmed_by, confirmed_at").eq("id", session1).single();
    const { data: me } = await trade2.auth.getUser();
    return s?.status === "CONFIRMED" && s.confirmed_by === me.user?.id && s.confirmed_at && (await availableQty(admin, lot5)) === before - 5
      ? null : `session=${JSON.stringify(s)}`;
  }));
  r.push(await runCheck("F09", "Same person WITH reason → confirmed and reason stored (shown in 要確認)", async () => {
    const s2 = (await trade.rpc("create_seri_session")).data as string;
    await trade.rpc("add_seri_result", { p_session_id: s2, p_lot_id: lot5, p_buyer_id: p.n02, p_qty: 2, p_unit_price_jpy: 2500 });
    const { error } = await trade.rpc("confirm_seri_session", { p_session_id: s2, p_same_person_reason: "サンプル：夜間で確認者不在" });
    if (error) return error.message;
    const { data } = await admin.from("seri_sessions").select("same_person_reason").eq("id", s2).single();
    return data?.same_person_reason ? null : "reason missing";
  }));
  r.push(await runCheck("F12", "せり result over 参加上限 (B07): confirm without a per-result reason → refused; with reason → stored", async () => {
    const s3 = (await trade.rpc("create_seri_session")).data as string;
    const { data: tradeId, error } = await trade.rpc("add_seri_result", { p_session_id: s3, p_lot_id: lot5, p_buyer_id: p.b07, p_qty: 20, p_unit_price_jpy: 20000 });
    if (error) return error.message;
    const refused = expectRejected(await trade2.rpc("confirm_seri_session", { p_session_id: s3, p_same_person_reason: "", p_over_limit_reasons: {} }), "OVER_LIMIT_REASON_REQUIRED");
    if (refused) return refused;
    const ok = await trade2.rpc("confirm_seri_session", { p_session_id: s3, p_same_person_reason: "", p_over_limit_reasons: { [tradeId as string]: "サンプル：確認者が上限超過を確認" } });
    if (ok.error) return ok.error.message;
    const { data: row } = await admin.from("trades").select("status, over_limit_reason").eq("id", tradeId).single();
    return row?.status === "CONFIRMED" && row.over_limit_reason ? null : `row=${JSON.stringify(row)}`;
  }));
  r.push(await runCheck("F10", "Rule 1: GET /api/trades defaults to 相対; seed value share of 相対 ≥ 85%", async () => {
    const { data: all } = await admin.from("trades").select("channel, amount_jpy").eq("status", "CONFIRMED");
    const total = (all ?? []).reduce((s, t) => s + Number(t.amount_jpy), 0);
    const aitaiTotal = (all ?? []).filter((t) => t.channel === "AITAI").reduce((s, t) => s + Number(t.amount_jpy), 0);
    if (aitaiTotal / total < 0.85) return `相対 share ${(100 * aitaiTotal / total).toFixed(1)}%`;
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const res = await (await AppHttpSession.signIn("trade@sakura-demo.example", requireEnv("DEMO_ACCOUNT_PASSWORD"))).request("/api/trades");
    const channels = new Set((res.json?.trades ?? []).map((t: { channel: string }) => t.channel));
    return res.status === 200 && channels.size === 1 && channels.has("AITAI") ? null : `channels=${[...channels]}`;
  }));
  r.push(await runCheck("F11", "HTTP: delivery@ POST /api/trades/aitai → 403; 許可 vs 承認 errors have different Japanese messages", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const pw = requireEnv("DEMO_ACCOUNT_PASSWORD");
    const body = (buyerId: string) => ({ lotId: lot6, buyerId, qty: 1, unitPriceJpy: 1000 });
    const d = await (await AppHttpSession.signIn("delivery@sakura-demo.example", pw)).request("/api/trades/aitai", { method: "POST", body: body(p.n01) });
    const t = await AppHttpSession.signIn("trade@sakura-demo.example", pw);
    const permit = await t.request("/api/trades/aitai", { method: "POST", body: body(p.n08) });
    const approval = await t.request("/api/trades/aitai", { method: "POST", body: body(p.b08) });
    const pm = permit.json?.error?.message ?? "", am = approval.json?.error?.message ?? "";
    return d.status === 403 && permit.status === 422 && approval.status === 422 && pm.includes("許可") && am.includes("承認") && pm !== am
      ? null : `delivery=${d.status} permit=${permit.status}:${pm} approval=${approval.status}:${am}`;
  }));
  await Promise.all([trade, trade2, delivery].map((c) => c.auth.signOut()));
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
