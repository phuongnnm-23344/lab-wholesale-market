import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { rejectSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/payments/batches/[id]/void — 取消 of a wrong import (code review C1). Rule 4: nothing is deleted,
// an append-only void record is written. 照合部門長 other than the importer; refused once a period is locked.
export async function POST(request: Request, ctx: RouteContext<"/api/payments/batches/[id]/void">) {
  const auth = await requireRole([], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, rejectSchema);
  if (!body.ok) return body.response;
  const { error } = await auth.supabase.rpc("void_payment_batch", { p_batch_id: id, p_reason: body.data.reason });
  if (error) return mapRpcError(error);
  return NextResponse.json({ voided: id });
}
