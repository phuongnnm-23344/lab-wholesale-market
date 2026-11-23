import type { CurrentUser } from "@/lib/auth/app-role-types";

type Pending = { status: string; requested_by: string | null; approver1?: string | null };

export const canApproveCorrections = (u: CurrentUser) => u.authorities.includes("STL_HEAD") || u.authorities.includes("OPS_HEAD");

// 修正申請 waiting for THIS person: level 1 needs 照合部門長, level 2 needs 運用部門長; the requester and the
// level-1 approver can never approve again (the server enforces the same rules).
export function isWaitingForMe(c: Pending, u: CurrentUser): boolean {
  if (c.requested_by === u.userId) return false;
  if (c.status === "SUBMITTED") return u.authorities.includes("STL_HEAD");
  if (c.status === "FIRST_APPROVED") return u.authorities.includes("OPS_HEAD") && c.approver1 !== u.userId;
  return false;
}
