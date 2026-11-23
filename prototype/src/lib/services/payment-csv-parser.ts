// Parses the FICTIONAL 入金 CSV format of the prototype (mock M07): header 「買受人番号,入金日,金額」,
// one row per payment. The real accounting-software format is still an open question (E-01).
// Returns valid rows + per-line errors; never evaluates cell content (formula-like values are rejected).

export type ParsedPaymentRow = { line: number; buyer_no: string; paid_on: string; amount: number };
export type CsvLineError = { line: number; reason: string };

const MAX_LINES = 2000;

export function parsePaymentCsv(text: string): { rows: ParsedPaymentRow[]; errors: CsvLineError[] } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  const rows: ParsedPaymentRow[] = [];
  const errors: CsvLineError[] = [];
  if (lines.length === 0) return { rows, errors: [{ line: 1, reason: "ファイルが空です" }] };
  if (!/^買受人番号,入金日,金額$/.test(lines[0].trim())) {
    return { rows, errors: [{ line: 1, reason: "見出し行は「買受人番号,入金日,金額」としてください" }] };
  }
  if (lines.length - 1 > MAX_LINES) return { rows, errors: [{ line: 1, reason: `行数は${MAX_LINES}行までです` }] };

  lines.slice(1).forEach((raw, i) => {
    const line = i + 2;
    const cells = raw.split(",").map((c) => c.trim());
    if (cells.length !== 3) return errors.push({ line, reason: "列数が3ではありません" });
    const [buyerNo, paidOn, amountText] = cells;
    if (cells.some((c) => /^[=+\-@]/.test(c))) return errors.push({ line, reason: "数式のような値は取り込めません" });
    if (!/^[A-Z0-9]{1,10}$/.test(buyerNo)) return errors.push({ line, reason: "買受人番号が不正です" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || Number.isNaN(Date.parse(paidOn))) return errors.push({ line, reason: "入金日は YYYY-MM-DD です" });
    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount <= 0 || amount > 10_000_000_000) return errors.push({ line, reason: "金額が不正です" });
    rows.push({ line, buyer_no: buyerNo, paid_on: paidOn, amount });
  });
  return { rows, errors };
}
