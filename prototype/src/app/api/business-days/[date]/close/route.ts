import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { apiError } from "@/lib/http/api-error-response";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";

export const dynamic = "force-dynamic";

// POST /api/business-days/[date]/close — SC-07-02 日次締め (照合部門長 only; MFA = mock M02).
// Final: there is no unlock API. Blocks while せり sessions are unconfirmed.
export async function POST(_request: Request, ctx: RouteContext<"/api/business-days/[date]/close">) {
  const auth = await requireRole([], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { date } = await ctx.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return apiError(422, "VALIDATION", "日付の形式が正しくありません");
  const { data, error } = await auth.supabase.rpc("close_business_day", { p_day: date });
  if (error) return mapRpcError(error);
  return NextResponse.json({ closed: date, nextBusinessDate: data });
}
