"use client";

import { useState } from "react";
import { AccountEditForm } from "@/components/accounts/account-edit-form";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";
import { AUTHORITY_LABELS, ROLE_LABELS, type AppRole, type Authority } from "@/lib/auth/app-role-types";
import type { AccountRow } from "@/lib/services/account-admin-service";

// アカウント一覧・ロール・権限の設定 — システム管理者 only (API 403 for others).
// After saving, the toast confirms, the edit panel closes and the list refreshes.
export default function AccountAdminPage() {
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const { showToast } = useToast();
  const { data, error, reload } = useApiResource<{ accounts: AccountRow[] }>("/api/accounts");
  const accounts = data?.accounts ?? [];
  const current = accounts.find((a) => a.userId === selected);

  function saved() {
    showToast(selected === "new" ? "アカウントを発行しました" : "アカウントを更新しました");
    setSelected(null);
    reload();
  }

  return (
    <>
      <PageHeader title="アカウント・ロール管理" actions={<button type="button" className="button-primary" onClick={() => setSelected("new")}>アカウント発行</button>} />
      <ListStates loading={!data} error={error} empty={accounts.length === 0}>
        <table>
          <thead><tr><th>社員番号</th><th>氏名</th><th>メール</th><th>ロール</th><th>権限</th><th>PIN</th><th>状態</th><th>操作</th></tr></thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.userId}>
                <td>{a.employeeNo}</td>
                <td>{a.displayName} {a.isDemoProtected && <StatusBadge tone="neutral">デモ</StatusBadge>}</td>
                <td>{a.email ?? "—"}</td>
                <td>{ROLE_LABELS[a.role as AppRole] ?? a.role}</td>
                <td>{a.authorities.map((x) => AUTHORITY_LABELS[x as Authority] ?? x).join("・") || "—"}</td>
                <td>{a.hasPin ? (a.pinLocked ? <StatusBadge tone="danger">ロック中</StatusBadge> : "設定済") : "—"}</td>
                <td>{a.isActive ? <StatusBadge tone="success">利用中</StatusBadge> : <StatusBadge tone="neutral">停止</StatusBadge>}</td>
                <td><button type="button" className="button-secondary" onClick={() => setSelected(a.userId)}>{a.isDemoProtected ? "表示" : "編集"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListStates>
      {selected && (
        <>
          <h2>{selected === "new" ? "アカウント発行" : `アカウント編集：${current?.displayName ?? ""}`}</h2>
          <AccountEditForm key={selected} account={selected === "new" ? undefined : current} onSaved={saved} onCancel={() => setSelected(null)} />
        </>
      )}
    </>
  );
}
