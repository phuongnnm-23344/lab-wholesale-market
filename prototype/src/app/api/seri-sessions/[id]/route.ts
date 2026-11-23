import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";
import { apiError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

// GET /api/seri-sessions/[id] — session header + its result rows (PROVISIONAL until confirmed).
export async function GET(_request: Request, ctx: RouteContext<"/api/seri-sessions/[id]">) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const { data: session, error } = await auth.supabase.from("seri_sessions")
    .select("id, session_no, status, business_date, entered_by, confirmed_by, confirmed_at, same_person_reason")
    .eq("id", id).maybeSingle();
  if (error) return mapRpcError(error);
  if (!session) return apiError(404, "NOT_FOUND", "対象が見つかりません");
  const { data: results, error: resultError } = await auth.supabase.from("trades")
    .select("id, trade_no, qty, unit_price_jpy, amount_jpy, status, lots(lot_no, species, unit), participants(name, buyer_no, kind)")
    .eq("seri_session_id", id).order("trade_no");
  if (resultError) return mapRpcError(resultError);
  const staff = await lookupStaffNames(auth.supabase, [session.entered_by, session.confirmed_by]);
  return NextResponse.json({ session, results: results ?? [], staff, me: auth.user.userId });
}
