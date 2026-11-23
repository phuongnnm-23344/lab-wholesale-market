"use client";

import { useState } from "react";
import { AccountEditForm } from "@/components/accounts/account-edit-form";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import { AUTHORITY_LABELS, ROLE_LABELS, type AppRole, type Authority } from "@/lib/auth/app-role-types";
import type { AccountRow } from "@/lib/services/account-admin-service";

// SC-02-03 アカウント一覧・詳細（ロール・権限）— システム管理者 only (API 403 for others).
// SC-02-04 (ロール・権限設定) is merged here (LAB-1 screen list).
export default function AccountAdminPage() {
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const { data, error, reload: load } = useApiResource<{ accounts: AccountRow[] }>("/api/accounts");
  const accounts = data?.accounts ?? [];

  const current = accounts.find((a) => a.userId === selected);
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>アカウント・ロール管理</h1>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button type="button" className="button-secondary" onClick={() => setSelected("new")}>アカウント発行</button>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead><tr><th align="left">社員番号</th><th align="left">氏名</th><th align="left">メール</th><th align="left">ロール</th><th align="left">権限</th><th align="left">PIN</th><th align="left">状態</th></tr></thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.userId} style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setSelected(a.userId)}>
                <td>{a.employeeNo}</td>
                <td>{a.displayName}{a.isDemoProtected ? "（デモ）" : ""}</td>
                <td>{a.email ?? "—"}</td>
                <td>{ROLE_LABELS[a.role as AppRole] ?? a.role}</td>
                <td>{a.authorities.map((x) => AUTHORITY_LABELS[x as Authority] ?? x).join("・") || "—"}</td>
                <td>{a.hasPin ? (a.pinLocked ? "ロック中" : "設定済") : "—"}</td>
                <td>{a.isActive ? "利用中" : "停止"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="card">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>{selected === "new" ? "アカウント発行" : `編集：${current?.displayName ?? ""}`}</h2>
          <AccountEditForm key={selected} account={selected === "new" ? undefined : current} onSaved={load} />
        </div>
      )}
      <ScreenIdFooter screenId="SC-02-03" trace="FT-02-05, FT-02-06 / FR-IAM-01/02, TBL-ROLE-01（SC-02-04 統合）" />
    </section>
  );
}
