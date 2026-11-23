import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";
import { correctionSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// GET /api/corrections?status= — SC-08-02 修正申請一覧 (with the requester's name).
export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const status = new URL(request.url).searchParams.get("status");
  let query = auth.supabase.from("correction_requests")
    .select("id, status, reason, requested_by, approver1, approver2, created_at, change, trades(trade_no, business_date)")
    .order("created_at", { ascending: false }).limit(100);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return mapRpcError(error);
  const staff = await lookupStaffNames(auth.supabase, (data ?? []).flatMap((c) => [c.requested_by, c.approver1, c.approver2]));
  return NextResponse.json({ corrections: data ?? [], staff, me: auth.user });
}

// POST /api/corrections — SC-08-01 修正申請作成 (FORM-CORR-01). Reason mandatory; original never edited.
export async function POST(request: Request) {
  const auth = await requireRole(["TRADE", "DELIVERY", "SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, correctionSchema);
  if (!body.ok) return body.response;
  const b = body.data;
  const { data, error } = await auth.supabase.rpc("submit_correction", {
    p_trade_id: b.tradeId, p_new_qty: b.newQty, p_new_unit_price_jpy: b.newUnitPriceJpy,
    p_new_buyer_id: b.newBuyerId, p_reason: b.reason,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
