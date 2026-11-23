import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { inspectionSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/lots/inspections — SC-03-05 目利き・下見 recorded by a person (目利き記録担当). No AI grading.
export async function POST(request: Request) {
  const auth = await requireRole(["JUDGE"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, inspectionSchema);
  if (!body.ok) return body.response;
  const { data, error } = await auth.supabase.rpc("record_inspections", {
    p_lot_ids: body.data.lotIds, p_grade: body.data.grade, p_note: body.data.note,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ count: data }, { status: 201 });
}
