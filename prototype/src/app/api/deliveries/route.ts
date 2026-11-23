import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { deliverySchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// GET /api/deliveries?buyerNo= — SC-06-02: confirmed trades of this buyer not fully delivered yet.
export async function GET(request: Request) {
  const auth = await requireRole(["DELIVERY"], ["DEL_HEAD"]);
  if (!auth.ok) return auth.response;
  const buyerNo = new URL(request.url).searchParams.get("buyerNo")?.trim().toUpperCase();
  if (!buyerNo) return NextResponse.json({ pending: [] });
  const sb = auth.supabase;
  const { data: buyer } = await sb.from("participants").select("id, name, buyer_no").eq("buyer_no", buyerNo).maybeSingle();
  if (!buyer) return NextResponse.json({ buyer: null, pending: [] });

  const { data: eff, error } = await sb.from("v_trade_effective")
    .select("trade_id, trade_no, business_date, effective_qty").eq("effective_buyer_id", buyer.id).eq("status", "CONFIRMED");
  if (error) return mapRpcError(error);
  const ids = (eff ?? []).map((t) => t.trade_id);
  const { data: status } = ids.length
    ? await sb.from("v_delivery_status").select("trade_id, delivered_qty, is_complete").in("trade_id", ids)
    : { data: [] };
  const byId = new Map((status ?? []).map((s) => [s.trade_id, s]));
  const pending = (eff ?? [])
    .map((t) => ({ ...t, delivered_qty: Number(byId.get(t.trade_id)?.delivered_qty ?? 0) }))
    .filter((t) => !byId.get(t.trade_id)?.is_complete && Number(t.effective_qty) > 0);
  return NextResponse.json({ buyer, pending });
}

// POST /api/deliveries — record one delivery (partial or 「残り全部」).
export async function POST(request: Request) {
  const auth = await requireRole(["DELIVERY"], ["DEL_HEAD"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, deliverySchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("record_delivery", {
    p_trade_id: body.data.tradeId, p_qty: body.data.qty ?? null, p_all_remaining: body.data.allRemaining,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json(data, { status: 201 });
}
