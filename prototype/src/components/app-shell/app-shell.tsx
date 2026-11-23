"use client";

import type { ReactNode } from "react";
import { SampleDataBanner } from "@/components/common/sample-data-banner";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ErrorAlert, LoadingState } from "@/components/ui/status-states";
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
      {state.status === "loading" && <div className="app-main"><LoadingState /></div>}
      {state.status === "error" && (
        <div className="app-main">
          <ErrorAlert message={state.message} />
          <SignOutButton />
        </div>
      )}
      {user && (
        <div className="app-layout">
          <aside className="app-sidebar">
            <SideNavigation user={user} />
          </aside>
          <main className="app-main">{children}</main>
        </div>
      )}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CurrentUserProvider>
      <ToastProvider>
        <ShellBody>{children}</ShellBody>
      </ToastProvider>
    </CurrentUserProvider>
  );
}
