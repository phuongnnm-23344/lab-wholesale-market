// Usage: npm run verify:review   (+ APP_BASE_URL with `npm run dev` for R15)
// Regression checks for the independent code review (plans/reports/reviewer-261123-lab2-prototype-code-review.md):
// R01–R06 reproduce races with Promise.all, R07–R15 integrity / authorization. Run once BEFORE the fix
// migrations (expected to fail = the defects exist) and after (must pass). Demo data re-seeded at start and end.

import { currentDay, resetDemoData } from "./lib/demo-sessions-and-lookups";
import { runConcurrencyChecks } from "./lib/review-fix-concurrency-checks";
import { runIntegrityFixChecks } from "./lib/review-fix-integrity-checks";
import { createScriptAdminClient } from "./lib/script-supabase-clients";
import { summarize } from "./lib/security-check-runner";

async function main() {
  const admin = createScriptAdminClient();
  await resetDemoData(admin);
  const today = await currentDay(admin);
  const results = [...(await runConcurrencyChecks(admin, today))];
  await resetDemoData(admin);
  results.push(...(await runIntegrityFixChecks(admin, await currentDay(admin))));
  await resetDemoData(admin);
  process.exit(summarize(results));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
