import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";
import { apiError, isUuid, notFound } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

// GET /api/lots/[id] — SC-03-04: lot + append-only quantity ledger + 目利き history (with recorder names).
export async function GET(_request: Request, ctx: RouteContext<"/api/lots/[id]">) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const sb = auth.supabase;
  const [lot, ledger, inspections, qty] = await Promise.all([
    sb.from("lots").select("id, lot_no, business_date, shipper_name, species, unit, qty_received, status, provisional_by, registered_by").eq("id", id).maybeSingle(),
    sb.from("lot_quantity_ledger").select("id, qty_delta, reason, ref_trade_id, created_by, created_at").eq("lot_id", id).order("created_at"),
    sb.from("lot_inspections").select("id, grade, freshness_note, inspected_by, created_at").eq("lot_id", id).order("created_at"),
    sb.from("v_lot_available_qty").select("available_qty").eq("lot_id", id).maybeSingle(),
  ]);
  const failed = [lot, ledger, inspections, qty].find((r) => r.error);
  if (failed?.error) return mapRpcError(failed.error);
  if (!lot.data) return apiError(404, "NOT_FOUND", "対象が見つかりません");

  const staff = await lookupStaffNames(sb, [
    lot.data.provisional_by, lot.data.registered_by,
    ...(ledger.data ?? []).map((r) => r.created_by), ...(inspections.data ?? []).map((r) => r.inspected_by),
  ]);
  return NextResponse.json({
    lot: lot.data,
    availableQty: Number(qty.data?.available_qty ?? 0),
    ledger: ledger.data ?? [],
    inspections: inspections.data ?? [],
    staff,
  });
}
