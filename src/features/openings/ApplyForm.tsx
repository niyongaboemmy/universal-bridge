"use client";

import { useActionState, useState } from "react";
import type { OpeningField } from "@/collections/Openings";
import { Turnstile } from "@/components/forms/Turnstile";
import { initialFormState } from "@/lib/forms/types";
import { cn } from "@/lib/utils";
import { applyToOpening } from "./actions";
import { buttonVariants } from "@/components/ui/button-variants";

export type ApplyCopy = {
  name: string;
  email: string;
  phone: string;
  consent: string; // HTML with the privacy link
  submit: string;
  submitting: string;
  optional: string;
  choose: string;
  yes: string;
  fileTypes: string;
  errors: Record<string, string>;
  formErrors: Record<string, string>;
  successTitle: string;
  successBody: string;
  reference: string; // contains {ref}
  track?: string;
};

const input =
  "h-11 w-full rounded-lg border border-strong bg-surface px-3 text-body-sm text-fg outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-primary)_16%,transparent)] aria-[invalid=true]:border-danger";

function message(code: string | undefined, copy: ApplyCopy) {
  if (!code) return null;
  const [key, arg] = code.split(":");
  const m = copy.errors[key!] ?? copy.errors.required!;
  return arg ? m.replace(/\{\w+\}/, arg) : m;
}

function Label({
  f,
  id,
  optional,
}: {
  f: { label: string; required?: boolean | null };
  id: string;
  optional: string;
}) {
  return (
    <label htmlFor={id} className="text-body-sm font-medium">
      {f.label}
      {!f.required && <span className="ml-1 font-normal text-fg-muted">({optional})</span>}
    </label>
  );
}

