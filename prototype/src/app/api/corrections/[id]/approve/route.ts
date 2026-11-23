import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";

export const dynamic = "force-dynamic";

// POST /api/corrections/[id]/approve — SC-08-03 (照合部門長 = level 1, 運用部門長 = level 2; S3 in the RPC).
// Final approval writes REVERSE + DELTA rows; the original trade is never updated. MFA = mock M02.
export async function POST(_request: Request, ctx: RouteContext<"/api/corrections/[id]/approve">) {
  const auth = await requireRole([], ["STL_HEAD", "OPS_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const { data, error } = await auth.supabase.rpc("approve_correction", { p_id: id });
  if (error) return mapRpcError(error);
  return NextResponse.json({ status: data });
}
