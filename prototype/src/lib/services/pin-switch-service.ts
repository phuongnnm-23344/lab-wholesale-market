import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

// SC-00-02 shared-device user switch (online only, DEC-029). Expert N1:
//  * verify_pin_for_switch is executable by service_role only → called here with the secret key,
//    after the route has verified the SOURCE user with getUser();
//  * the RPC enforces role-list P12 for source AND target (never SYSADM / RULE / plain SETTLE),
//    target active and not banned, 5 wrong PINs → 15 min lock, and writes the audit log.
// On success a session for the target is minted server-side (magic-link token, no e-mail is sent)
// and written to the httpOnly cookies of the current request.

export type PinSwitchOutcome =
  | { ok: true; targetUserId: string }
  | { ok: false; code: "SOURCE_NOT_ALLOWED" | "TARGET_NOT_ALLOWED" | "SAME_USER" | "PIN_NOT_SET" | "PIN_INVALID" | "PIN_LOCKED" | "ERROR" };

export async function switchUserByPin(
  sessionClient: SupabaseClient,
  sourceUserId: string,
  employeeNo: string,
  pin: string,
): Promise<PinSwitchOutcome> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("verify_pin_for_switch", {
    p_source_user_id: sourceUserId, p_employee_no: employeeNo, p_pin: pin,
  });
  if (error || !data) {
    console.error("verify_pin_for_switch failed", error?.code);
    return { ok: false, code: "ERROR" };
  }
  const result = data as { ok: boolean; code: string; target_user_id?: string };
  if (!result.ok || !result.target_user_id) {
    return { ok: false, code: result.code as Exclude<PinSwitchOutcome, { ok: true }>["code"] };
  }

  const { data: target, error: userError } = await admin.auth.admin.getUserById(result.target_user_id);
  if (userError || !target.user?.email) return { ok: false, code: "ERROR" };
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink", email: target.user.email,
  });
  if (linkError || !link.properties?.hashed_token) return { ok: false, code: "ERROR" };

  // Replaces the session cookies of this browser with the target user's session.
  const { error: otpError } = await sessionClient.auth.verifyOtp({
    token_hash: link.properties.hashed_token, type: "email",
  });
  if (otpError) {
    console.error("verifyOtp failed", otpError.code);
    return { ok: false, code: "ERROR" };
  }
  return { ok: true, targetUserId: result.target_user_id };
}
