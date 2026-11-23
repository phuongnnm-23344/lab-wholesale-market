import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./supabase-env";

// Browser client: used ONLY for Supabase Auth (sign in / sign out).
// Business data is always read and written through /api/* route handlers.
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
