import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getSecretSupabaseKey } from "./supabase-env";

// Secret-key client (bypasses RLS). Server-only: importing it from a client component fails the build.
// Use only for Auth admin operations and service_role-only RPCs (account admin, PIN switch).
export function createSupabaseAdminClient() {
  const { url } = getPublicSupabaseEnv();
  return createClient(url, getSecretSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
