// Creates or restores the 13 demo / test accounts: Auth user (password, unbanned, email confirmed),
// profile (role, active, is_demo_protected), authorities, and shared-device PIN (hash in DB).
// Idempotent: safe to run any number of times (used by create-demo-accounts and reset-demo).

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEMO_ACCOUNTS, emailOf, usesSharedDevicePin, type DemoAccount } from "./demo-account-definitions";
import { requireEnv } from "./script-supabase-clients";

async function findUsersByEmail(admin: SupabaseClient): Promise<Map<string, User>> {
  const byEmail = new Map<string, User>();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    data.users.forEach((u) => u.email && byEmail.set(u.email.toLowerCase(), u));
    if (data.users.length < 200) return byEmail;
  }
}

async function upsertAuthUser(admin: SupabaseClient, existing: User | undefined, email: string, password: string) {
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password, email_confirm: true, ban_duration: "none",
    });
    if (error) throw new Error(`updateUser ${email}: ${error.message}`);
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
  return data.user.id;
}

async function syncProfile(admin: SupabaseClient, userId: string, account: DemoAccount, pin: string) {
  const { error: profileError } = await admin.from("profiles").upsert({
    user_id: userId,
    employee_no: account.employeeNo,
    display_name: account.displayName,
    role: account.role,
    is_active: true,
    is_demo_protected: account.isDemo,
  });
  if (profileError) throw new Error(`profile ${account.employeeNo}: ${profileError.message}`);

  const { error: deleteError } = await admin.from("user_authorities").delete().eq("user_id", userId);
  if (deleteError) throw new Error(`authorities ${account.employeeNo}: ${deleteError.message}`);
  if (account.authorities.length > 0) {
    const rows = account.authorities.map((authority) => ({ user_id: userId, authority }));
    const { error } = await admin.from("user_authorities").insert(rows);
    if (error) throw new Error(`authorities ${account.employeeNo}: ${error.message}`);
  }

  if (usesSharedDevicePin(account)) {
    const { error } = await admin.rpc("admin_set_pin_hash", { p_user_id: userId, p_pin: pin });
    if (error) throw new Error(`PIN ${account.employeeNo}: ${error.message}`);
  }
}

export async function syncDemoAccounts(admin: SupabaseClient): Promise<void> {
  const demoPassword = requireEnv("DEMO_ACCOUNT_PASSWORD");
  const testPassword = requireEnv("TEST_ACCOUNT_PASSWORD");
  const demoPin = requireEnv("DEMO_ACCOUNT_PIN");
  const existing = await findUsersByEmail(admin);

  for (const account of DEMO_ACCOUNTS) {
    const email = emailOf(account);
    const password = account.isDemo ? demoPassword : testPassword;
    const userId = await upsertAuthUser(admin, existing.get(email), email, password);
    await syncProfile(admin, userId, account, demoPin);
    console.log(`OK  ${email.padEnd(36)} ${account.role}${account.authorities.length ? " + " + account.authorities.join(",") : ""}`);
  }
}
