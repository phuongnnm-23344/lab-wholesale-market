// Usage: npm run verify:phase10   (+ APP_BASE_URL with `npm run dev` for A04)
// Phase 10 targets: every step of a correction is in the audit log with its actor; only 照合事務局 /
// 照合部門長 / システム管理者 can read it; the log is append-only; no PIN hash ever lands in it.

import { AppHttpSession } from "./lib/app-http-session";
import { compactDate, currentDay, previousDay, resetDemoData, tradeByNo } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, signedInClient, summarize, type CheckResult } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const pw = requireEnv("TEST_ACCOUNT_PASSWORD");
  const [trade, head, settle] = await Promise.all(["test-trade", "test-stlhead", "test-settle"].map((u) => signedInClient(`${u}@sakura-demo.example`, pw)));
  const uid = async (c: typeof trade) => (await c.auth.getUser()).data.user?.id;
  const t = await tradeByNo(admin, `T${compactDate(previousDay(await currentDay(admin)))}-1-1`);
  const r: CheckResult[] = [];
  let corrId = "";

  r.push(await runCheck("A01", "A correction leaves INSERT (requester) + UPDATE (approver) + 2 adjustment rows in the audit log", async () => {
    const { data, error } = await trade.rpc("submit_correction", { p_trade_id: t.id, p_new_qty: Number(t.qty) - 1, p_new_unit_price_jpy: Number(t.unit_price_jpy), p_new_buyer_id: t.buyer_id, p_reason: "テスト：監査" });
    if (error) return error.message;
    corrId = data as string;
    const ok = await head.rpc("approve_correction", { p_id: corrId });
    if (ok.error) return ok.error.message;
    const { data: logs } = await admin.from("audit_logs").select("action, table_name, actor_id").or(`record_id.eq.${corrId},table_name.eq.trade_adjustments`);
    const ins = (logs ?? []).find((l) => l.table_name === "correction_requests" && l.action === "INSERT");
    const upd = (logs ?? []).filter((l) => l.table_name === "correction_requests" && l.action === "UPDATE");
    const adj = (logs ?? []).filter((l) => l.table_name === "trade_adjustments").length;
    const [requester, approver] = [await uid(trade), await uid(head)];
    return ins?.actor_id === requester && upd.some((u) => u.actor_id === approver) && adj === 2 ? null : `ins=${!!ins} upd=${upd.length} adj=${adj}`;
  }));
  r.push(await runCheck("A02", "照合事務局 reads the audit log; 取引担当 gets 0 rows (RLS)", async () => {
    const s = await settle.from("audit_logs").select("id").limit(5);
    const tr = await trade.from("audit_logs").select("id").limit(5);
    return (s.data ?? []).length > 0 && (tr.data ?? []).length === 0 ? null : `settle=${s.data?.length} trade=${tr.data?.length}`;
  }));
  r.push(await runCheck("A03", "Audit rows cannot be updated or deleted (APPEND_ONLY), even with the secret key", async () => {
    const { data: one } = await admin.from("audit_logs").select("id").limit(1).single();
    return expectRejected(await admin.from("audit_logs").update({ action: "X" }).eq("id", one?.id), "APPEND_ONLY") ??
      expectRejected(await admin.from("audit_logs").delete().eq("id", one?.id), "APPEND_ONLY");
  }));
  r.push(await runCheck("A04", "HTTP: sysadm@ filters by table → rows; trade@ → 403", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const demoPw = requireEnv("DEMO_ACCOUNT_PASSWORD");
    const a = await (await AppHttpSession.signIn("sysadm@sakura-demo.example", demoPw)).request("/api/audit-logs?table=correction_requests");
    const b = await (await AppHttpSession.signIn("trade@sakura-demo.example", demoPw)).request("/api/audit-logs");
    const tables = new Set((a.json?.logs ?? []).map((l: { table_name: string }) => l.table_name));
    return a.status === 200 && tables.size === 1 && tables.has("correction_requests") && b.status === 403 ? null : `sysadm=${a.status} trade=${b.status}`;
  }));
  r.push(await runCheck("A05", "No PIN hash in the audit log (PIN rows never copied)", async () => {
    const { data } = await admin.from("audit_logs").select("before, after").limit(1000);
    const text = JSON.stringify(data ?? []);
    return /pin_hash|\$2[aby]\$/.test(text) ? "hash-like content found" : null;
  }));

  await Promise.all([trade, head, settle].map((c) => c.auth.signOut()));
  await resetDemoData(admin);
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
