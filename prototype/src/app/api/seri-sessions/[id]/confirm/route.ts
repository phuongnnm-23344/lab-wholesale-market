import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { seriConfirmSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/seri-sessions/[id]/confirm — SC-05-02: a person confirms the session (CAP-HUMAN-01).
// Entry person confirming alone → reason required (S2). Qualification + qty checked now (BR-PERM-01).
export async function POST(request: Request, ctx: RouteContext<"/api/seri-sessions/[id]/confirm">) {
  const auth = await requireRole(["TRADE"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, seriConfirmSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("confirm_seri_session", {
    p_session_id: id, p_same_person_reason: body.data.samePersonReason,
    p_over_limit_reasons: body.data.overLimitReasons,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ confirmed: data });
}
