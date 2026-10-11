"use client";

import { ArrowRight, Check } from "lucide-react";
import { useActionState } from "react";
import { HONEYPOT_FIELD, initialFormState, type FormState } from "@/lib/forms/types";
import { buttonVariants } from "@/components/ui/button-variants";

/** Footer newsletter sign-up (double opt-in). Plain form: works without JavaScript. */
export function NewsletterForm({
  action,
  locale,
  copy,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  locale: string;
  copy: {
    title: string;
    lead: string;
    label: string;
    submit: string;
    done: string;
    consent: string;
    error: string;
    errors: Record<string, string>;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-2 text-body-sm font-medium text-fg">
        <Check aria-hidden className="size-4 text-success" />
        {copy.done}
      </p>
    );
  }
  return (
    <form action={formAction} className="w-full" noValidate>
      <p className="font-display text-heading-md font-semibold tracking-tight text-fg">
        {copy.title}
      </p>
      <p className="mt-1 text-body-sm text-fg-secondary">{copy.lead}</p>
      {/* One pill: the field and the button share a border, which lights up on focus. */}
      <div className="mt-5 flex items-center gap-1 rounded-[calc(var(--radius-md)+4px)] border border-strong bg-surface p-1 pl-5 transition-[border-color,box-shadow] duration-300 focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-primary)_18%,transparent)]">
        <label className="sr-only" htmlFor="newsletter-email">
          {copy.label}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.label}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent text-fg placeholder:text-fg-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={copy.submit}
          className={buttonVariants()}
        >
          <span className="hidden sm:inline">{copy.submit}</span>
          <ArrowRight aria-hidden data-arrow />
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 pl-1 text-[0.8125rem] text-fg-secondary">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-accent" />
        {copy.consent}
      </label>
      {state.status === "error" && (
        <p role="alert" className="mt-2 pl-1 text-body-sm text-danger">
          {state.fieldErrors
            ? Object.values(state.fieldErrors)
                .map((code) => copy.errors[code.split(":")[0]!] ?? copy.error)
                .join(" ")
            : copy.error}
        </p>
      )}
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden className="absolute -left-[9999px]">
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
    </form>
  );
}
