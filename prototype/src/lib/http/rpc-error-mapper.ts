import type { NextResponse } from "next/server";
import { apiError, serverError } from "./api-error-response";

// Maps 'CODE: detail' exceptions raised by our RPCs / triggers (P0001) to HTTP + Japanese message.
// Unknown errors become 500 without leaking SQL or stack traces.
const BUSINESS_ERRORS: Record<string, [number, string]> = {
  FORBIDDEN: [403, "この操作の権限がありません"],
  DEMO_PROTECTED: [409, "デモアカウントは変更できません"],
  NOT_FOUND: [404, "対象が見つかりません"],
  VALIDATION: [422, "入力内容を確認してください"],
  QUALIFICATION_KIND_MISMATCH: [422, "許可は仲卸、承認は売買参加者にのみ登録できます"],
  DAY_LOCKED: [423, "この業務日は締め済みです。修正申請を作成してください"],
  APPEND_ONLY: [409, "履歴は変更できません"],
  TRADE_FROZEN: [409, "確定済みの取引は変更できません。修正申請を作成してください"],
  PIN_FORMAT: [422, "PIN は4桁の数字です"],
  CONFLICT: [409, "現在の状態ではこの操作はできません"],
  // Rule 2: 許可 (仲卸) and 承認 (売買参加者) are different legal bases → different messages.
  PERMIT_INVALID: [422, "仲卸の許可が有効期間外または未登録のため確定できません"],
  APPROVAL_INVALID: [422, "売買参加者の承認が有効期間外または未登録のため確定できません"],
  BUYER_NOT_ALLOWED: [422, "買受人は有効な仲卸または売買参加者のみ指定できます"],
  OVER_LIMIT_REASON_REQUIRED: [422, "参加上限を超えます。超過理由を入力してください"],
  INSUFFICIENT_QTY: [409, "ロットの残数量が不足しています"],
  SAME_PERSON_REASON_REQUIRED: [422, "入力者と同じ人が確定する場合は理由の入力が必要です"],
  OVER_DELIVERY: [409, "引渡し数量が取引数量を超えます"],
  QUOTA_EXCEEDED: [409, "年度内の発効回数上限（4回）に達しています"],
  RATE_LOCKED: [409, "起票中（DRAFT）以外の版の交付率は変更できません"],
  DUPLICATE_FILE: [409, "このファイルはすでに取り込まれています（取消後のみ再取込できます）"],
};

// Postgres data / constraint errors (S1): client mistakes → 4xx, never 500.
const PG_CLIENT_ERRORS: Record<string, [number, string, string]> = {
  "22P02": [422, "INVALID_FORMAT", "入力の形式が正しくありません"],
  "22008": [422, "INVALID_DATE", "日付が正しくありません"],
  "23502": [422, "VALIDATION", "必須項目が不足しています"],
  "23503": [422, "VALIDATION", "参照先が存在しません"],
  "23514": [422, "VALIDATION", "入力内容が制約に違反しています"],
  "23505": [409, "DUPLICATE", "同じ内容がすでに登録されています"],
  "40P01": [409, "RETRY", "同時に操作が行われました。もう一度お試しください"],
};

// Codes whose technical detail (lot no., remaining qty, limit) is safe and useful to show.
const SHOW_DETAIL = new Set(["VALIDATION", "CONFLICT", "INSUFFICIENT_QTY", "OVER_LIMIT_REASON_REQUIRED", "OVER_DELIVERY", "DAY_LOCKED"]);

export function mapRpcError(error: { code?: string; message: string }): NextResponse {
  const businessCode = error.message.split(":")[0]?.trim();
  const known = businessCode ? BUSINESS_ERRORS[businessCode] : undefined;
  if (error.code === "P0001" && known) {
    const detail = error.message.slice(businessCode.length + 1).trim();
    const message = SHOW_DETAIL.has(businessCode) && detail ? `${known[1]}（${detail}）` : known[1];
    return apiError(known[0], businessCode, message);
  }
  const pg = error.code ? PG_CLIENT_ERRORS[error.code] : undefined;
  if (pg) return apiError(pg[0], pg[1], pg[2]);
  if (error.code === "42501") return apiError(403, "FORBIDDEN", "この操作の権限がありません");
  console.error("RPC error", error.code);
  return serverError();
}
