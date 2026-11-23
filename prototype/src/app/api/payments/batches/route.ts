import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

// GET /api/payments/batches — recent 入金 import batches with their void record (SC-09-01).
export async function GET() {
  const auth = await requireRole(["SETTLE"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("payment_import_batches")
    .select("id, file_name, row_count, imported_by, imported_at, payment_batch_voids(reason, voided_by, created_at)")
    .order("imported_at", { ascending: false }).limit(20);
  if (error) return mapRpcError(error);
  const staff = await lookupStaffNames(auth.supabase, (data ?? []).flatMap((b) => [
    b.imported_by, ...((b.payment_batch_voids as { voided_by: string | null }[]) ?? []).map((v) => v.voided_by),
  ]));
  return NextResponse.json({ batches: data ?? [], staff, me: auth.user });
}
