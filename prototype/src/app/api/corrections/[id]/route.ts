import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";
import { apiError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

// GET /api/corrections/[id] — SC-08-03: before / after (incl. buyer names), approvals, created adjustments.
export async function GET(_request: Request, ctx: RouteContext<"/api/corrections/[id]">) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const sb = auth.supabase;
  const { data: corr, error } = await sb.from("correction_requests")
    .select("id, status, reason, reject_reason, requested_by, approver1, approver2, created_at, change, target_trade_id, trades(trade_no, business_date, channel)")
    .eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!corr) return apiError(404, "NOT_FOUND", "対象が見つかりません");
  const change = corr.change as { before: { buyer_id: string }; after: { buyer_id: string } };
  const [buyers, adjustments] = await Promise.all([
    sb.from("participants").select("id, name, buyer_no").in("id", [change.before.buyer_id, change.after.buyer_id]),
    sb.from("trade_adjustments").select("id, kind, qty_delta, amount_delta_jpy, business_date, buyer_id").eq("correction_id", id),
  ]);
  const staff = await lookupStaffNames(sb, [corr.requested_by, corr.approver1, corr.approver2]);
  return NextResponse.json({
    correction: corr,
    buyers: Object.fromEntries((buyers.data ?? []).map((b) => [b.id, `${b.buyer_no} ${b.name}`])),
    adjustments: adjustments.data ?? [],
    staff,
    me: auth.user,
  });
}
