import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { publishSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/lots/publish — SC-03-03 一括販売公開 (only 下見済 lots; otherwise 409).
export async function POST(request: Request) {
  const auth = await requireRole(["INTAKE", "JUDGE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, publishSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("publish_lots", { p_lot_ids: body.data.lotIds });
  if (error) return mapRpcError(error);
  return NextResponse.json({ count: data });
}
