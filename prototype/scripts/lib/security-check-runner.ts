// Tiny runner for DB security checks: each check returns null (PASS) or a reason (FAIL).
// Prints one line per check; never prints keys or passwords.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createScriptPublicClient, requireEnv } from "./script-supabase-clients";

export type CheckResult = { id: string; title: string; problem: string | null };

export async function runCheck(id: string, title: string, fn: () => Promise<string | null>): Promise<CheckResult> {
  let problem: string | null;
  try {
    problem = await fn();
  } catch (error) {
    problem = `exception: ${error instanceof Error ? error.message : String(error)}`;
  }
  console.log(`${problem ? "FAIL" : "PASS"}  ${id.padEnd(6)} ${title}${problem ? ` → ${problem}` : ""}`);
  return { id, title, problem };
}

// Expects a PostgREST / Postgres error whose code or message contains one of `expected`.
export function expectRejected(
  result: { error: { code?: string; message: string } | null },
  ...expected: string[]
): string | null {
  if (!result.error) return "write was ACCEPTED (expected rejection)";
  const text = `${result.error.code ?? ""} ${result.error.message}`;
  if (expected.length === 0 || expected.some((e) => text.includes(e))) return null;
  return `rejected with unexpected error: ${text.slice(0, 120)}`;
}

// Signs in with the publishable key, exactly like the browser does.
export async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const client = createScriptPublicClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in ${email} failed: ${error.message}`);
  return client;
}

// Client with no session at all (anon role).
export function anonClient(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function summarize(results: CheckResult[]): number {
  const failed = results.filter((r) => r.problem);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  failed.forEach((r) => console.log(`  FAIL ${r.id}: ${r.problem}`));
  return failed.length === 0 ? 0 : 1;
}
