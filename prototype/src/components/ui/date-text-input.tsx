"use client";

import { useState } from "react";

// Date field shown and typed as YYYY/MM/DD on every screen (browser date pickers follow the OS locale
// and showed mm/dd/yyyy). Accepts "/" or "-"; reports an ISO date (YYYY-MM-DD) or "" when cleared.
export function toIsoDate(text: string): string | null {
  const m = text.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso ? iso : null;
}

export function DateTextInput({ value, onChange, id, label, required, width = 140 }: {
  value: string; onChange: (iso: string) => void; id?: string; label?: string; required?: boolean; width?: number;
}) {
  const [text, setText] = useState(value ? value.replaceAll("-", "/") : "");
  const invalid = text.trim() !== "" && toIsoDate(text) === null;

  function handle(next: string) {
    setText(next);
    if (next.trim() === "") return onChange("");
    const iso = toIsoDate(next);
    if (iso) onChange(iso);
  }

  return (
    <input
      id={id}
      aria-label={label}
      aria-invalid={invalid || undefined}
      required={required}
      inputMode="numeric"
      placeholder="YYYY/MM/DD"
      value={text}
      onChange={(e) => handle(e.target.value)}
      style={{ width, borderColor: invalid ? "var(--danger)" : undefined }}
    />
  );
}
