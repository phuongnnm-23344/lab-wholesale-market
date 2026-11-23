// Usage: npm run verify:all   (start `npm run dev` first and set APP_BASE_URL for the HTTP checks)
// Runs every phase verify script in order (02 → 10), keeps going after a failure, prints one summary line
// per phase, and exits 1 if any phase failed. Then checks the 10 demo logins. Env is inherited (--env-file).

import { spawnSync } from "node:child_process";

const SCRIPTS = [
  "verify-phase-02-db-security", "verify-phase-03-party-account-pin", "verify-phase-04-lot-intake",
  "verify-phase-05-aitai-seri", "verify-phase-06-delivery-close", "verify-phase-07-correction",
  "verify-phase-08-rule-versions", "verify-phase-09-payment-incentive", "verify-phase-10-audit-log",
  "verify-demo-accounts",
];

if (!process.env.APP_BASE_URL) console.warn("APP_BASE_URL is not set: HTTP route checks will FAIL.");

const summary: string[] = [];
let failed = 0;
for (const name of SCRIPTS) {
  const run = spawnSync(process.execPath, ["--import", "tsx", `scripts/${name}.ts`], { encoding: "utf8", env: process.env });
  const out = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const counts = out.match(/(\d+\/\d+) (PASS|demo accounts OK)/g)?.at(-1) ?? "no summary";
  if (run.status !== 0) failed++;
  summary.push(`${run.status === 0 ? "OK  " : "FAIL"} ${name.padEnd(36)} ${counts}`);
  if (run.status !== 0) out.split("\n").filter((l) => l.startsWith("FAIL") || l.includes("  FAIL")).forEach((l) => summary.push(`       ${l.trim()}`));
}
console.log(summary.join("\n"));
console.log(failed === 0 ? `\nALL ${SCRIPTS.length} SUITES PASSED` : `\n${failed} suite(s) failed`);
process.exit(failed === 0 ? 0 : 1);
