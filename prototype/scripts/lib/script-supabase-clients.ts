// Supabase clients for local maintenance scripts (run by the PL with tsx, never deployed).
// All settings come from environment variables loaded with `--env-file`; nothing is hard-coded.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable ${name}. Fill it in your local env file (see README).`);
    process.exit(1);
  }
  return value;
}

// Secret key client: bypasses RLS, can call service_role-only RPCs and Auth admin APIs.
export function createScriptAdminClient(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Publishable key client: behaves exactly like the browser (used to verify demo logins).
export function createScriptPublicClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
