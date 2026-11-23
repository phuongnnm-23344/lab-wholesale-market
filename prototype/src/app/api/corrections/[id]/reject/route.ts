import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { rejectSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/corrections/[id]/reject — reject with a mandatory reason (照合部門長 / 運用部門長).
export async function POST(request: Request, ctx: RouteContext<"/api/corrections/[id]/reject">) {
  const auth = await requireRole([], ["STL_HEAD", "OPS_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, rejectSchema);
  if (!body.ok) return body.response;
  const { error } = await auth.supabase.rpc("reject_correction", { p_id: id, p_reason: body.data.reason });
  if (error) return mapRpcError(error);
  return NextResponse.json({ status: "REJECTED" });
}
