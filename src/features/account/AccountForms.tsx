"use client";

import { useActionState } from "react";
import {
  memberForgot,
  memberLogin,
  memberRegister,
  memberReset,
  saveMemberProfile,
  type AccountState,
} from "./actions";

export type AccountCopy = Record<string, string>;

export const inputCls =
  "h-11 w-full rounded-lg border border-strong bg-surface px-3 text-body-sm text-fg outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-primary)_16%,transparent)]";
const btnCls =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent-spark)] px-8 font-semibold text-[var(--ub-navy-900)] transition-[translate,opacity] hover:-translate-y-0.5 disabled:opacity-70";

function ErrorBox({ state, copy }: { state: AccountState; copy: AccountCopy }) {
  if (!state?.error) return null;
  const [key, ...rest] = state.error.split(":");
  const text = key === "password" ? rest.join(":") : (copy[key!] ?? copy.wrong);
  return (
    <p
      role="alert"
      className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-4 py-3 text-body-sm text-danger"
    >
      {text}
    </p>
  );
}

function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-body-sm font-medium">
      {label}
      <input {...props} className={inputCls} />
      {hint && <span className="text-[0.8125rem] font-normal text-fg-muted">{hint}</span>}
    </label>
  );
}

export function MemberLoginForm({
  copy,
  locale,
  next,
}: {
  copy: AccountCopy;
  locale: string;
  next?: string;
}) {
  const [state, action, pending] = useActionState(memberLogin, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next ?? ""} />
      <ErrorBox state={state} copy={copy} />
      <Field
        label={copy.email!}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.email}
      />
      <Field
        label={copy.password!}
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "…" : copy.loginSubmit}
      </button>
    </form>
  );
}

export function MemberRegisterForm({
  copy,
  locale,
  next,
}: {
  copy: AccountCopy;
  locale: string;
  next?: string;
}) {
  const [state, action, pending] = useActionState(memberRegister, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next ?? ""} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <ErrorBox state={state} copy={copy} />
      <Field
        label={copy.name!}
        name="name"
        autoComplete="name"
        required
        defaultValue={state?.values?.name}
      />
      <Field
        label={copy.email!}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state?.values?.email}
      />
      <Field
        label={copy.phone!}
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={state?.values?.phone}
      />
      <Field
        label={copy.password!}
        hint={copy.passwordHint}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={12}
        required
      />
      <label className="flex items-center gap-2.5 text-body-sm">
        <input
          type="checkbox"
          name="newsletter"
          className="size-4 accent-[var(--accent-primary)]"
        />
        {copy.newsletter}
      </label>
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "…" : copy.registerSubmit}
      </button>
    </form>
  );
}

export function MemberForgotForm({ copy, locale }: { copy: AccountCopy; locale: string }) {
  const [state, action, pending] = useActionState(memberForgot, null);
  if (state?.ok)
    return (
      <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-body-sm text-accent">
        {copy.resetSent!.replace("{email}", state.email ?? "")}
      </p>
    );
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <ErrorBox state={state} copy={copy} />
      <Field label={copy.email!} name="email" type="email" autoComplete="email" required />
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "…" : copy.resetRequestSubmit}
      </button>
    </form>
  );
}

export function MemberResetForm({
  copy,
  locale,
  token,
}: {
  copy: AccountCopy;
  locale: string;
  token: string;
}) {
  const [state, action, pending] = useActionState(memberReset, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <ErrorBox state={state} copy={copy} />
      <Field
        label={copy.password!}
        hint={copy.passwordHint}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={12}
        required
      />
      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "…" : copy.resetSubmit}
      </button>
    </form>
  );
}

export function MemberProfileForm({
  copy,
  member,
}: {
  copy: AccountCopy;
  member: {
    name: string;
    phone?: string | null;
    country?: string | null;
    locale?: string | null;
    newsletter?: boolean | null;
  };
}) {
  const [state, action, pending] = useActionState(saveMemberProfile, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <ErrorBox state={state} copy={copy} />
      </div>
      <Field label={copy.name!} name="name" defaultValue={member.name} required />
      <Field label={copy.phone!} name="phone" type="tel" defaultValue={member.phone ?? ""} />
      <label className="grid gap-1.5 text-body-sm font-medium">
        {copy.language}
        <select name="emailLocale" defaultValue={member.locale ?? "en"} className={inputCls}>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="rw">Ikinyarwanda</option>
        </select>
      </label>
      <label className="flex items-center gap-2.5 self-end pb-3 text-body-sm">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked={Boolean(member.newsletter)}
          className="size-4 accent-[var(--accent-primary)]"
        />
        {copy.newsletter}
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-[var(--accent-primary)] px-6 font-semibold text-white disabled:opacity-70"
        >
          {pending ? "…" : copy.save}
        </button>
        {state?.ok && (
          <span role="status" className="text-body-sm text-success">
            ✓ {copy.saved}
          </span>
        )}
      </div>
    </form>
  );
}
