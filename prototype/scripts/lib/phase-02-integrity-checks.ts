// Phase 02 targets enforced by DB triggers (rule 2 許可≠承認, rule 4 no overwrite) and the
// "user without profile reads nothing" rule (M2). Trigger checks run with the secret key on purpose:
// triggers must stop even a privileged writer. A probe Auth user is created and always deleted.

import type { SupabaseClient } from "@supabase/supabase-js";
import { expectRejected, runCheck, signedInClient, type CheckResult } from "./security-check-runner";
import { requireEnv } from "./script-supabase-clients";

export async function runIntegrityChecks(admin: SupabaseClient): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const { data: ledger } = await admin.from("lot_quantity_ledger").select("id").limit(1).single();
  const { data: delivery } = await admin.from("deliveries").select("id").limit(1).single();
  const { data: trade } = await admin.from("trades").select("id, qty").eq("status", "CONFIRMED").limit(1).single();
  const { data: lockedDay } = await admin.from("business_days").select("business_date").eq("status", "LOCKED").limit(1).single();
  const { data: baibai } = await admin.from("participants").select("id").eq("buyer_no", "B01").single();

  results.push(await runCheck("C12", "UPDATE on append-only lot_quantity_ledger fails (APPEND_ONLY)", async () =>
    ledger ? expectRejected(await admin.from("lot_quantity_ledger").update({ reason: "probe" }).eq("id", ledger.id), "APPEND_ONLY") : "no seed row"));
  results.push(await runCheck("C13", "DELETE on append-only deliveries fails (APPEND_ONLY)", async () =>
    delivery ? expectRejected(await admin.from("deliveries").delete().eq("id", delivery.id), "APPEND_ONLY") : "no seed row"));
  results.push(await runCheck("C14", "UPDATE qty of a CONFIRMED trade fails (TRADE_FROZEN or DAY_LOCKED)", async () =>
    trade ? expectRejected(await admin.from("trades").update({ qty: Number(trade.qty) + 1 }).eq("id", trade.id), "TRADE_FROZEN", "DAY_LOCKED") : "no seed row"));
  results.push(await runCheck("C15", "INSERT a lot on a LOCKED business day fails (DAY_LOCKED)", async () =>
    lockedDay ? expectRejected(await admin.from("lots").insert({
      lot_no: `PROBE-${Date.now()}`, business_date: lockedDay.business_date, shipper_name: "probe", species: "probe",
    }), "DAY_LOCKED") : "no locked day"));
  results.push(await runCheck("C16", "許可 (nakaoroshi_permits) for a 売買参加者 fails (rule 2)", async () =>
    baibai ? expectRejected(await admin.from("nakaoroshi_permits").insert({
      participant_id: baibai.id, permit_no: "PROBE", valid_from: "2026-01-01", valid_to: "2027-01-01",
    }), "QUALIFICATION_KIND_MISMATCH") : "no B01"));

  results.push(await runCheck("C17", "Auth user WITHOUT profile reads 0 rows (lots, participants, trades)", async () => {
    const email = `probe-noprofile-${Date.now()}@sakura-demo.example`;
    const password = requireEnv("TEST_ACCOUNT_PASSWORD");
    const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !created.user) return `cannot create probe user: ${error?.message}`;
    try {
      const probe = await signedInClient(email, password);
      for (const table of ["lots", "participants", "trades"]) {
        const { data } = await probe.from(table).select("id").limit(5);
        if ((data ?? []).length > 0) return `${table} returned ${data?.length} rows`;
      }
      const { count } = await admin.from("lots").select("id", { count: "exact", head: true });
      return (count ?? 0) > 0 ? null : "no seed lots (check is meaningless)";
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }));
  return results;
}

// Fingerprint of the seeded business data (row counts + money total) to compare two resets.
export async function seedFingerprint(admin: SupabaseClient): Promise<string> {
  const tables = ["participants", "nakaoroshi_permits", "baibai_approvals", "business_days", "lots",
    "lot_quantity_ledger", "trades", "deliveries", "payments", "incentive_results", "rule_versions"];
  const parts: string[] = [];
  for (const t of tables) {
    const { count } = await admin.from(t).select("*", { count: "exact", head: true });
    parts.push(`${t}=${count}`);
  }
  const { data: amounts } = await admin.from("trades").select("amount_jpy");
  const total = (amounts ?? []).reduce((sum, r) => sum + Number(r.amount_jpy), 0);
  const { data: rewards } = await admin.from("incentive_results").select("incentive_jpy");
  const reward = (rewards ?? []).reduce((sum, r) => sum + Number(r.incentive_jpy), 0);
  return `${parts.join(" ")} trades_amount=${total} incentive_total=${reward}`;
}
