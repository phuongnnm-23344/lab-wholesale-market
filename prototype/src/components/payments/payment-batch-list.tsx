"use client";

import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";

type Batch = {
  id: string; file_name: string; row_count: number; imported_by: string | null; imported_at: string;
  payment_batch_voids: { reason: string; voided_by: string | null; created_at: string }[];
};

// Recent import batches. A wrong batch is cancelled (取消) by an append-only void record — by a 照合部門長
// other than the importer, only while no period using it is locked (code review C1, rule 4).
export function PaymentBatchList({ reloadKey }: { reloadKey: number }) {
  const { data, reload } = useApiResource<{ batches: Batch[]; staff: Record<string, string>; me: CurrentUser }>(`/api/payments/batches?k=${reloadKey}`);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const isHead = data?.me.authorities.includes("STL_HEAD") ?? false;

  async function voidBatch(id: string) {
    const res = await apiRequest(`/api/payments/batches/${id}/void`, { method: "POST", body: { reason: reason[id] ?? "" } });
    setMessage(res.ok ? { error: false, text: "取消しました（記録は残ります）" } : { error: true, text: res.message });
    if (res.ok) reload();
  }

  return (
    <div>
      <h2 style={{ fontSize: 18 }}>取込履歴</h2>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      <ul style={{ display: "grid", gap: 6, paddingLeft: 18 }}>
        {(data?.batches ?? []).map((b) => {
          const voided = b.payment_batch_voids?.[0];
          return (
            <li key={b.id}>
              {new Date(b.imported_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} {b.file_name}（{b.row_count}行・{b.imported_by ? data?.staff[b.imported_by] : "—"}）
              {voided ? <span className="muted"> — 取消済：{voided.reason}</span> : isHead && (
                <span> <input placeholder="取消理由" value={reason[b.id] ?? ""} onChange={(e) => setReason((r) => ({ ...r, [b.id]: e.target.value }))} />
                  <button type="button" className="button-secondary" disabled={!reason[b.id]?.trim()} onClick={() => voidBatch(b.id)}>取消</button></span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
