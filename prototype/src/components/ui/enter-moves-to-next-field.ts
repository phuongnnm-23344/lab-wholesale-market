import type { KeyboardEvent } from "react";

// Form onKeyDown: Enter in a field that has data-next="<id>" moves the focus to that field instead
// of submitting. The last field has no data-next, so Enter there submits the form (counter habit).
export function enterMovesToNextField(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
  const next = (event.target as HTMLElement).dataset?.next;
  if (!next) return;
  event.preventDefault();
  document.getElementById(next)?.focus();
}
