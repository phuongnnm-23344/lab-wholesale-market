"use client";

// Large on-screen number pad (buttons ≥ 64px) for shared tablets / gloves. Reused by SC-00-02,
// later SC-03-02 and SC-06-02.
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"];

export function TabletNumericPad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 8 }}>
      {KEYS.map((k) => (
        <button key={k} type="button" onClick={() => onKey(k)}
          style={{ height: 64, fontSize: 24, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
          {k}
        </button>
      ))}
    </div>
  );
}
