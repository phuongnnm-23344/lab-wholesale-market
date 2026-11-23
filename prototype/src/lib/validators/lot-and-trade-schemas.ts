import { z } from "zod";

const qty = z.number().positive().max(100_000);
const text = (max: number) => z.string().trim().min(1).max(max);
const ids = z.array(z.string().uuid()).min(1).max(100);

// SC-03-02 仮受付 (3–4 fields)
export const provisionalLotSchema = z.object({ shipperName: text(60), species: text(60), qtyEstimate: qty });

// SC-03-01 本登録 (lotId = 仮受付 lot to complete, or omitted for a new lot)
export const registerLotSchema = z.object({
  lotId: z.string().uuid().optional(),
  shipperName: text(60), species: text(60), unit: z.enum(["kg", "尾", "箱", "ケース"]), qty,
});

// SC-03-05 目利き・下見 (human judgement, free grade + note)
export const inspectionSchema = z.object({ lotIds: ids, grade: z.enum(["S", "A", "B", "C"]), note: z.string().trim().max(200).default("") });

export const publishSchema = z.object({ lotIds: ids });

// SC-04-01 相対取引 / SC-05-01 せり結果
const tradeLine = {
  lotId: z.string().uuid(), buyerId: z.string().uuid(), qty,
  unitPriceJpy: z.number().int().positive().max(1_000_000),
};
export const aitaiTradeSchema = z.object({ ...tradeLine, overLimitReason: z.string().trim().max(200).default("") });
export const seriResultSchema = z.object(tradeLine);
// overLimitReasons: { "<trade id>": "<reason>" } — required for every result over 参加上限 (rule 3).
export const seriConfirmSchema = z.object({
  samePersonReason: z.string().trim().max(200).default(""),
  overLimitReasons: z.record(z.string().uuid(), z.string().trim().max(200)).default({}),
});

export const deliverySchema = z.object({ tradeId: z.string().uuid(), qty: qty.optional(), allRemaining: z.boolean().default(false) })
  .refine((v) => v.allRemaining || v.qty !== undefined, { path: ["qty"] });

export const correctionSchema = z.object({
  tradeId: z.string().uuid(), newQty: qty, newUnitPriceJpy: z.number().int().positive().max(1_000_000),
  newBuyerId: z.string().uuid(), reason: text(200),
});
export const rejectSchema = z.object({ reason: text(200) });

// Phase 08 — rule versions (effective on the 1st of a month; rollback = copy of an approved version)
export const ruleVersionCreateSchema = z.object({
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-01$/, "YYYY-MM-01"),
  note: z.string().trim().max(200).default(""),
  rollbackSourceId: z.string().uuid().optional(),
});
export const rateRowsSchema = z.object({
  rows: z.array(z.object({ min: z.number().int().min(0), max: z.number().int().positive().nullable(), rate: z.number().int().min(0).max(1000) })).min(1).max(10),
});
export const ruleActionSchema = z.object({ action: z.enum(["submit", "approve", "return", "cancel"]), reason: z.string().trim().max(200).default("") });

// Phase 09 — 入金 CSV (fictional sample) and incentive actions
export const paymentImportSchema = z.object({ fileName: z.string().trim().min(1).max(100), csv: z.string().min(1).max(1_000_000) });
export const incentiveActionSchema = z.object({ action: z.enum(["preview", "run", "lock"]) });

export const LOT_STATUS_LABELS: Record<string, string> = {
  PROVISIONAL: "仮受付", RECEIVED: "受付済", INSPECTED: "下見済", PUBLISHED: "販売公開",
  SOLD_OUT: "売切", DELIVERED: "引渡完了",
};
export const CHANNEL_LABELS: Record<string, string> = { AITAI: "相対", SERI: "せり" };
