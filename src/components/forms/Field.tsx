import type { ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

export const inputClass = cn(
  "block w-full rounded-sm border border-strong bg-surface px-3.5 text-fg placeholder:text-fg-muted",
  "transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-standard",
  "hover:border-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-primary-soft)] focus:outline-none",
  "aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--danger)_20%,transparent)]",
  "disabled:opacity-60",
);

/**
 * Label + control + hint + error, wired with aria-describedby (FR-FORM-02).
 * The error slides down; the icon "pops" (UI/UX §11).
 */
export function Field({
  id,
  label,
  required,
  optionalLabel,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-body-sm font-medium text-fg"
      >
        <span>
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          )}
        </span>
        {!required && optionalLabel && (
          <span className="font-normal text-fg-muted">{optionalLabel}</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-body-sm text-fg-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex animate-[reveal_var(--dur-base)_var(--ease-enter)] items-start gap-1.5 text-body-sm font-medium text-danger"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="mt-0.5 size-4 shrink-0"
            fill="currentColor"
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5h1.5v5h-1.5v-5Zm0 6.25h1.5v1.5h-1.5v-1.5Z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, { hint, error }: { hint?: unknown; error?: unknown }) {
  return (
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined
  );
}
