"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; text: string };
type ToastApi = {
  showToast: (text: string, kind?: ToastKind) => void;
  // Success after a save: keep the message across the navigation, then go to the next screen.
  toastAndGo: (text: string, href: string) => void;
};

const PENDING_KEY = "pending-toast";
const ToastContext = createContext<ToastApi | null>(null);

// For a full page reload (window.location): the provider shows the message after the reload.
export function savePendingToast(text: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, text);
  } catch {
    // storage blocked: the message is skipped, the navigation still happens
  }
}

function takePendingToast(): string | null {
  try {
    const text = sessionStorage.getItem(PENDING_KEY);
    if (text) sessionStorage.removeItem(PENDING_KEY);
    return text;
  } catch {
    return null;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((text: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, kind, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === "error" ? 5000 : 3000);
  }, []);

  const toastAndGo = useCallback((text: string, href: string) => {
    savePendingToast(text);
    router.push(href);
  }, [router]);

  // Pick up a message saved before a navigation (runs after every render; cheap read).
  useEffect(() => {
    const pending = takePendingToast();
    if (pending) queueMicrotask(() => showToast(pending));
  });

  return (
    <ToastContext.Provider value={{ showToast, toastAndGo }}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside ToastProvider");
  return api;
}
