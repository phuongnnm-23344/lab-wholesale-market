import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/require-role";
import { apiError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { participantSchema } from "@/lib/validators/participant-schemas";

export const dynamic = "force-dynamic";

const DETAIL_COLUMNS =
  "id, kind, name, buyer_no, email, deposit_jpy, status, is_sample, updated_at, " +
  "nakaoroshi_permits(id, permit_no, valid_from, valid_to, status, created_at), " +
  "baibai_approvals(id, approval_no, valid_from, valid_to, participation_limit_jpy, status, created_at)";

// GET /api/participants/[id] — SC-01-02 detail with full 許可 / 承認 history
export async function GET(_request: Request, ctx: RouteContext<"/api/participants/[id]">) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const { data, error } = await auth.supabase.from("participants").select(DETAIL_COLUMNS).eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!data) return apiError(404, "NOT_FOUND", "対象が見つかりません");
  return NextResponse.json({ participant: data });
}

// PATCH /api/participants/[id] — SC-01-02 edit (kind cannot change: enforced in the RPC)
export async function PATCH(request: Request, ctx: RouteContext<"/api/participants/[id]">) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, participantSchema);
  if (!body.ok) return body.response;
  const p = body.data;
  const { error } = await auth.supabase.rpc("upsert_participant", {
    p_id: id, p_kind: p.kind, p_name: p.name, p_buyer_no: p.buyerNo, p_email: p.email,
    p_deposit_jpy: p.depositJpy, p_status: p.status,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id });
}
