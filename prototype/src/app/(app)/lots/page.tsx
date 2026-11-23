"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";
import { formatDate, formatNumber } from "@/lib/format/display-format";
import { LOT_STATUS_TONES, type LotListResponse } from "@/lib/lots/lot-types";
import { LOT_STATUS_LABELS } from "@/lib/validators/lot-and-trade-schemas";

// ロット一覧・検索 + 一括販売公開 (only 下見済 lots can be selected).
export default function LotListPage() {
  const state = useCurrentUser();
  const { showToast } = useToast();
  const canPublish = state.status === "ready" && ["INTAKE", "JUDGE"].includes(state.user.role);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data, error, reload } = useApiResource<LotListResponse>(`/api/lots${status ? `?status=${status}` : ""}`);
  const lots = data?.lots ?? [];

  async function publish() {
    const res = await apiRequest<{ count: number }>("/api/lots/publish", { method: "POST", body: { lotIds: selected } });
    if (!res.ok) return showToast(res.message, "error");
    showToast(`${res.data.count}件を販売公開しました`);
    setSelected([]);
    reload();
  }

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const actions = canPublish
    ? <button type="button" className="button-primary" disabled={selected.length === 0} onClick={publish}>選択したロットを販売公開（{selected.length}件）</button>
    : undefined;
  return (
    <>
      <PageHeader title="ロット一覧" actions={actions} />
      <div className="toolbar">
        <label>状態{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">すべて</option>
            {Object.entries(LOT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <span className="muted">業務日：{formatDate(data?.date)}</span>
        {canPublish && <span className="muted" style={{ fontSize: 13 }}>販売公開できるのは「下見済」のロットです。</span>}
      </div>
      <ListStates loading={!data} error={error} empty={lots.length === 0} emptyText="該当するロットはありません。">
        <table>
          <thead><tr>{canPublish && <th style={{ width: 40 }} />}<th>ロット番号</th><th>出荷者</th><th>品目</th><th className="num">残数量</th><th>状態</th></tr></thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id}>
                {canPublish && <td>{l.status === "INSPECTED" && <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} aria-label={`${l.lot_no}を選択`} />}</td>}
                <td><Link href={`/lots/${l.id}`}>{l.lot_no}</Link></td>
                <td>{l.shipper_name}</td><td>{l.species}</td>
                <td className="num">{formatNumber(l.available_qty)} {l.unit}</td>
                <td><StatusBadge tone={LOT_STATUS_TONES[l.status]}>{LOT_STATUS_LABELS[l.status] ?? l.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-row"><span>{lots.length} 件</span></div>
      </ListStates>
    </>
  );
}
