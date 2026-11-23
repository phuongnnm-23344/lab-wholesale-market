"use client";

import type { RefObject } from "react";
import { FormField } from "@/components/ui/form-field";
import { formatNumber } from "@/lib/format/display-format";
import type { LotRow } from "@/lib/lots/lot-types";
import type { ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS } from "@/lib/validators/participant-schemas";

type Props = {
  lots: LotRow[]; buyers: ParticipantRow[];
  lotId: string; buyerId: string; qty: string; price: string;
  onChange: (field: "lotId" | "buyerId" | "qty" | "price", value: string) => void;
  firstRef?: RefObject<HTMLSelectElement | null>;
};

// Shared rows (inside a .form-grid) for 相対 and せり result entry: lot + buyer, qty + price.
export function LotAndBuyerFields({ lots, buyers, lotId, buyerId, qty, price, onChange, firstRef }: Props) {
  const lot = lots.find((l) => l.id === lotId);
  return (
    <>
      <FormField label="ロット" required htmlFor="f-lot" hint="販売公開中のロットのみ表示">
        <select id="f-lot" ref={firstRef} required value={lotId} onChange={(e) => onChange("lotId", e.target.value)}>
          <option value="">選択してください</option>
          {lots.map((l) => <option key={l.id} value={l.id}>{l.lot_no} {l.species}（残 {formatNumber(l.available_qty)}{l.unit}）</option>)}
        </select>
      </FormField>
      <FormField label="買受人" required htmlFor="f-buyer">
        <select id="f-buyer" required value={buyerId} onChange={(e) => onChange("buyerId", e.target.value)}>
          <option value="">選択してください</option>
          {buyers.map((b) => <option key={b.id} value={b.id}>{b.buyer_no} {b.name}（{PARTICIPANT_KIND_LABELS[b.kind]}）</option>)}
        </select>
      </FormField>
      <FormField label="数量" required htmlFor="f-qty" hint={lot ? `単位 ${lot.unit}・残 ${formatNumber(lot.available_qty)}` : "小数第2位まで"}>
        <input id="f-qty" required inputMode="decimal" value={qty} onChange={(e) => onChange("qty", e.target.value)} />
      </FormField>
      <FormField label="単価（円）" required htmlFor="f-price">
        <input id="f-price" required inputMode="numeric" value={price} onChange={(e) => onChange("price", e.target.value.replace(/\D/g, ""))} />
      </FormField>
    </>
  );
}
