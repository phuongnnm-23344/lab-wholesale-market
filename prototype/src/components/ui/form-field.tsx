import type { ReactNode } from "react";

// One row of a 2-column label / input form (.form-grid). `required` adds the 「必須」 badge.
export function FormField({ label, required, hint, htmlFor, children }: {
  label: string; required?: boolean; hint?: string; htmlFor?: string; children: ReactNode;
}) {
  return (
    <>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="badge-required">必須</span>}
      </label>
      <div className="form-control">
        {children}
        {hint && <span className="form-hint">{hint}</span>}
      </div>
    </>
  );
}