/** An opening's application form: fixed contact fields + the questions built in the office. */
export function ApplyForm({
  slug,
  locale,
  fields,
  copy,
  member,
  accountHref,
  turnstileSiteKey,
}: {
  turnstileSiteKey?: string;
  slug: string;
  locale: string;
  fields: OpeningField[];
  copy: ApplyCopy;
  member?: { name: string; email: string; phone?: string | null } | null;
  accountHref: string;
}) {
  const [state, action, pending] = useActionState(applyToOpening, initialFormState);
  const [files, setFiles] = useState<Record<string, string>>({});
  const v = (k: string) => {
    const x = state.values?.[k];
    return typeof x === "string" ? x : undefined;
  };
  const err = (k: string) => message(state.fieldErrors?.[k], copy);

  if (state.status === "success")
    return (
      <div
        role="status"
        className="grid justify-items-start gap-3 rounded-xl bg-[color-mix(in_oklab,var(--success)_10%,transparent)] p-6"
      >
        <span className="grid size-12 place-items-center rounded-full bg-success text-2xl text-white">
          ✓
        </span>
        <h2 className="font-display text-heading-lg">{copy.successTitle}</h2>
        <p className="text-body-sm text-fg-secondary">{copy.successBody}</p>
        <p className="font-mono text-body-sm">{copy.reference.replace("{ref}", state.ref ?? "")}</p>
        {member && copy.track && (
          <a
            href={accountHref}
            className="text-body-sm font-semibold text-accent underline underline-offset-4"
          >
            {copy.track}
          </a>
        )}
      </div>
    );

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="opening" value={slug} />
      <input type="hidden" name="locale" value={locale} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      {state.formError && (
        <p
          role="alert"
          className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-4 py-3 text-body-sm text-danger"
        >
          {copy.formErrors[state.formError] ?? copy.formErrors.generic}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label optional={copy.optional} f={{ label: copy.name, required: true }} id="ap-name" />
          <input
            id="ap-name"
            name="name"
            required
            autoComplete="name"
            defaultValue={v("name") ?? member?.name}
            aria-invalid={Boolean(err("name"))}
            className={input}
          />
          {err("name") && <p className="text-[0.8125rem] text-danger">{err("name")}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label optional={copy.optional} f={{ label: copy.email, required: true }} id="ap-email" />
          <input
            id="ap-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={v("email") ?? member?.email}
            aria-invalid={Boolean(err("email"))}
            className={input}
          />
          {err("email") && <p className="text-[0.8125rem] text-danger">{err("email")}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label optional={copy.optional} f={{ label: copy.phone }} id="ap-phone" />
          <input
            id="ap-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={v("phone") ?? member?.phone ?? ""}
            aria-invalid={Boolean(err("phone"))}
            className={input}
          />
          {err("phone") && <p className="text-[0.8125rem] text-danger">{err("phone")}</p>}
        </div>
        {fields.map((f) => {
          const name = `q_${f.key}`;
          const id = `ap-${f.key}`;
          const e = err(name);
          const opts = (f.options ?? "")
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean);
          return (
            <div
              key={f.key}
              className={cn("grid content-start gap-1.5", f.width !== "half" && "sm:col-span-2")}
            >
              {f.type !== "checkbox" && <Label optional={copy.optional} f={f} id={id} />}
              {f.type === "textarea" ? (
                <textarea
                  id={id}
                  name={name}
                  rows={5}
                  required={Boolean(f.required)}
                  defaultValue={v(name)}
                  aria-invalid={Boolean(e)}
                  className={cn(input, "h-auto py-2.5")}
                />
              ) : f.type === "select" ? (
                <select
                  id={id}
                  name={name}
                  required={Boolean(f.required)}
                  defaultValue={v(name) ?? ""}
                  aria-invalid={Boolean(e)}
                  className={input}
                >
                  <option value="">{copy.choose}</option>
                  {opts.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "radio" ? (
                <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <label
                      key={o}
                      className="cursor-pointer rounded-md border border-strong px-3.5 py-1.5 text-body-sm transition-colors has-checked:border-accent has-checked:bg-accent-soft has-checked:text-accent"
                    >
                      <input
                        type="radio"
                        name={name}
                        value={o}
                        defaultChecked={v(name) === o}
                        className="sr-only"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ) : f.type === "checkbox" ? (
                <label className="flex items-start gap-2.5 text-body-sm">
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={v(name) === "on"}
                    className="mt-0.5 size-4 accent-[var(--accent-primary)]"
                  />
                  <span>
                    {f.label}
                    {!f.required && <span className="ml-1 text-fg-muted">({copy.optional})</span>}
                  </span>
                </label>
              ) : f.type === "file" ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-strong px-4 py-3 text-body-sm transition-colors hover:border-accent">
                  <span className="rounded-md bg-accent-soft px-2.5 py-1 font-medium text-accent">
                    ↑
                  </span>
                  <span className="min-w-0 flex-1 truncate text-fg-secondary">
                    {files[name] ?? copy.fileTypes}
                  </span>
                  <input
                    id={id}
                    type="file"
                    name={name}
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(ev) =>
                      setFiles((x) => ({ ...x, [name]: ev.target.files?.[0]?.name ?? "" }))
                    }
                  />
                </label>
              ) : (
                <input
                  id={id}
                  name={name}
                  type={f.type === "number" ? "text" : f.type}
                  inputMode={f.type === "number" ? "decimal" : undefined}
                  required={Boolean(f.required)}
                  defaultValue={v(name)}
                  aria-invalid={Boolean(e)}
                  className={input}
                />
              )}
              {f.help && <p className="text-[0.8125rem] text-fg-muted">{f.help}</p>}
              {e && <p className="text-[0.8125rem] text-danger">{e}</p>}
            </div>
          );
        })}
      </div>
      <label className="flex items-start gap-2.5 text-body-sm">
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 size-4 accent-[var(--accent-primary)]"
        />
        <span dangerouslySetInnerHTML={{ __html: copy.consent }} />
      </label>
      {err("consent") && <p className="-mt-3 text-[0.8125rem] text-danger">{err("consent")}</p>}
      <Turnstile siteKey={turnstileSiteKey} locale={locale} />
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
      >
        {pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
