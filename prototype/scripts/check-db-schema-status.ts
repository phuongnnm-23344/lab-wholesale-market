// Usage: npm run db:status
// Read-only check of which migrations (0001–0009) look applied, using marker objects via REST.
// Never prints keys. Uses the secret key (bypasses RLS) only to SELECT / probe objects.

import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";

const TABLE_MARKERS: [string, string][] = [
  ["0001", "profiles"], ["0001", "profile_pins"], ["0002", "business_days"], ["0002", "trade_adjustments"],
  ["0003", "rule_versions"], ["0003", "audit_logs"], ["0004", "v_trade_effective"], ["0004", "v_daily_settlement"],
];

async function main() {
  const admin = createScriptAdminClient();
  let missing = 0;
  for (const [migration, table] of TABLE_MARKERS) {
    // GET (not HEAD): a HEAD request hides the PostgREST error body for missing tables.
    const { data, error, status } = await admin.from(table).select("*").limit(1);
    if (error) missing++;
    console.log(`${migration} ${table.padEnd(22)} HTTP ${status} ${error ? `MISSING (${error.code})` : `ok, sample rows=${data?.length ?? 0}`}`);
  }
  // 0004 helper (returns null for the service role: no auth.uid()) and 0008/0009 server functions.
  const { error: profileFnError } = await admin.rpc("get_my_profile");
  console.log(`0004 get_my_profile()       ${profileFnError ? `MISSING (${profileFnError.code})` : "ok"}`);
  const { error: pinFnError } = await admin.rpc("admin_set_pin_hash", {
    p_user_id: "00000000-0000-0000-0000-000000000000", p_pin: "x",
  });
  // Expected when present: PIN_FORMAT error (function exists, input rejected before any write).
  const pinPresent = pinFnError?.message.includes("PIN_FORMAT") ?? false;
  console.log(`0008 admin_set_pin_hash()   ${pinPresent ? "ok" : `MISSING (${pinFnError?.code ?? "unexpected success"})`}`);
  if (!pinPresent || profileFnError) missing++;

  // Auth setting (read-only public endpoint): sign-up must be disabled (Expert M2).
  const res = await fetch(`${requireEnv("NEXT_PUBLIC_SUPABASE_URL")}/auth/v1/settings`, {
    headers: { apikey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") },
  });
  const settings = res.ok ? ((await res.json()) as { disable_signup?: boolean }) : {};
  const signupDisabled = settings.disable_signup === true;
  console.log(`auth sign-up disabled       ${signupDisabled ? "ok" : `NO (HTTP ${res.status}) → turn off "Allow new users to sign up"`}`);
  if (!signupDisabled) missing++;
  process.exit(missing === 0 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
