import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

// Auth-admin operations that need the secret key. Callers MUST have passed requireRole(["SYSADM"])
// and the SYSADM-checked RPC first; this module never decides authorization by itself.

export type AccountRow = {
  userId: string;
  email: string | null;
  employeeNo: string;
  displayName: string;
  role: string;
  isActive: boolean;
  isDemoProtected: boolean;
  authorities: string[];
  hasPin: boolean;
  pinLocked: boolean;
};

// Lists accounts: profiles via the SYSADM's own client (RLS), emails + PIN status via the admin client.
// The PIN hash is never selected.
export async function listAccounts(userClient: SupabaseClient): Promise<AccountRow[]> {
  const admin = createSupabaseAdminClient();
  const { data: profiles, error } = await userClient
    .from("profiles")
    // Explicit FK: user_authorities references profiles twice (user_id, granted_by) → PGRST201 otherwise.
    .select("user_id, employee_no, display_name, role, is_active, is_demo_protected, user_authorities!user_authorities_user_id_fkey(authority)")
    .order("employee_no");
  if (error) throw new Error(`profiles: ${error.code}`);

  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
  const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? null]));
  const { data: pins } = await admin.from("profile_pins").select("user_id, pin_locked_until");
  const pinMap = new Map((pins ?? []).map((p) => [p.user_id as string, p.pin_locked_until as string | null]));
  const now = Date.now();

  return (profiles ?? []).map((p) => ({
    userId: p.user_id,
    email: emails.get(p.user_id) ?? null,
    employeeNo: p.employee_no,
    displayName: p.display_name,
    role: p.role,
    isActive: p.is_active,
    isDemoProtected: p.is_demo_protected,
    authorities: (p.user_authorities as { authority: string }[]).map((a) => a.authority),
    hasPin: pinMap.has(p.user_id),
    pinLocked: Boolean(pinMap.get(p.user_id) && Date.parse(pinMap.get(p.user_id) as string) > now),
  }));
}

export async function createAuthUser(email: string, password: string): Promise<string> {
  const { data, error } = await createSupabaseAdminClient().auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error || !data.user) throw new Error(error?.message ?? "createUser failed");
  return data.user.id;
}

export async function deleteAuthUser(userId: string): Promise<void> {
  await createSupabaseAdminClient().auth.admin.deleteUser(userId);
}

// Deactivation also bans the Auth user so existing sessions cannot be refreshed (Expert M2).
export async function setAuthUserBanned(userId: string, banned: boolean): Promise<void> {
  const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) throw new Error(`ban: ${error.message}`);
}
