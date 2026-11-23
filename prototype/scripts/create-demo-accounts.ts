// Usage: npm run demo:accounts   (after the migrations are applied)
// Creates / restores the 10 demo accounts + 3 test accounts. Does not touch business data.

import { createScriptAdminClient } from "./lib/script-supabase-clients";
import { syncDemoAccounts } from "./lib/sync-demo-accounts";

async function main() {
  await syncDemoAccounts(createScriptAdminClient());
  console.log("Demo / test accounts are ready. Next: npm run demo:reset (loads sample data).");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
