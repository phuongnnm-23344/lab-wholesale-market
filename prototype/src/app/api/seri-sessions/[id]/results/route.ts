import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { seriResultSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/seri-sessions/[id]/results — SC-05-01 add one final せり result (PROVISIONAL trade).
export async function POST(request: Request, ctx: RouteContext<"/api/seri-sessions/[id]/results">) {
  const auth = await requireRole(["TRADE"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const body = await parseJsonBody(request, seriResultSchema);
  if (!body.ok) return body.response;
  const b = body.data;
  const { data, error } = await auth.supabase.rpc("add_seri_result", {
    p_session_id: id, p_lot_id: b.lotId, p_buyer_id: b.buyerId, p_qty: b.qty, p_unit_price_jpy: b.unitPriceJpy,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
