import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";

export const dynamic = "force-dynamic";

// GET /api/seri-sessions — today's せり sessions (SC-05-01 / SC-05-02 list).
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("seri_sessions")
    .select("id, session_no, status, entered_by, confirmed_by, confirmed_at, same_person_reason, business_date")
    .eq("business_date", auth.user.businessDate ?? "").order("session_no");
  if (error) return mapRpcError(error);
  return NextResponse.json({ sessions: data ?? [], me: auth.user.userId });
}

// POST /api/seri-sessions — open a new session for result entry (取引担当).
export async function POST() {
  const auth = await requireRole(["TRADE"]);
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.rpc("create_seri_session");
  if (error) return mapRpcError(error);
  return NextResponse.json({ id: data }, { status: 201 });
}
