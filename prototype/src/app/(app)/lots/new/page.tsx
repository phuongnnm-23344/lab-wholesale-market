"use client";

import { useRef, useState, type FormEvent } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import { SAMPLE_SHIPPERS, SAMPLE_SPECIES, type LotListResponse } from "@/lib/lots/lot-types";

// SC-03-01 ロット本登録（受付台・PC）: complete a 仮受付 lot or register a new one; continuous entry,
// focus returns to the first field after saving (NFR-USE-01). Writes the 受入 ledger row.
export default function LotRegistrationPage() {
  const { data, reload } = useApiResource<LotListResponse>("/api/lots?status=PROVISIONAL");
  const [lotId, setLotId] = useState("");
  const [shipper, setShipper] = useState(SAMPLE_SHIPPERS[0]);
  const [species, setSpecies] = useState(SAMPLE_SPECIES[0]);
  const [unit, setUnit] = useState("kg");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const first = useRef<HTMLSelectElement>(null);

  function pickProvisional(id: string) {
    setLotId(id);
    const lot = data?.lots.find((l) => l.id === id);
    if (lot) {
      setShipper(lot.shipper_name);
      setSpecies(lot.species);
      setQty(String(lot.qty_received ?? ""));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await apiRequest<{ id: string }>("/api/lots", {
      method: "POST", body: { lotId: lotId || undefined, shipperName: shipper, species, unit, qty: Number(qty) },
    });
    setMessage(res.ok ? { error: false, text: "本登録しました" } : { error: true, text: res.message });
    if (!res.ok) return;
    setLotId("");
    setQty("");
    reload();
    first.current?.focus();
  }

  const field = { display: "grid", gap: 4 } as const;
  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>ロット本登録（受付台）</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label style={field}>仮受付から選択（任意）
          <select ref={first} value={lotId} onChange={(e) => pickProvisional(e.target.value)}>
            <option value="">新規ロット</option>
            {(data?.lots ?? []).map((l) => <option key={l.id} value={l.id}>{l.lot_no} {l.shipper_name} {l.species}</option>)}
          </select>
        </label>
        <label style={field}>出荷者<select value={shipper} onChange={(e) => setShipper(e.target.value)}>{SAMPLE_SHIPPERS.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label style={field}>品目<select value={species} onChange={(e) => setSpecies(e.target.value)}>{SAMPLE_SPECIES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label style={field}>単位<select value={unit} onChange={(e) => setUnit(e.target.value)}>{["kg", "尾", "箱", "ケース"].map((u) => <option key={u}>{u}</option>)}</select></label>
        <label style={field}>数量（確定）<input required inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
        {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
        <button type="submit" className="button-primary">本登録（Enter）</button>
      </form>
      <ScreenIdFooter screenId="SC-03-01" trace="FT-03-01 / FR-LOT-01, FORM-LOT-01, BR-LOT-02" />
    </section>
  );
}
