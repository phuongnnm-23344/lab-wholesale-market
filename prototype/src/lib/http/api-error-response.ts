import { NextResponse } from "next/server";

// Uniform JSON error body for every /api route. Messages are Japanese, never stack traces or SQL.
export function apiError(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const unauthenticated = () => apiError(401, "UNAUTHENTICATED", "ログインが必要です");
export const forbidden = () => apiError(403, "FORBIDDEN", "この操作の権限がありません");
export const inactiveAccount = () =>
  apiError(403, "ACCOUNT_INACTIVE", "このアカウントは利用できません。管理者にお問い合わせください");
export const serverError = () =>
  apiError(500, "SERVER_ERROR", "処理中にエラーが発生しました。時間をおいて再度お試しください");
