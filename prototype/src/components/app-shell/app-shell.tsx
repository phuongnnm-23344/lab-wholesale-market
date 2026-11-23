"use client";

import type { ReactNode } from "react";
import { SampleDataBanner } from "@/components/common/sample-data-banner";
import { AppHeader } from "./app-header";
import { CurrentUserProvider, useCurrentUser } from "./current-user-context";
import { SideNavigation } from "./side-navigation";
import { SignOutButton } from "./sign-out-button";

function ShellBody({ children }: { children: ReactNode }) {
  const state = useCurrentUser();
  const user = state.status === "ready" ? state.user : null;

  return (
    <>
      <SampleDataBanner />
      <AppHeader user={user} />
      {state.status === "loading" && <p style={{ padding: 16 }}>読み込み中…</p>}
      {state.status === "error" && (
        <div style={{ padding: 16 }}>
          <p className="error-text" role="alert">{state.message}</p>
          <SignOutButton />
        </div>
      )}
      {user && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 240px) 1fr", gap: 16, padding: 16 }}>
          <aside className="card">
            <SideNavigation user={user} />
          </aside>
          <main>{children}</main>
        </div>
      )}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <ShellBody>{children}</ShellBody>
    </CurrentUserProvider>
  );
}
