"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { SAMPLE_SHIPPERS, SAMPLE_SPECIES, type LotListResponse } from "@/lib/lots/lot-types";

// ロット本登録（受付台・PC）: complete a 仮受付 lot or register a new one. Writes the 受入 ledger row.
// Continuous entry (DEC-033): after saving the form stays open and is cleared, the 仮受付 list refreshes,
// focus returns to the first field; the toast links to the lot just registered. Error → toast, input kept.
export default function LotRegistrationPage() {
  const { data, reload } = useApiResource<LotListResponse>("/api/lots?status=PROVISIONAL");
  const { showToast } = useToast();
  const [lotId, setLotId] = useState("");
  const [shipper, setShipper] = useState(SAMPLE_SHIPPERS[0]);
  const [species, setSpecies] = useState(SAMPLE_SPECIES[0]);
  const [unit, setUnit] = useState("kg");
  const [qty, setQty] = useState("");

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
    if (!res.ok) return showToast(res.message, "error");
    showToast(`本登録しました：${shipper}／${species} ${qty}${unit}`, "success", { href: `/lots/${res.data.id}`, label: "詳細を見る" });
    setLotId("");
    setQty("");
    reload();
    document.getElementById("f-prov")?.focus();
  }

  return (
    <>
      <PageHeader title="ロット本登録" actions={<Link href="/lots" className="button-secondary">ロット一覧</Link>} />
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="仮受付から選択" htmlFor="f-prov" hint="新しいロットの場合は「新規ロット」のまま">
            <select id="f-prov" autoFocus value={lotId} onChange={(e) => pickProvisional(e.target.value)}>
              <option value="">新規ロット</option>
              {(data?.lots ?? []).map((l) => <option key={l.id} value={l.id}>{l.lot_no} {l.shipper_name} {l.species}</option>)}
            </select>
          </FormField>
          <FormField label="出荷者" required htmlFor="f-shipper">
            <select id="f-shipper" value={shipper} onChange={(e) => setShipper(e.target.value)}>{SAMPLE_SHIPPERS.map((s) => <option key={s}>{s}</option>)}</select>
          </FormField>
          <FormField label="品目" required htmlFor="f-species">
            <select id="f-species" value={species} onChange={(e) => setSpecies(e.target.value)}>{SAMPLE_SPECIES.map((s) => <option key={s}>{s}</option>)}</select>
          </FormField>
          <FormField label="単位" required htmlFor="f-unit">
            <select id="f-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>{["kg", "尾", "箱", "ケース"].map((u) => <option key={u}>{u}</option>)}</select>
          </FormField>
          <FormField label="数量（確定）" required htmlFor="f-qty">
            <input id="f-qty" required inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="submit" className="button-primary">本登録する（Enter）</button>
          <Link href="/lots" className="button-secondary">キャンセル</Link>
        </div>
      </form>
    </>
  );
}
