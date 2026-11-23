import type { ReactNode } from "react";

// One row of a 2-column label / input form (.form-grid). `required` adds the 「必須」 badge;
// `error` is shown in red right under the input it concerns.
export function FormField({ label, required, hint, htmlFor, error, children }: {
  label: string; required?: boolean; hint?: ReactNode; htmlFor?: string; error?: string | null; children: ReactNode;
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
        {error && <span className="field-error" role="alert">{error}</span>}
      </div>
    </>
  );
}
