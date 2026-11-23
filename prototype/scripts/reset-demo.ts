// Usage: npm run demo:reset
// Restores the demo to its initial state (Expert M3 / n5):
//   1. accounts: passwords, PIN, roles, authorities, active / unbanned (idempotent sync)
//   2. business data: wipe and re-seed all fictional サンプル data via reset_demo_business_data()
// Accounts go first because the seed attributes actions to demo employee numbers S1001–S1010.

import { createScriptAdminClient } from "./lib/script-supabase-clients";
import { syncDemoAccounts } from "./lib/sync-demo-accounts";

async function main() {
  const admin = createScriptAdminClient();
  await syncDemoAccounts(admin);
  const { error } = await admin.rpc("reset_demo_business_data");
  if (error) throw new Error(`reset_demo_business_data failed: ${error.message}`);
  console.log("Sample business data re-seeded. Run npm run demo:verify to check the logins.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
