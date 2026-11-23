import type { BadgeTone } from "@/components/ui/status-states";

// 修正申請 status labels and badge colors (list + decision screens).
export const CORRECTION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "申請中", FIRST_APPROVED: "一次承認済（二次待ち）", APPROVED: "承認・反映済", REJECTED: "却下",
};

export const CORRECTION_STATUS_TONES: Record<string, BadgeTone> = {
  SUBMITTED: "warning", FIRST_APPROVED: "info", APPROVED: "success", REJECTED: "danger",
};
