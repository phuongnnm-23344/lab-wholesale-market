import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { serverError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { setAuthUserBanned } from "@/lib/services/account-admin-service";
import { updateAccountSchema } from "@/lib/validators/account-schemas";

export const dynamic = "force-dynamic";

// PATCH /api/accounts/[id] — change role / authorities / active state / PIN (SC-02-03, SYSADM).
// The RPC runs first: it rejects demo accounts (409) and self-demotion before any Auth change.
export async function PATCH(request: Request, ctx: RouteContext<"/api/accounts/[id]">) {
  const auth = await requireRole(["SYSADM"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, updateAccountSchema);
  if (!body.ok) return body.response;
  const a = body.data;

  const { error } = await auth.supabase.rpc("admin_upsert_account", {
    p_user_id: id, p_employee_no: a.employeeNo, p_display_name: a.displayName,
    p_role: a.role, p_authorities: a.authorities, p_is_active: a.isActive,
  });
  if (error) return mapRpcError(error);

  if (a.pin) {
    const { error: pinError } = await auth.supabase.rpc("admin_set_account_pin", { p_user_id: id, p_pin: a.pin });
    if (pinError) return mapRpcError(pinError);
  }
  try {
    await setAuthUserBanned(id, !a.isActive);
  } catch (banError) {
    console.error("ban update failed", banError instanceof Error ? banError.message : banError);
    return serverError();
  }
  return NextResponse.json({ userId: id });
}
