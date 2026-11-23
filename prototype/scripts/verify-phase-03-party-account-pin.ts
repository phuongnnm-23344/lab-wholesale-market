// Usage: npm run verify:phase03   (DB checks; add APP_BASE_URL=http://localhost:PORT with `npm run dev`
// running for the HTTP route checks). Phase 03 targets: 許可 ≠ 承認, account admin, demo protection,
// PIN switch limited to role-list P12 with a service_role-only verify RPC (Expert N1).

import { createScriptAdminClient } from "./lib/script-supabase-clients";
import { summarize } from "./lib/security-check-runner";
import { runPhase03DbChecks } from "./lib/phase-03-db-checks";
import { runPhase03HttpChecks } from "./lib/phase-03-http-checks";

async function main() {
  const admin = createScriptAdminClient();
  const results = [...(await runPhase03DbChecks(admin)), ...(await runPhase03HttpChecks(admin))];
  process.exit(summarize(results));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
