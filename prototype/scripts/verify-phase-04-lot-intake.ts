// Usage: npm run verify:phase04   (+ APP_BASE_URL=http://localhost:PORT with `npm run dev` for E09)
// Phase 04 targets: 仮受付 → 本登録 → 目利き (person) → 販売公開; ledger append-only; role checks.
// Re-seeds the fictional demo data first so the run is deterministic.

import { AppHttpSession } from "./lib/app-http-session";
import { availableQty, demoClient, resetDemoData, todayLot } from "./lib/demo-sessions-and-lookups";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { expectRejected, runCheck, summarize, type CheckResult } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const [intake, judge, trade] = [await demoClient("intake"), await demoClient("judge"), await demoClient("trade")];
  const r: CheckResult[] = [];
  let provisionalId = "";

  r.push(await runCheck("E01", "受付担当: 仮受付 creates a PROVISIONAL lot with NO ledger row", async () => {
    const { data, error } = await intake.rpc("provisional_receive_lot", { p_shipper_name: "サンプル第一丸", p_species: "サンプル真鯛", p_qty_estimate: 80 });
    if (error) return error.message;
    provisionalId = data as string;
    const { data: lot } = await admin.from("lots").select("status").eq("id", provisionalId).single();
    const { count } = await admin.from("lot_quantity_ledger").select("id", { count: "exact", head: true }).eq("lot_id", provisionalId);
    return lot?.status === "PROVISIONAL" && count === 0 ? null : `status=${lot?.status} ledger=${count}`;
  }));
  r.push(await runCheck("E02", "本登録 100 kg → RECEIVED, ledger +100, available 100", async () => {
    const { error } = await intake.rpc("register_lot", { p_lot_id: provisionalId, p_shipper_name: "サンプル第一丸", p_species: "サンプル真鯛", p_unit: "kg", p_qty: 100 });
    if (error) return error.message;
    const { data: lot } = await admin.from("lots").select("status, registered_by").eq("id", provisionalId).single();
    const qty = await availableQty(admin, provisionalId);
    return lot?.status === "RECEIVED" && lot.registered_by && qty === 100 ? null : `status=${lot?.status} qty=${qty}`;
  }));
  r.push(await runCheck("E03", "取引担当 cannot record 目利き / 仮受付 (FORBIDDEN)", async () =>
    expectRejected(await trade.rpc("record_inspections", { p_lot_ids: [provisionalId], p_grade: "A", p_note: "" }), "FORBIDDEN") ??
    expectRejected(await trade.rpc("provisional_receive_lot", { p_shipper_name: "x", p_species: "x", p_qty_estimate: 1 }), "FORBIDDEN")));
  r.push(await runCheck("E04", "販売公開 of a lot that is NOT 下見済 is rejected (CONFLICT)", async () =>
    expectRejected(await intake.rpc("publish_lots", { p_lot_ids: [provisionalId] }), "CONFLICT")));
  r.push(await runCheck("E05", "目利き by judge@ → INSPECTED, recorded with the judge's user id (rule 3)", async () => {
    const { data: me } = await judge.auth.getUser();
    const { error } = await judge.rpc("record_inspections", { p_lot_ids: [provisionalId], p_grade: "A", p_note: "サンプル：身質良好" });
    if (error) return error.message;
    const { data: ins } = await admin.from("lot_inspections").select("inspected_by").eq("lot_id", provisionalId).single();
    const { data: lot } = await admin.from("lots").select("status").eq("id", provisionalId).single();
    return lot?.status === "INSPECTED" && ins?.inspected_by === me.user?.id ? null : `status=${lot?.status}`;
  }));
  r.push(await runCheck("E06", "一括販売公開 of 下見済 lots → PUBLISHED", async () => {
    const lot4 = await todayLot(admin, 4);
    const { data, error } = await intake.rpc("publish_lots", { p_lot_ids: [provisionalId, lot4] });
    return error ? error.message : data === 2 ? null : `published ${data}`;
  }));
  r.push(await runCheck("E07", "JWT intake@: direct REST insert into lots / ledger rejected (M1)", async () =>
    expectRejected(await intake.from("lots").insert({ lot_no: "PROBE", business_date: "2026-01-01", shipper_name: "x", species: "x" }), "42501", "permission denied") ??
    expectRejected(await intake.from("lot_quantity_ledger").insert({ lot_id: provisionalId, business_date: "2026-01-01", qty_delta: 5, reason: "x" }), "42501", "permission denied")));
  r.push(await runCheck("E08", "staff_display_names returns only user_id / name / employee no. (anon blocked: C05)", async () => {
    const { data: me } = await judge.auth.getUser();
    const { data } = await intake.rpc("staff_display_names", { p_user_ids: [me.user?.id] });
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row || Object.keys(row).sort().join(",") !== "display_name,employee_no,user_id") return "unexpected columns";
    return null;
  }));
  r.push(await runCheck("E09", "HTTP: trade@ POST /api/lots/provisional → 403; intake@ → 201", async () => {
    if (!process.env.APP_BASE_URL) return "APP_BASE_URL not set";
    const pw = requireEnv("DEMO_ACCOUNT_PASSWORD");
    const body = { shipperName: "サンプル第二丸", species: "サンプル鰹", qtyEstimate: 30 };
    const t = await (await AppHttpSession.signIn("trade@sakura-demo.example", pw)).request("/api/lots/provisional", { method: "POST", body });
    const i = await (await AppHttpSession.signIn("intake@sakura-demo.example", pw)).request("/api/lots/provisional", { method: "POST", body });
    return t.status === 403 && i.status === 201 ? null : `trade=${t.status} intake=${i.status}`;
  }));
  await Promise.all([intake, judge, trade].map((c) => c.auth.signOut()));
  process.exit(summarize(r));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
