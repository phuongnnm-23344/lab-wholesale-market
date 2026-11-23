import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";

export const dynamic = "force-dynamic";

// GET /api/trades?date=&channel=AITAI|SERI|ALL&buyerNo= — SC-04-03.
// Default channel is 相対 (rule 1: 相対取引 is the main flow; せり is shown on request).
export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? auth.user.businessDate;
  const channel = params.get("channel") ?? "AITAI";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ trades: [] });

  let query = auth.supabase.from("trades")
    .select("id, trade_no, business_date, channel, qty, unit_price_jpy, amount_jpy, status, over_limit_reason, confirmed_at, lots(lot_no, species, unit), participants(name, buyer_no, kind)")
    .eq("business_date", date).order("trade_no");
  if (channel !== "ALL") query = query.eq("channel", channel === "SERI" ? "SERI" : "AITAI");
  const { data, error } = await query;
  if (error) return mapRpcError(error);
  return NextResponse.json({ date, channel, trades: data ?? [] });
}
