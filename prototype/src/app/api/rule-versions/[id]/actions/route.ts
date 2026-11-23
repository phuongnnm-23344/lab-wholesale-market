import { NextResponse } from "next/server";
import { isUuid, notFound } from "@/lib/http/api-error-response";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { ruleActionSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/rule-versions/[id]/actions — submit (maker) / approve · return · cancel (checker = 照合部門長).
// Role, maker ≠ checker (S4), quota 4 / fiscal year and dates are enforced in the RPCs. MFA = mock M02.
export async function POST(request: Request, ctx: RouteContext<"/api/rule-versions/[id]/actions">) {
  const auth = await requireRole(["RULE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!isUuid(id)) return notFound();
  const body = await parseJsonBody(request, ruleActionSchema);
  if (!body.ok) return body.response;
  const { action, reason } = body.data;
  const call = {
    submit: () => auth.supabase.rpc("submit_rule_version", { p_id: id }),
    approve: () => auth.supabase.rpc("approve_rule_version", { p_id: id }),
    return: () => auth.supabase.rpc("return_rule_version", { p_id: id, p_reason: reason }),
    cancel: () => auth.supabase.rpc("cancel_rule_version", { p_id: id, p_reason: reason }),
  }[action];
  const { error } = await call();
  if (error) return mapRpcError(error);
  return NextResponse.json({ action, done: true });
}
