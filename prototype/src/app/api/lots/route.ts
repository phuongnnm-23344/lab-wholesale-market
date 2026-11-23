import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { registerLotSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// GET /api/lots?date=YYYY-MM-DD&status= — SC-03-03 (default: current 業務日). Includes available qty.
export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? auth.user.businessDate;
  const status = params.get("status");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ lots: [] });

  let lots = auth.supabase.from("lots")
    .select("id, lot_no, business_date, shipper_name, species, unit, qty_received, status")
    .eq("business_date", date).order("lot_no");
  if (status) lots = lots.eq("status", status);
  const [lotRes, qtyRes] = await Promise.all([
    lots, auth.supabase.from("v_lot_available_qty").select("lot_id, available_qty").eq("business_date", date),
  ]);
  if (lotRes.error) return mapRpcError(lotRes.error);
  if (qtyRes.error) return mapRpcError(qtyRes.error);
  const available = new Map((qtyRes.data ?? []).map((q) => [q.lot_id, Number(q.available_qty)]));
  return NextResponse.json({
    date, lots: (lotRes.data ?? []).map((l) => ({ ...l, available_qty: available.get(l.id) ?? 0 })),
  });
}

// POST /api/lots — SC-03-01 本登録 (受付担当). Completes a 仮受付 lot or registers a new one.
export async function POST(request: Request) {
  const auth = await requireRole(["INTAKE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, registerLotSchema);
  if (!body.ok) return body.response;
  const b = body.data;
  const { data, error } = await auth.supabase.rpc("register_lot", {
    p_lot_id: b.lotId ?? null, p_shipper_name: b.shipperName, p_species: b.species, p_unit: b.unit, p_qty: b.qty,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
