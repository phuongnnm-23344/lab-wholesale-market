import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { aitaiTradeSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/trades/aitai — SC-04-01 相対取引確定 (main flow). The RPC checks, in one transaction:
// lot on sale + quantity (409), 許可 / 承認 at this moment (422, different messages), 参加上限 reason.
export async function POST(request: Request) {
  const auth = await requireRole(["TRADE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, aitaiTradeSchema);
  if (!body.ok) return body.response;
  const b = body.data;
  const { data, error } = await auth.supabase.rpc("confirm_aitai_trade", {
    p_lot_id: b.lotId, p_buyer_id: b.buyerId, p_qty: b.qty, p_unit_price_jpy: b.unitPriceJpy,
    p_over_limit_reason: b.overLimitReason,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json(data, { status: 201 });
}
