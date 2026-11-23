import { formatDate, formatYen } from "@/lib/format/display-format";
import type { ParticipantRow } from "./participant-types";

export type QualificationSummary = { ok: boolean; text: string };

// One-line status shown as soon as a buyer is chosen: 許可 for 仲卸, 承認 (+ 参加上限) for 売買参加者 —
// always named separately, never merged into a generic "qualified" flag (rule 2). Display only:
// the server still checks everything again when the trade is confirmed.
export function buyerQualificationSummary(p: ParticipantRow, today: string | null): QualificationSummary {
  const valid = (r: { status: string; valid_from?: string; valid_to: string }) =>
    r.status === "ACTIVE" && (!today || ((r.valid_from ?? "") <= today && today <= r.valid_to));
  if (p.status !== "ACTIVE") return { ok: false, text: "取引停止中" };
  if (p.kind === "NAKAOROSHI") {
    const row = p.nakaoroshi_permits.find(valid);
    return row
      ? { ok: true, text: `仲卸　許可 有効（〜${formatDate(row.valid_to)}）` }
      : { ok: false, text: "仲卸　有効な許可がありません（期限切れ・未登録）" };
  }
  if (p.kind === "BAIBAI") {
    const row = p.baibai_approvals.find(valid);
    return row
      ? { ok: true, text: `売買参加者　承認 有効（〜${formatDate(row.valid_to)}）・参加上限 ${formatYen(row.participation_limit_jpy)}` }
      : { ok: false, text: "売買参加者　有効な承認がありません（期限切れ・未登録）" };
  }
  return { ok: false, text: "この参加者は買受人になれません" };
}
