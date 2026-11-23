export type RuleVersion = {
  id: string; version_no: number; effective_from: string; status: string; note: string | null;
  maker_id: string | null; checker_id: string | null; approved_at: string | null; rollback_of: string | null;
};
export type RateRow = { min_paid_jpy: number; max_paid_jpy: number | null; rate_permille: number };

export const RULE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "起票中", PENDING: "承認待ち", ACTIVE: "承認済（最新）", SUPERSEDED: "承認済（後続版あり）", CANCELLED: "取消",
};

export const fiscalYearLabel = (isoDate: string) => {
  const [y, m] = isoDate.split("-").map(Number);
  return `${m >= 4 ? y : y - 1}年度`;
};
export const fiscalYearStart = (isoDate: string) => {
  const [y, m] = isoDate.split("-").map(Number);
  return `${m >= 4 ? y : y - 1}-04-01`;
};
