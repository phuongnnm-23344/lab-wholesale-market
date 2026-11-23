// Usage: npm run verify:phase02            (all checks; re-seeds the demo data twice at the end)
// Re-runnable DB security / integrity checks for phase 01–02 targets, reused in phase 11.
// Exit 0 only if every check passes. Demo accounts are never modified (writes use test-* accounts).

import { menuItemsFor } from "../src/lib/auth/role-menu-config";
import { toCurrentUser } from "../src/lib/auth/app-role-types";
import { createScriptAdminClient, requireEnv } from "./lib/script-supabase-clients";
import { runCheck, signedInClient, summarize, type CheckResult } from "./lib/security-check-runner";
import { runIntegrityChecks, seedFingerprint } from "./lib/phase-02-integrity-checks";
import { runPrivilegeChecks } from "./lib/phase-02-privilege-checks";

async function main() {
  const admin = createScriptAdminClient();
  const results: CheckResult[] = [];

  results.push(...(await runPrivilegeChecks(admin)));
  results.push(...(await runIntegrityChecks(admin)));

  results.push(await runCheck("C18", "trade@ menu: first item 相対取引入力; no 規則版 / 日次締め / アカウント管理", async () => {
    const client = await signedInClient("trade@sakura-demo.example", requireEnv("DEMO_ACCOUNT_PASSWORD"));
    const { data } = await client.rpc("get_my_profile");
    await client.auth.signOut();
    const user = toCurrentUser(data);
    if (!user) return "get_my_profile returned nothing";
    const items = menuItemsFor(user).map((m) => m.screenId);
    if (items[0] !== "SC-04-01") return `first item ${items[0]}`;
    const forbidden = ["SC-10-01", "SC-07-02", "SC-02-03"].filter((id) => items.includes(id));
    return forbidden.length ? `unexpected ${forbidden}` : null;
  }));

  results.push(await runCheck("C19", "reset_demo_business_data() twice → identical data fingerprint", async () => {
    const first = await admin.rpc("reset_demo_business_data");
    if (first.error) return `reset 1 failed: ${first.error.message}`;
    const a = await seedFingerprint(admin);
    const second = await admin.rpc("reset_demo_business_data");
    if (second.error) return `reset 2 failed: ${second.error.message}`;
    const b = await seedFingerprint(admin);
    console.log(`        fingerprint: ${a}`);
    return a === b ? null : `differs:\n  ${a}\n  ${b}`;
  }));

  process.exit(summarize(results));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
