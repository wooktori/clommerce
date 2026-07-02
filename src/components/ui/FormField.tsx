import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export default function FormField({ label, error, htmlFor, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-2xs font-semibold tracking-[0.12em] uppercase text-ink-muted"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-2xs text-danger">{error}</p>}
    </div>
  );
}
