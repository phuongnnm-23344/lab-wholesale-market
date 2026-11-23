"use client";

import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatNumber } from "@/lib/format/display-format";
import { SAMPLE_SHIPPERS, SAMPLE_SPECIES, type LotListResponse } from "@/lib/lots/lot-types";
import { useState } from "react";

// ロット仮受付（埠頭・タブレット）: 3 inputs with large buttons, online only. Continuous entry:
// after saving, the toast confirms and the list below refreshes on the same screen.
export default function ProvisionalIntakePage() {
  const { showToast } = useToast();
  const [shipper, setShipper] = useState(SAMPLE_SHIPPERS[0]);
  const [species, setSpecies] = useState(SAMPLE_SPECIES[0]);
  const [qty, setQty] = useState("");
  const { data, reload } = useApiResource<LotListResponse>("/api/lots?status=PROVISIONAL");
  const lots = data?.lots ?? [];

  async function submit() {
    const res = await apiRequest<{ id: string }>("/api/lots/provisional", {
      method: "POST", body: { shipperName: shipper, species, qtyEstimate: Number(qty) },
    });
    if (!res.ok) return showToast(res.message, "error");
    showToast(`仮受付しました：${shipper} ${species}`);
    setQty("");
    reload();
  }

  const choice = (value: string, current: string, set: (v: string) => void) => (
    <button key={value} type="button" className={`button-large ${value === current ? "button-primary" : "button-secondary"}`} onClick={() => set(value)}>{value}</button>
  );
  return (
    <div className="tablet-screen" style={{ maxWidth: 760 }}>
      <PageHeader title="ロット仮受付" />
      <p className="muted">埠頭のタブレット用画面です（通信できる場合のみ登録できます）。</p>
      <h2>出荷者</h2>
      <div className="page-actions">{SAMPLE_SHIPPERS.map((s) => choice(s, shipper, setShipper))}</div>
      <h2>品目</h2>
      <div className="page-actions">{SAMPLE_SPECIES.map((s) => choice(s, species, setSpecies))}</div>
      <h2>数量（目安・kg）</h2>
      <input inputMode="decimal" aria-label="数量（目安・kg）" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))} style={{ width: 220 }} />
      <div className="form-actions">
        <button type="button" className="button-primary button-large" disabled={!(Number(qty) > 0)} onClick={submit}>仮受付する</button>
      </div>
      <h2>本日の仮受付（本登録待ち）</h2>
      {lots.length === 0 ? <EmptyState text="本登録待ちのロットはありません。" /> : (
        <table>
          <thead><tr><th>ロット番号</th><th>出荷者</th><th>品目</th><th className="num">数量（目安）</th></tr></thead>
          <tbody>{lots.map((l) => (
            <tr key={l.id}><td>{l.lot_no}</td><td>{l.shipper_name}</td><td>{l.species}</td><td className="num">約 {formatNumber(l.qty_received)} kg</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
