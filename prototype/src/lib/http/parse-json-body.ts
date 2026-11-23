import type { NextResponse } from "next/server";
import type { z } from "zod";
import { apiError } from "./api-error-response";

// Validates a JSON request body with zod. Returns the typed data or a 422 response.
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError(400, "BAD_JSON", "リクエストの形式が正しくありません") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path.join(".") || "入力";
    return { ok: false, response: apiError(422, "VALIDATION", `入力内容を確認してください（${field}）`) };
  }
  return { ok: true, data: parsed.data };
}
