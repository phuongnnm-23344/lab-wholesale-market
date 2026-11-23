// Browser-side helper: every screen reads / writes business data through /api/* only.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

export async function apiRequest<T>(path: string, init?: { method?: string; body?: unknown }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, message: json?.error?.message ?? `エラー（${res.status}）` };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, status: 0, message: "サーバーに接続できません" };
  }
}
