"use client";

import { forwardRef } from "react";

/** FR-FORM-02 error summary. Receives focus on a failed submit. */
export const ErrorSummary = forwardRef<
  HTMLDivElement,
  { title: string; errors: { id: string; text: string }[]; formError?: string }
>(function ErrorSummary({ title, errors, formError }, ref) {
  if (!errors.length && !formError) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-md border border-danger/40 bg-[color-mix(in_oklch,var(--danger)_8%,transparent)] p-4 text-body-sm outline-none focus-visible:ring-2 focus-visible:ring-danger"
    >
      {formError ? (
        <p className="font-medium text-danger">{formError}</p>
      ) : (
        <>
          <p className="font-semibold text-danger">{title}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((e) => (
              <li key={e.id}>
                <a
                  href={`#${e.id}`}
                  className="text-fg underline underline-offset-4 hover:text-danger"
                >
                  {e.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
});
