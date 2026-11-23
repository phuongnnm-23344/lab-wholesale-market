// Usage: npm run demo:verify   (run weekly, together with the Supabase "Resume" check — n6)
// Signs in to each of the 10 README demo accounts with the publishable key (like a browser),
// then checks role + authorities through get_my_profile(). Exit code 1 if any account fails.

import { DEMO_ACCOUNTS, emailOf } from "./lib/demo-account-definitions";
import { createScriptPublicClient, requireEnv } from "./lib/script-supabase-clients";

async function verifyOne(email: string, password: string, role: string, authorities: string[]) {
  const client = createScriptPublicClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) return `login failed (${signInError.message})`;
  const { data, error } = await client.rpc("get_my_profile");
  await client.auth.signOut();
  if (error || !data) return `profile unavailable (${error?.message ?? "inactive or missing"})`;
  const actualAuthorities = [...(data.authorities as string[])].sort().join(",");
  if (data.role !== role) return `role ${data.role} ≠ ${role}`;
  if (actualAuthorities !== [...authorities].sort().join(",")) return `authorities ${actualAuthorities}`;
  return null;
}

async function main() {
  const password = requireEnv("DEMO_ACCOUNT_PASSWORD");
  let failures = 0;
  for (const account of DEMO_ACCOUNTS.filter((a) => a.isDemo)) {
    const email = emailOf(account);
    const problem = await verifyOne(email, password, account.role, account.authorities);
    if (problem) failures++;
    console.log(`${problem ? "NG" : "OK"}  ${email.padEnd(36)} ${problem ?? account.role}`);
  }
  console.log(failures === 0 ? "10/10 demo accounts OK" : `${failures} account(s) broken → npm run demo:reset`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
