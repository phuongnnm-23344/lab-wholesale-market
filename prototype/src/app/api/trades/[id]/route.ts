import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";
import { apiError, isUuid, notFound } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

// GET /api/trades/[id] — SC-04-04: original trade (never overwritten), REVERSE/DELTA rows with their own
// buyer (phase 07), deliveries, the rule version applied on that day (FT-13-03), and 取引確認票 content.
export async function GET(_request: Request, ctx: RouteContext<"/api/trades/[id]">) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const sb = auth.supabase;
  const { data: trade, error } = await sb.from("trades")
    .select("id, trade_no, business_date, channel, qty, unit_price_jpy, amount_jpy, status, over_limit_reason, created_by, confirmed_by, confirmed_at, seri_session_id, lots(lot_no, species, unit, shipper_name), participants(name, buyer_no, kind)")
    .eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!trade) return apiError(404, "NOT_FOUND", "対象が見つかりません");

  const [adjustments, deliveries, version] = await Promise.all([
    sb.from("trade_adjustments").select("id, kind, qty_delta, amount_delta_jpy, unit_price_jpy, business_date, created_at, participants(name, buyer_no)").eq("trade_id", id).order("created_at"),
    sb.from("deliveries").select("id, qty_delivered, business_date, recorded_by, created_at").eq("trade_id", id).order("created_at"),
    sb.rpc("active_rule_version_on", { p_day: trade.business_date }),
  ]);
  const { data: rule } = version.data
    ? await sb.from("rule_versions").select("version_no, effective_from").eq("id", version.data).maybeSingle()
    : { data: null };
  const staff = await lookupStaffNames(sb, [trade.created_by, trade.confirmed_by, ...(deliveries.data ?? []).map((d) => d.recorded_by)]);
  return NextResponse.json({
    trade, adjustments: adjustments.data ?? [], deliveries: deliveries.data ?? [], ruleVersion: rule, staff,
  });
}
