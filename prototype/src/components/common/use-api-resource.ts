"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/http/api-client";

// GET a JSON resource from /api/* and keep it in state. `reload()` re-fetches.
// State is only set after the request resolves (no synchronous setState inside the effect).
export function useApiResource<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string | null }>({ data: null, error: null });

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    (async () => {
      const res = await apiRequest<T>(path);
      if (cancelled) return;
      setState(res.ok ? { data: res.data, error: null } : { data: null, error: res.message });
    })();
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
