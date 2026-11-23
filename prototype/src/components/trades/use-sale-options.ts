"use client";

import { useApiResource } from "@/components/common/use-api-resource";
import type { LotListResponse } from "@/lib/lots/lot-types";
import type { ParticipantRow } from "@/lib/participants/participant-types";

// Lots on sale today + selectable buyers (仲卸 / 売買参加者, active). Chosen from lists instead of
// typed numbers (customer concern on SC-04-01). Qualification is NOT pre-filtered here on purpose:
// the server checks 許可 / 承認 at confirmation time and explains why it refuses (BR-PERM-01).
export function useSaleOptions() {
  const lots = useApiResource<LotListResponse>("/api/lots?status=PUBLISHED");
  const buyers = useApiResource<{ participants: ParticipantRow[] }>("/api/participants");
  return {
    lots: lots.data?.lots ?? [],
    buyers: (buyers.data?.participants ?? []).filter(
      (p) => (p.kind === "NAKAOROSHI" || p.kind === "BAIBAI") && p.status === "ACTIVE",
    ),
    reloadLots: lots.reload,
    error: lots.error ?? buyers.error,
  };
}
