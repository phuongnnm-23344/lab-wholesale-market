import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { parsePaymentCsv } from "@/lib/services/payment-csv-parser";
import { paymentImportSchema } from "@/lib/validators/lot-and-trade-schemas";

export const dynamic = "force-dynamic";

// POST /api/payments/import — SC-09-01 入金CSV取込 (fictional format, mock M07). The browser sends the file
// text (≤ 1 MB); only parsed rows are stored, never the file. Unknown 買受人番号 → reported per line.
export async function POST(request: Request) {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, paymentImportSchema);
  if (!body.ok) return body.response;
  const parsed = parsePaymentCsv(body.data.csv);
  if (parsed.rows.length === 0) {
    return NextResponse.json({ imported: 0, errors: parsed.errors }, { status: 422 });
  }
  const { data, error } = await auth.supabase.rpc("import_payments", { p_file_name: body.data.fileName, p_rows: parsed.rows });
  if (error) return mapRpcError(error);
  const result = data as { batch_id: string; imported: number; errors: { line: number; reason: string }[] };
  return NextResponse.json({ ...result, errors: [...parsed.errors, ...result.errors] }, { status: 201 });
}
