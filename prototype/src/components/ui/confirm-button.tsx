"use client";

import { useRef, type ReactNode } from "react";

// Button that asks for confirmation in a modal dialog before running `onConfirm`.
// Used for irreversible actions (日次締め, 期ロック, 却下, 取消…).
export function ConfirmButton({ label, message, confirmLabel = "実行する", onConfirm, disabled, danger = true }: {
  label: ReactNode; message: string; confirmLabel?: string;
  onConfirm: () => void | Promise<void>; disabled?: boolean; danger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cls = danger ? "button-danger" : "button-primary";
  return (
    <>
      <button type="button" className={cls} disabled={disabled} onClick={() => dialog.current?.showModal()}>{label}</button>
      <dialog ref={dialog} className="confirm-dialog" aria-label="確認">
        <p>{message}</p>
        <div className="page-actions">
          <button type="button" className="button-secondary" onClick={() => dialog.current?.close()}>キャンセル</button>
          <button
            type="button"
            className={cls}
            onClick={async () => {
              dialog.current?.close();
              await onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
