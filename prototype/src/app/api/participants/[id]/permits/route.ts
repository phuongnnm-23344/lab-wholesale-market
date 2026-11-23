import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { permitSchema } from "@/lib/validators/participant-schemas";

export const dynamic = "force-dynamic";

// POST /api/participants/[id]/permits — SC-01-03 register / renew 許可 (仲卸 only → 422 otherwise)
export async function POST(request: Request, ctx: RouteContext<"/api/participants/[id]/permits">) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, permitSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("register_nakaoroshi_permit", {
    p_participant_id: id, p_permit_no: body.data.permitNo,
    p_valid_from: body.data.validFrom, p_valid_to: body.data.validTo,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
