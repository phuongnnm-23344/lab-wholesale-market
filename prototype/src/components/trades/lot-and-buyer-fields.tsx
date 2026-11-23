"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { FormField } from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-states";
import { formatNumber } from "@/lib/format/display-format";
import type { LotRow } from "@/lib/lots/lot-types";
import { buyerQualificationSummary } from "@/lib/participants/buyer-qualification-summary";
import type { ParticipantRow } from "@/lib/participants/participant-types";

export type SaleField = "lotId" | "buyerId" | "qty" | "price";
type Props = {
  lots: LotRow[]; buyers: ParticipantRow[];
  lotId: string; buyerId: string; qty: string; price: string;
  onChange: (field: SaleField, value: string) => void;
  errors?: Partial<Record<SaleField, string>>;
  priceNext?: string; // id of a field after 単価 (e.g. over-limit reason); none → Enter on 単価 submits
};

// 「5」 → lot …-5 of today; also accepts the full lot number picked from the suggestions.
function findLot(lots: LotRow[], text: string) {
  const t = text.trim().toUpperCase();
  if (!t) return undefined;
  return /^\d+$/.test(t) ? lots.find((l) => l.lot_no.endsWith(`-${Number(t)}`)) : lots.find((l) => l.lot_no.toUpperCase() === t);
}

// Shared rows (inside a .form-grid) for 相対 and せり result entry. Lot and buyer are typed by their
// short number with suggestions below (hundreds of lots a day); Enter moves to the next field.
export function LotAndBuyerFields({ lots, buyers, lotId, buyerId, qty, price, onChange, errors = {}, priceNext }: Props) {
  const me = useCurrentUser();
  const today = me.status === "ready" ? me.user.businessDate : null;
  const [lotText, setLotText] = useState(() => lots.find((l) => l.id === lotId)?.lot_no ?? "");
  const [buyerText, setBuyerText] = useState(() => buyers.find((b) => b.id === buyerId)?.buyer_no ?? "");
  const lot = lots.find((l) => l.id === lotId);
  const buyer = buyers.find((b) => b.id === buyerId);
  const qual = buyer ? buyerQualificationSummary(buyer, today) : null;
  const unit = lot?.unit ?? "単位";

  function typeLot(text: string) {
    setLotText(text);
    onChange("lotId", findLot(lots, text)?.id ?? "");
  }
  function typeBuyer(text: string) {
    setBuyerText(text);
    onChange("buyerId", buyers.find((b) => (b.buyer_no ?? "").toUpperCase() === text.trim().toUpperCase())?.id ?? "");
  }

  return (
    <>
      <FormField label="ロット" required htmlFor="f-lot" error={errors.lotId}
        hint={lot ? <>{lot.lot_no}　{lot.species}　残 <strong>{formatNumber(lot.available_qty)}{lot.unit}</strong></> : "ロット番号の末尾の数字（例：5）を入力、または候補から選択"}>
        <input id="f-lot" list="f-lot-list" data-next="f-buyer" autoComplete="off" required value={lotText} onChange={(e) => typeLot(e.target.value)} style={{ maxWidth: 220 }} />
        <datalist id="f-lot-list">{lots.map((l) => <option key={l.id} value={l.lot_no}>{l.species}（残 {formatNumber(l.available_qty)}{l.unit}）</option>)}</datalist>
      </FormField>
      <FormField label="買受人" required htmlFor="f-buyer" error={errors.buyerId}
        hint={buyer ? <>{buyer.buyer_no} {buyer.name}　<StatusBadge tone={qual?.ok ? "success" : "danger"}>{qual?.text}</StatusBadge></> : "買受人番号（例：N01）を入力、または候補から選択"}>
        <input id="f-buyer" list="f-buyer-list" data-next="f-qty" autoComplete="off" required value={buyerText} onChange={(e) => typeBuyer(e.target.value)} style={{ maxWidth: 220 }} />
        <datalist id="f-buyer-list">{buyers.map((b) => <option key={b.id} value={b.buyer_no ?? ""}>{b.name}</option>)}</datalist>
      </FormField>
      <FormField label={`数量（${unit}）`} required htmlFor="f-qty" error={errors.qty} hint="小数第2位まで">
        <input id="f-qty" data-next="f-price" required inputMode="decimal" value={qty} onChange={(e) => onChange("qty", e.target.value)} style={{ maxWidth: 220 }} />
      </FormField>
      <FormField label={`単価（円/${unit}）`} required htmlFor="f-price" error={errors.price}>
        <input id="f-price" data-next={priceNext} required inputMode="numeric" value={price} onChange={(e) => onChange("price", e.target.value.replace(/\D/g, ""))} style={{ maxWidth: 220 }} />
      </FormField>
    </>
  );
}

// Puts a server error message under the field it concerns (the toast still shows it too).
export function fieldForError(message: string): SaleField {
  if (/参加上限|許可|承認|買受人|BUYER|PERMIT|APPROVAL/.test(message)) return "buyerId";
  if (/単価|価格|price/i.test(message)) return "price";
  if (/ロット|lot/i.test(message) && !/数量|残/.test(message)) return "lotId";
  return "qty";
}
