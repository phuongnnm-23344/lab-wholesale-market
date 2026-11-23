import { NextResponse } from "next/server";
import { apiError, serverError, unauthenticated } from "@/lib/http/api-error-response";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { switchUserByPin } from "@/lib/services/pin-switch-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { pinSwitchSchema } from "@/lib/validators/account-schemas";

export const dynamic = "force-dynamic";

const OUTCOME_RESPONSES: Record<string, [number, string]> = {
  SOURCE_NOT_ALLOWED: [403, "この端末の利用者は利用者切替を使えません"],
  TARGET_NOT_ALLOWED: [403, "この社員番号には切り替えられません"],
  SAME_USER: [422, "すでにこの利用者で操作中です"],
  PIN_NOT_SET: [422, "PIN が設定されていません。システム管理者に依頼してください"],
  PIN_INVALID: [422, "社員番号または PIN が正しくありません"],
  PIN_LOCKED: [423, "PIN が一時的にロックされています（15分後に再試行）"],
};

// POST /api/auth/pin-switch — SC-00-02. Requires an existing signed-in session on this device:
// a stranger cannot use a PIN to get in from scratch.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthenticated();

  const body = await parseJsonBody(request, pinSwitchSchema);
  if (!body.ok) return body.response;

  const outcome = await switchUserByPin(supabase, user.id, body.data.employeeNo, body.data.pin);
  if (outcome.ok) return NextResponse.json({ switched: true });
  const mapped = OUTCOME_RESPONSES[outcome.code];
  return mapped ? apiError(mapped[0], outcome.code, mapped[1]) : serverError();
}
