"use client";

// Large on-screen number pad for shared tablets / gloves (利用者切替, 仮受付, 引渡し).
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"];

export function TabletNumericPad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="numeric-pad">
      {KEYS.map((k) => (
        <button key={k} type="button" onClick={() => onKey(k)}>{k}</button>
      ))}
    </div>
  );
}
