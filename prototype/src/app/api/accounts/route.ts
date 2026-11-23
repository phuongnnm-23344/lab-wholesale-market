import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { apiError, serverError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { createAuthUser, deleteAuthUser, listAccounts } from "@/lib/services/account-admin-service";
import { createAccountSchema } from "@/lib/validators/account-schemas";

export const dynamic = "force-dynamic";

// GET /api/accounts — SC-02-03 (システム管理者 only). Never returns PIN hashes.
export async function GET() {
  const auth = await requireRole(["SYSADM"]);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ accounts: await listAccounts(auth.supabase) });
  } catch (error) {
    console.error("listAccounts failed", error instanceof Error ? error.message : error);
    return serverError();
  }
}

// POST /api/accounts — create Auth user (secret key) then the profile via the SYSADM-checked RPC.
// If the RPC rejects, the just-created Auth user is deleted so no orphan account remains.
export async function POST(request: Request) {
  const auth = await requireRole(["SYSADM"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, createAccountSchema);
  if (!body.ok) return body.response;
  const a = body.data;

  let userId: string;
  try {
    userId = await createAuthUser(a.email, a.initialPassword);
  } catch {
    return apiError(409, "DUPLICATE", "このメールアドレスは使用できません");
  }
  const { error } = await auth.supabase.rpc("admin_upsert_account", {
    p_user_id: userId, p_employee_no: a.employeeNo, p_display_name: a.displayName,
    p_role: a.role, p_authorities: a.authorities, p_is_active: true,
  });
  if (error) {
    await deleteAuthUser(userId);
    return mapRpcError(error);
  }
  return NextResponse.json({ userId }, { status: 201 });
}
