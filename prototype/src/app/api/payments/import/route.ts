import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { parsePaymentCsv } from "@/lib/services/payment-csv-parser";
import { paymentImportSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// SHA-256 of the normalised file (BOM removed, CRLF → LF, trailing blank lines ignored), so the same file
// saved by another editor is still recognised as the same file (code review C1).
function fileHash(csv: string): string {
  const normalised = csv.replace(/^﻿/, "").replace(/\r\n?/g, "\n").replace(/\n+$/, "");
  return createHash("sha256").update(normalised, "utf8").digest("hex");
}

// POST /api/payments/import — SC-09-01 入金CSV取込 (fictional format, mock M07). The browser sends the file
// text (≤ 1 MB); only parsed rows are stored. Same file twice → 409 DUPLICATE_FILE (void it first).
export async function POST(request: Request) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, paymentImportSchema);
  if (!body.ok) return body.response;
  const parsed = parsePaymentCsv(body.data.csv);
  if (parsed.rows.length === 0) {
    return NextResponse.json({ imported: 0, errors: parsed.errors }, { status: 422 });
  }
  const { data, error } = await auth.supabase.rpc("import_payments", {
    p_file_name: body.data.fileName, p_rows: parsed.rows, p_file_sha256: fileHash(body.data.csv),
  });
  if (error) return mapRpcError(error);
  const result = data as { batch_id: string; imported: number; errors: { line: number; reason: string }[] };
  return NextResponse.json({ ...result, errors: [...parsed.errors, ...result.errors] }, { status: 201 });
}
