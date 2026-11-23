import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { provisionalLotSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/lots/provisional — SC-03-02 仮受付 on the dock tablet (online only; offline = mock M04).
export async function POST(request: Request) {
  const auth = await requireRole(["INTAKE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, provisionalLotSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("provisional_receive_lot", {
    p_shipper_name: body.data.shipperName, p_species: body.data.species, p_qty_estimate: body.data.qtyEstimate,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
