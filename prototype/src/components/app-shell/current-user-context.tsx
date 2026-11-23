"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/auth/app-role-types";

type CurrentUserState =
  | { status: "loading" }
  | { status: "ready"; user: CurrentUser }
  | { status: "error"; message: string };

const CurrentUserContext = createContext<CurrentUserState>({ status: "loading" });

// Loads the signed-in user once from GET /api/me (client → API route → Supabase).
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<CurrentUserState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          if (res.status === 401) router.replace("/login");
          setState({ status: "error", message: body?.error?.message ?? "読み込みに失敗しました" });
          return;
        }
        setState({ status: "ready", user: body.user as CurrentUser });
      } catch {
        if (!cancelled) setState({ status: "error", message: "サーバーに接続できません" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return <CurrentUserContext.Provider value={state}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserState {
  return useContext(CurrentUserContext);
}
