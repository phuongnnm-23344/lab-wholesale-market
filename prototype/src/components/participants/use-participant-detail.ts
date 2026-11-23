"use client";

import { useCurrentUser } from "@/components/app-shell/current-user-context";
import { useApiResource } from "@/components/common/use-api-resource";
import type { ParticipantRow } from "@/lib/participants/participant-types";

// Loads one participant (GET /api/participants/[id]) and tells whether the user may edit
// (照合事務局 or 照合部門長 — the API and RPC check again).
export function useParticipantDetail(id: string) {
  const state = useCurrentUser();
  const { data, error, reload } = useApiResource<{ participant: ParticipantRow }>(`/api/participants/${id}`);
  const canEdit = state.status === "ready" &&
    (state.user.role === "SETTLE" || state.user.authorities.includes("STL_HEAD"));
  return { participant: data?.participant ?? null, error, reload, canEdit };
}
