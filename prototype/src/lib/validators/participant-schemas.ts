import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");

export const PARTICIPANT_KINDS = ["WHOLESALER", "NAKAOROSHI", "BAIBAI", "KAIDASHI"] as const;
export type ParticipantKind = (typeof PARTICIPANT_KINDS)[number];

export const participantSchema = z.object({
  kind: z.enum(PARTICIPANT_KINDS),
  name: z.string().trim().min(1).max(100),
  buyerNo: z.string().trim().toUpperCase().regex(/^([A-Z0-9]{1,10})?$/, "英大文字・数字 1〜10桁").default(""),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).default(""),
  depositJpy: z.number().int().min(0).max(1_000_000_000),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
}).refine((p) => !(["NAKAOROSHI", "BAIBAI"].includes(p.kind) && p.buyerNo === ""), {
  path: ["buyerNo"], message: "仲卸・売買参加者は買受人番号が必須です",
});

const validityRange = { validFrom: isoDate, validTo: isoDate };
const fromBeforeTo = (v: { validFrom: string; validTo: string }) => v.validFrom <= v.validTo;

// 許可 (仲卸) — FR-PARTY-01, 02-08
export const permitSchema = z
  .object({ permitNo: z.string().trim().min(1).max(50), ...validityRange })
  .refine(fromBeforeTo, { path: ["validTo"] });

// 承認 + 参加上限 (売買参加者) — separate legal basis from 許可
export const approvalSchema = z
  .object({
    approvalNo: z.string().trim().min(1).max(50),
    ...validityRange,
    limitJpy: z.number().int().positive().max(10_000_000_000),
  })
  .refine(fromBeforeTo, { path: ["validTo"] });

export const PARTICIPANT_KIND_LABELS: Record<ParticipantKind, string> = {
  WHOLESALER: "卸売業者",
  NAKAOROSHI: "仲卸",
  BAIBAI: "売買参加者",
  KAIDASHI: "買出人",
};
