"use client";

import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { apiRequest } from "@/lib/http/api-client";
import { SAMPLE_SHIPPERS, SAMPLE_SPECIES, type LotListResponse } from "@/lib/lots/lot-types";

const big = { minHeight: 56, fontSize: 20, padding: "8px 12px", borderRadius: 8 } as const;

// SC-03-02 ロット仮受付（埠頭・タブレット）: 3 fields, large buttons, ONLINE ONLY (offline save = mock M04).
export default function ProvisionalIntakePage() {
  const [shipper, setShipper] = useState(SAMPLE_SHIPPERS[0]);
  const [species, setSpecies] = useState(SAMPLE_SPECIES[0]);
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const { data, reload } = useApiResource<LotListResponse>("/api/lots?status=PROVISIONAL");

  async function submit() {
    const res = await apiRequest<{ id: string }>("/api/lots/provisional", {
      method: "POST", body: { shipperName: shipper, species, qtyEstimate: Number(qty) },
    });
    setMessage(res.ok ? { error: false, text: "仮受付しました" } : { error: true, text: res.message });
    if (res.ok) {
      setQty("");
      reload();
    }
  }

  return (
    <section className="card" style={{ display: "grid", gap: 12, maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>ロット仮受付（埠頭）</h1>
      <p className="muted" style={{ margin: 0 }}>オンライン時のみ。通信断中の一時保存は試作対象外です。</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SAMPLE_SHIPPERS.map((s) => (
          <button key={s} type="button" style={{ ...big, background: s === shipper ? "var(--primary)" : undefined, color: s === shipper ? "#fff" : undefined }} onClick={() => setShipper(s)}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SAMPLE_SPECIES.map((s) => (
          <button key={s} type="button" style={{ ...big, background: s === species ? "var(--primary)" : undefined, color: s === species ? "#fff" : undefined }} onClick={() => setSpecies(s)}>{s}</button>
        ))}
      </div>
      <label style={{ fontSize: 20 }}>数量（目安・kg）
        <input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))} style={{ ...big, width: 200, marginLeft: 8 }} />
      </label>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <button type="button" className="button-primary" style={big} disabled={!(Number(qty) > 0)} onClick={submit}>仮受付する</button>
      <h2 style={{ fontSize: 18, marginBottom: 0 }}>本日の仮受付（本登録待ち）</h2>
      <ul>{(data?.lots ?? []).map((l) => <li key={l.id}>{l.lot_no} {l.shipper_name} {l.species} 約{l.qty_received}kg</li>)}</ul>
      <ScreenIdFooter screenId="SC-03-02" trace="FT-03-01 / FR-LOT-01, FORM-LOT-01（オフライン・証憑撮影は試作対象外）" />
    </section>
  );
}
