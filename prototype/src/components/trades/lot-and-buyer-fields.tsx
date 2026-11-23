"use client";

import type { RefObject } from "react";
import type { LotRow } from "@/lib/lots/lot-types";
import type { ParticipantRow } from "@/lib/participants/participant-types";
import { PARTICIPANT_KIND_LABELS } from "@/lib/validators/participant-schemas";

type Props = {
  lots: LotRow[]; buyers: ParticipantRow[];
  lotId: string; buyerId: string; qty: string; price: string;
  onChange: (field: "lotId" | "buyerId" | "qty" | "price", value: string) => void;
  firstRef?: RefObject<HTMLSelectElement | null>;
};

// Shared input row for 相対 (SC-04-01) and せり result entry (SC-05-01): pick lot + buyer, type qty + price.
export function LotAndBuyerFields({ lots, buyers, lotId, buyerId, qty, price, onChange, firstRef }: Props) {
  const lot = lots.find((l) => l.id === lotId);
  const field = { display: "grid", gap: 4 } as const;
  return (
    <>
      <label style={field}>ロット（販売公開中）
        <select ref={firstRef} required value={lotId} onChange={(e) => onChange("lotId", e.target.value)}>
          <option value="">選択してください</option>
          {lots.map((l) => <option key={l.id} value={l.id}>{l.lot_no} {l.species}（残 {l.available_qty}{l.unit}）</option>)}
        </select>
      </label>
      <label style={field}>買受人（買受人番号）
        <select required value={buyerId} onChange={(e) => onChange("buyerId", e.target.value)}>
          <option value="">選択してください</option>
          {buyers.map((b) => <option key={b.id} value={b.id}>{b.buyer_no} {b.name}（{PARTICIPANT_KIND_LABELS[b.kind]}）</option>)}
        </select>
      </label>
      <label style={field}>数量{lot ? `（${lot.unit}、残 ${lot.available_qty}）` : ""}
        <input required inputMode="decimal" value={qty} onChange={(e) => onChange("qty", e.target.value)} />
      </label>
      <label style={field}>単価（円）
        <input required inputMode="numeric" value={price} onChange={(e) => onChange("price", e.target.value.replace(/\D/g, ""))} />
      </label>
    </>
  );
}
