import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { approvalSchema } from "@/lib/validators/participant-schemas";

export const dynamic = "force-dynamic";

// POST /api/participants/[id]/approvals — SC-01-04 register / renew 承認 + 参加上限 (売買参加者 only)
export async function POST(request: Request, ctx: RouteContext<"/api/participants/[id]/approvals">) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, approvalSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("register_baibai_approval", {
    p_participant_id: id, p_approval_no: body.data.approvalNo,
    p_valid_from: body.data.validFrom, p_valid_to: body.data.validTo, p_limit_jpy: body.data.limitJpy,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
