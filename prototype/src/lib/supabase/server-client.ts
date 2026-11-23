import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./supabase-env";

// Supabase client bound to the signed-in user's JWT (cookies). RLS and RPC role checks apply.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies are read-only.
          // The proxy refreshes the session on every request, so this is safe to ignore.
        }
      },
    },
  });
}
