// Usage: npm run demo:check-readme
// Reads the shared demo password written in README.md (line 「Mật khẩu chung … **`<value>`**」) and signs in to
// the 10 demo accounts with the publishable key, like a reviewer would. Prints x/10 only — never a password.

import { readFileSync } from "node:fs";
import { DEMO_ACCOUNTS, emailOf } from "./lib/demo-account-definitions";
import { createScriptPublicClient } from "./lib/script-supabase-clients";

async function main() {
  const line = readFileSync("README.md", "utf8").split(/\r?\n/).find((l) => l.startsWith("Mật khẩu chung"));
  const password = line?.match(/\*\*`([^`]+)`\*\*/)?.[1];
  if (!password || password.startsWith("<")) {
    console.error("README: shared demo password not found (still a placeholder?)");
    process.exit(1);
  }
  let ok = 0;
  for (const account of DEMO_ACCOUNTS.filter((a) => a.isDemo)) {
    const client = createScriptPublicClient();
    const { error } = await client.auth.signInWithPassword({ email: emailOf(account), password });
    console.log(`${error ? "NG" : "OK"}  ${emailOf(account)}`);
    if (!error) {
      ok++;
      await client.auth.signOut();
    }
  }
  console.log(`${ok}/10 demo accounts accept the README password${ok === 10 ? "" : " — không khớp"}`);
  process.exit(ok === 10 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
