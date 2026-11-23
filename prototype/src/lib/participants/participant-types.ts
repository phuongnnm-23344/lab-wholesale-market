import type { ParticipantKind } from "@/lib/validators/participant-schemas";

export type PermitRow = { id?: string; permit_no: string; valid_from?: string; valid_to: string; status: string; created_at?: string };
export type ApprovalRow = {
  id?: string; approval_no: string; valid_from?: string; valid_to: string;
  participation_limit_jpy: number; status: string; created_at?: string;
};

export type ParticipantRow = {
  id: string;
  kind: ParticipantKind;
  name: string;
  buyer_no: string | null;
  email?: string | null;
  deposit_jpy: number;
  status: "ACTIVE" | "SUSPENDED";
  is_sample: boolean;
  nakaoroshi_permits: PermitRow[];
  baibai_approvals: ApprovalRow[];
};

export const QUALIFICATION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "有効",
  SUPERSEDED: "更新済（旧）",
  EXPIRED: "失効",
};

// Current qualification of a participant: 許可 for 仲卸, 承認 for 売買参加者 — never merged (rule 2).
export function currentQualification(p: ParticipantRow): { label: string; validTo: string } | null {
  if (p.kind === "NAKAOROSHI") {
    const row = p.nakaoroshi_permits.find((r) => r.status === "ACTIVE");
    return row ? { label: `許可 ${row.permit_no}`, validTo: row.valid_to } : null;
  }
  if (p.kind === "BAIBAI") {
    const row = p.baibai_approvals.find((r) => r.status === "ACTIVE");
    return row ? { label: `承認 ${row.approval_no}`, validTo: row.valid_to } : null;
  }
  return null;
}

export function daysUntil(isoDate: string, today: string | null): number | null {
  if (!today) return null;
  return Math.round((Date.parse(isoDate) - Date.parse(today)) / 86_400_000);
}

export { formatYen as yen } from "@/lib/format/display-format";
