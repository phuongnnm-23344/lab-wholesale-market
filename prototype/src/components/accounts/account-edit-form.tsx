"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import { InfoAlert } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { APP_ROLES, AUTHORITIES, AUTHORITY_LABELS, ROLE_LABELS, type AppRole, type Authority } from "@/lib/auth/app-role-types";
import { apiRequest } from "@/lib/http/api-client";
import type { AccountRow } from "@/lib/services/account-admin-service";

// Create (account = undefined) or edit one account. Demo accounts are read-only (409 on server).
export function AccountEditForm({ account, onSaved, onCancel }: { account?: AccountRow; onSaved: () => void; onCancel: () => void }) {
  const { showToast } = useToast();
  const [employeeNo, setEmployeeNo] = useState(account?.employeeNo ?? "");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [role, setRole] = useState<AppRole>((account?.role as AppRole) ?? "INTAKE");
  const [authorities, setAuthorities] = useState<Authority[]>((account?.authorities as Authority[]) ?? []);
  const [isActive, setIsActive] = useState(account?.isActive ?? true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
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
    if (!res.ok) return showToast(res.message, "error");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit}>
      {locked && <InfoAlert>デモアカウントのため変更できません。</InfoAlert>}
      <div className="form-grid">
        {!account && <FormField label="メールアドレス" required htmlFor="a-mail"><input id="a-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>}
        {!account && <FormField label="初期パスワード" required htmlFor="a-pw" hint="12文字以上"><input id="a-pw" type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField>}
        <FormField label="社員番号" required htmlFor="a-no"><input id="a-no" required value={employeeNo} disabled={locked} onChange={(e) => setEmployeeNo(e.target.value.toUpperCase())} /></FormField>
        <FormField label="氏名" required htmlFor="a-name"><input id="a-name" required value={displayName} disabled={locked} onChange={(e) => setDisplayName(e.target.value)} /></FormField>
        <FormField label="ロール" required htmlFor="a-role">
          <select id="a-role" value={role} disabled={locked} onChange={(e) => setRole(e.target.value as AppRole)}>
            {APP_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </FormField>
        <FormField label="付与する権限">
          <div className="page-actions">
            {AUTHORITIES.map((a) => (
              <label key={a}><input type="checkbox" checked={authorities.includes(a)} disabled={locked} onChange={() => toggle(a)} /> {AUTHORITY_LABELS[a]}</label>
            ))}
          </div>
        </FormField>
        {account && (
          <FormField label="利用状態">
            <label><input type="checkbox" checked={isActive} disabled={locked} onChange={(e) => setIsActive(e.target.checked)} /> 利用可能（外すと停止・ログイン不可）</label>
          </FormField>
        )}
        {account && (
          <FormField label="PIN 再設定" htmlFor="a-pin" hint="4桁・現場ロールのみ。空欄なら変更しません">
            <input id="a-pin" inputMode="numeric" pattern="\d{4}" value={pin} disabled={locked} onChange={(e) => setPin(e.target.value)} />
          </FormField>
        )}
      </div>
      <div className="form-actions">
        {!locked && <button type="submit" className="button-primary">{account ? "変更を保存する" : "発行する"}</button>}
        <button type="button" className="button-secondary" onClick={onCancel}>{locked ? "閉じる" : "キャンセル"}</button>
      </div>
    </form>
  );
}
