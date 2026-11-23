import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { mapRpcError } from "@/lib/http/rpc-error-mapper";
import { lookupStaffNames } from "@/lib/services/staff-name-lookup";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

// GET /api/audit-logs?table=&action=&record=&from=&to=&before=<id> — SC-13-01 (照合事務局, 照合部門長,
// システム管理者; RLS enforces the same). Keyset paging by id (newest first). Read-only: the table is append-only.
export async function GET(request: Request) {
  const auth = await requireRole(["SETTLE", "SYSADM"], ["STL_HEAD"]);
  if (!auth.ok) return auth.response;
  const p = new URL(request.url).searchParams;
  let q = auth.supabase.from("audit_logs")
    .select("id, actor_id, action, table_name, record_id, before, after, business_date, at")
    .order("id", { ascending: false }).limit(PAGE_SIZE + 1);
  const table = p.get("table"), action = p.get("action"), record = p.get("record");
  const from = p.get("from"), to = p.get("to"), before = p.get("before");
  if (table && /^[a-z_]{1,40}$/.test(table)) q = q.eq("table_name", table);
  if (action && /^[A-Z_]{1,30}$/.test(action)) q = q.eq("action", action);
  if (record && /^[0-9a-f-]{1,40}$/i.test(record)) q = q.eq("record_id", record);
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) q = q.gte("business_date", from);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) q = q.lte("business_date", to);
  if (before && /^\d+$/.test(before)) q = q.lt("id", Number(before));
  const { data, error } = await q;
  if (error) return mapRpcError(error);
  const rows = (data ?? []).slice(0, PAGE_SIZE);
  const staff = await lookupStaffNames(auth.supabase, rows.map((r) => r.actor_id));
  return NextResponse.json({ logs: rows, staff, nextBefore: (data ?? []).length > PAGE_SIZE ? rows.at(-1)?.id : null });
}
