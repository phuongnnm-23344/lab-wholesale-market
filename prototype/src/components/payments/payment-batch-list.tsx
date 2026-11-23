"use client";

import { useState } from "react";
import { useApiResource } from "@/components/common/use-api-resource";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import { formatDateTime } from "@/lib/format/display-format";

type Batch = {
  id: string; file_name: string; row_count: number; imported_by: string | null; imported_at: string;
  payment_batch_voids: { reason: string; voided_by: string | null; created_at: string }[];
};

// Recent import batches. A wrong batch is cancelled (取消) by an append-only void record — by a 照合部門長
// other than the importer, only while no period using it is locked (rule 4: nothing is overwritten).
export function PaymentBatchList({ reloadKey }: { reloadKey: number }) {
  const { data, reload } = useApiResource<{ batches: Batch[]; staff: Record<string, string>; me: CurrentUser }>(`/api/payments/batches?k=${reloadKey}`);
  const { showToast } = useToast();
  const [reason, setReason] = useState<Record<string, string>>({});
  const isHead = data?.me.authorities.includes("STL_HEAD") ?? false;
  const batches = data?.batches ?? [];

  async function voidBatch(id: string) {
    const res = await apiRequest(`/api/payments/batches/${id}/void`, { method: "POST", body: { reason: reason[id] ?? "" } });
    if (!res.ok) return showToast(res.message, "error");
    showToast("取込を取り消しました（記録は残ります）");
    reload();
  }

  return (
    <>
      <h2>取込履歴</h2>
      {batches.length === 0 ? <EmptyState text="取込履歴はありません。" /> : (
        <table>
          <thead><tr><th>取込日時</th><th>ファイル名</th><th className="num">行数</th><th>取込者</th><th>状態・操作</th></tr></thead>
          <tbody>{batches.map((b) => {
            const voided = b.payment_batch_voids?.[0];
            return (
              <tr key={b.id}>
                <td>{formatDateTime(b.imported_at)}</td><td>{b.file_name}</td><td className="num">{b.row_count}</td>
                <td>{b.imported_by ? data?.staff[b.imported_by] : "—"}</td>
                <td>
                  {voided ? <><StatusBadge tone="neutral">取消済</StatusBadge> <span className="muted">{voided.reason}</span></> : isHead ? (
                    <span className="page-actions">
                      <input placeholder="取消理由" aria-label="取消理由" value={reason[b.id] ?? ""} onChange={(e) => setReason((r) => ({ ...r, [b.id]: e.target.value }))} />
                      <ConfirmButton label="取消" disabled={!reason[b.id]?.trim()} message={`「${b.file_name}」の取込を取り消します。よろしいですか？`} confirmLabel="取り消す" onConfirm={() => voidBatch(b.id)} />
                    </span>
                  ) : <StatusBadge tone="success">有効</StatusBadge>}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </>
  );
}
