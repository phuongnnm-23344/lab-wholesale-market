"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Email + password sign-in through Supabase Auth. The error message never reveals
// whether the email or the password was wrong.
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("サーバーに接続できません。しばらくしてから再度お試しください");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 4 }}>
        メールアドレス
        <input type="email" autoComplete="username" required value={email}
          onChange={(e) => setEmail(e.target.value)} style={{ padding: 8 }} />
      </label>
      <label style={{ display: "grid", gap: 4 }}>
        パスワード
        <input type="password" autoComplete="current-password" required value={password}
          onChange={(e) => setPassword(e.target.value)} style={{ padding: 8 }} />
      </label>
      {error && <p className="error-text" role="alert" style={{ margin: 0 }}>{error}</p>}
      <button type="submit" className="button-primary" disabled={submitting}>
        {submitting ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
