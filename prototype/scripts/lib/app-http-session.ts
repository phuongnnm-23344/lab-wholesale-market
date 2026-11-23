// Logged-in HTTP session against the running Next.js app (APP_BASE_URL), for route-level checks.
// Signs in exactly like @supabase/ssr does in the browser and keeps the auth cookies in memory.

import { createServerClient } from "@supabase/ssr";
import { requireEnv } from "./script-supabase-clients";

export class AppHttpSession {
  private jar = new Map<string, string>();

  static async signIn(email: string, password: string): Promise<AppHttpSession> {
    const session = new AppHttpSession();
    const client = createServerClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      {
        cookies: {
          getAll: () => [...session.jar].map(([name, value]) => ({ name, value })),
          setAll: (list) => list.forEach(({ name, value }) => session.store(name, value)),
        },
      },
    );
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`sign-in ${email}: ${error.message}`);
    return session;
  }

  static anonymous(): AppHttpSession {
    return new AppHttpSession();
  }

  private store(name: string, value: string) {
    if (value) this.jar.set(name, value);
    else this.jar.delete(name);
  }

  async request(path: string, init?: { method?: string; body?: unknown }) {
    const res = await fetch(`${requireEnv("APP_BASE_URL")}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        cookie: [...this.jar].map(([n, v]) => `${n}=${v}`).join("; "),
        ...(init?.body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      redirect: "manual",
    });
    // Keep cookies the server rotates (session refresh, PIN switch).
    for (const header of res.headers.getSetCookie()) {
      const [pair, ...attrs] = header.split(";");
      const eq = pair.indexOf("=");
      const expired = attrs.some((a) => /max-age=0/i.test(a.trim()));
      this.store(pair.slice(0, eq).trim(), expired ? "" : pair.slice(eq + 1).trim());
    }
    const text = await res.text();
    return { status: res.status, text, json: (() => { try { return JSON.parse(text); } catch { return null; } })() };
  }
}
