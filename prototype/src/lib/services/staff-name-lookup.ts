import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Resolves staff user ids to "氏名（社員番号）" via the staff_display_names() RPC (rule 3: show who decided).
export async function lookupStaffNames(client: SupabaseClient, ids: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return {};
  const { data } = await client.rpc("staff_display_names", { p_user_ids: unique });
  const rows = (data ?? []) as { user_id: string; display_name: string; employee_no: string }[];
  return Object.fromEntries(rows.map((r) => [r.user_id, `${r.display_name}（${r.employee_no}）`]));
}
