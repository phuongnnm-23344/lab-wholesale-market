import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { participantSchema, PARTICIPANT_KINDS } from "@/lib/validators/participant-schemas";

export const dynamic = "force-dynamic";

const LIST_COLUMNS =
  "id, kind, name, buyer_no, status, deposit_jpy, is_sample, " +
  "nakaoroshi_permits(permit_no, valid_to, status), baibai_approvals(approval_no, valid_to, participation_limit_jpy, status)";

// GET /api/participants?kind=&q=&expiringDays= — SC-01-01 (read: any active internal user, M18)
export async function GET(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const params = new URL(request.url).searchParams;
  const kind = params.get("kind");
  const q = params.get("q")?.trim().slice(0, 50);

  let query = auth.supabase.from("participants").select(LIST_COLUMNS).order("kind").order("buyer_no");
  if (kind && (PARTICIPANT_KINDS as readonly string[]).includes(kind)) query = query.eq("kind", kind);
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,buyer_no.ilike.%${q.replace(/[%,()]/g, "")}%`);

  const { data, error } = await query;
  if (error) return mapRpcError(error);
  return NextResponse.json({ participants: data });
}

// POST /api/participants — SC-01-02 create (照合事務局 / 照合部門長; checked again in the RPC)
export async function POST(request: Request) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, participantSchema);
  if (!body.ok) return body.response;
  const p = body.data;
  const { data, error } = await auth.supabase.rpc("upsert_participant", {
    p_id: null, p_kind: p.kind, p_name: p.name, p_buyer_no: p.buyerNo, p_email: p.email,
    p_deposit_jpy: p.depositJpy, p_status: p.status,
  });
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
