import "server-only";
import type { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { forbidden, inactiveAccount, serverError, unauthenticated } from "@/lib/http/api-error-response";
import { toCurrentUser, type AppRole, type Authority, type CurrentUser } from "./app-role-types";

type AuthResult =
  | { ok: true; user: CurrentUser; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

// API-route guard. Layer 2 of 3 (proxy → route → DB RLS/RPC).
// Uses getUser() (verified with Supabase Auth), then the get_my_profile() RPC, which returns NULL
// for missing / inactive / banned accounts (M2).
export async function requireUser(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: unauthenticated() };

  const { data, error } = await supabase.rpc("get_my_profile");
  if (error) {
    console.error("get_my_profile failed", error.code);
    return { ok: false, response: serverError() };
  }
  const current = toCurrentUser(data);
  if (!current) return { ok: false, response: inactiveAccount() };
  return { ok: true, user: current, supabase };
}

// Allowed when the user's role is in `roles` OR the user holds one of `authorities`.
export async function requireRole(
  roles: readonly AppRole[],
  authorities: readonly Authority[] = [],
): Promise<AuthResult> {
  const result = await requireUser();
  if (!result.ok) return result;
  const { role, authorities: held } = result.user;
  const allowed = roles.includes(role) || held.some((a) => authorities.includes(a));
  return allowed ? result : { ok: false, response: forbidden() };
}
