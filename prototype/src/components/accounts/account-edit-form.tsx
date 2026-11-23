"use client";

import { useState, type FormEvent } from "react";
import { APP_ROLES, AUTHORITIES, AUTHORITY_LABELS, ROLE_LABELS, type AppRole, type Authority } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import type { AccountRow } from "@/lib/services/account-admin-service";

// SC-02-03 create (account = undefined) or edit one account. Demo accounts are read-only (409 on server).
export function AccountEditForm({ account, onSaved }: { account?: AccountRow; onSaved: () => void }) {
  const [employeeNo, setEmployeeNo] = useState(account?.employeeNo ?? "");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [role, setRole] = useState<AppRole>((account?.role as AppRole) ?? "INTAKE");
  const [authorities, setAuthorities] = useState<Authority[]>((account?.authorities as Authority[]) ?? []);
  const [isActive, setIsActive] = useState(account?.isActive ?? true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const locked = Boolean(account?.isDemoProtected);

  function toggle(a: Authority) {
    setAuthorities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const profile = { employeeNo, displayName, role, authorities };
    const res = account
      ? await apiRequest(`/api/accounts/${account.userId}`, { method: "PATCH", body: { ...profile, isActive, pin } })
      : await apiRequest("/api/accounts", { method: "POST", body: { ...profile, email, initialPassword: password } });
    if (!res.ok) return setMessage({ error: true, text: res.message });
    setMessage({ error: false, text: "保存しました" });
    setPin("");
    onSaved();
  }

  const field = { display: "grid", gap: 4 } as const;
  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 440 }}>
      {locked && <p className="muted">デモアカウントのため変更できません。</p>}
      {!account && <label style={field}>メールアドレス<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>}
      {!account && <label style={field}>初期パスワード（12文字以上）<input type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} /></label>}
      <label style={field}>社員番号<input required value={employeeNo} disabled={locked} onChange={(e) => setEmployeeNo(e.target.value.toUpperCase())} /></label>
      <label style={field}>氏名<input required value={displayName} disabled={locked} onChange={(e) => setDisplayName(e.target.value)} /></label>
      <label style={field}>ロール
        <select value={role} disabled={locked} onChange={(e) => setRole(e.target.value as AppRole)}>
          {APP_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </label>
      <fieldset disabled={locked}><legend>付与する権限</legend>
        {AUTHORITIES.map((a) => (
          <label key={a} style={{ marginRight: 12 }}>
            <input type="checkbox" checked={authorities.includes(a)} onChange={() => toggle(a)} /> {AUTHORITY_LABELS[a]}
          </label>
        ))}
      </fieldset>
      {account && <label><input type="checkbox" checked={isActive} disabled={locked} onChange={(e) => setIsActive(e.target.checked)} /> 利用可能（外すと停止・ログイン不可）</label>}
      {account && <label style={field}>PIN 再設定（4桁・現場ロールのみ。空欄なら変更なし）
        <input inputMode="numeric" pattern="\d{4}" value={pin} disabled={locked} onChange={(e) => setPin(e.target.value)} /></label>}
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>多要素認証（MFA）は試作では省略しています。</p>
      {message && <p className={message.error ? "error-text" : undefined} role="status">{message.text}</p>}
      {!locked && <button type="submit" className="button-primary">{account ? "変更を保存" : "アカウント発行"}</button>}
    </form>
  );
}
