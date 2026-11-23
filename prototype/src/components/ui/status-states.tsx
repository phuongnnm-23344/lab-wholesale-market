import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function StatusBadge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function LoadingState({ text = "読み込み中…" }: { text?: string }) {
  return <div className="state-box" role="status">{text}</div>;
}

export function EmptyState({ text = "該当するデータはありません。" }: { text?: string }) {
  return <div className="state-box">{text}</div>;
}

export function ErrorAlert({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return <div className="alert alert-error" role="alert">{message}</div>;
}

export function InfoAlert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}

// Loading / error / empty for a list resource; renders children only when there are rows.
export function ListStates({ loading, error, empty, emptyText, children }: {
  loading: boolean; error: string | null | undefined; empty: boolean; emptyText?: string; children: ReactNode;
}) {
  if (error) return <ErrorAlert message={error} />;
  if (loading) return <LoadingState />;
  if (empty) return <EmptyState text={emptyText} />;
  return <>{children}</>;
}
