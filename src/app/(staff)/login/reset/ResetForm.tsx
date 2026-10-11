"use client";

import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Link2Off, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { setStaffPassword, type ResetState } from "@/features/staff-auth/actions";
import { PASSWORD_MIN, passwordProblem } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

const input =
  "peer h-12 w-full rounded-xl border border-strong bg-surface pr-11 pl-11 text-body-sm text-fg transition-[border-color,box-shadow] outline-none placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-primary)_16%,transparent)]";
const iconCls =
  "pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-muted transition-colors peer-focus:text-accent";

/** 0–4 from length and variety; the policy itself is checked on the server. */
function strength(pw: string) {
  if (!pw) return 0;
  let s = pw.length >= PASSWORD_MIN ? 2 : pw.length >= 8 ? 1 : 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((r) => r.test(pw)).length;
  if (kinds >= 3) s++;
  if (pw.length >= 16) s++;
  return Math.min(s, 4);
}
const LABELS = ["Too short", "Weak", "Fair", "Strong", "Very strong"];
const TONES = ["bg-danger", "bg-danger", "bg-[var(--accent-spark)]", "bg-success", "bg-success"];

export function ResetForm({
  token,
  invite,
  account,
}: {
  token: string;
  invite: boolean;
  account: { email: string; name: string } | null;
}) {
  const [state, action, pending] = useActionState<ResetState, FormData>(setStaffPassword, null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state?.error || !card.current) return;
    const el = card.current;
    el.classList.remove("login-shake");
    void el.offsetWidth;
    el.classList.add("login-shake");
  }, [state]);

  if (!account || state?.expired) {
    return (
      <div className="login-in grid justify-items-start gap-5">
        <span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger">
          <Link2Off className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight">
            This link has expired
          </h1>
          <p className="mt-1.5 text-body-sm text-fg-secondary">
            {invite
              ? "Invitation links work once, for 3 days. Ask the person who invited you to send a new one, or request a reset link below."
              : "Password links work once, for one hour. Ask for a new one and use it straight away."}
          </p>
        </div>
        <Link
          href="/login?forgot=1"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0145b8] font-semibold text-white hover:bg-[#0a52cc]"
        >
          Send me a new link
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-secondary hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to sign in
        </Link>
      </div>
    );
  }

  const first = account.name.split(/\s+/)[0] || account.email.split("@")[0] || "";
  const score = strength(pw);
  const problem = pw ? passwordProblem(pw, account) : null;
  const matches = confirm.length > 0 && confirm === pw;
  const checks = [
    { ok: pw.length >= PASSWORD_MIN, text: `At least ${PASSWORD_MIN} characters` },
    { ok: !!pw && !problem, text: "Not common, and not your name or email" },
    { ok: matches, text: "Both passwords match" },
  ];

  return (
    <div ref={card} className="login-in grid gap-6">
      <div>
        <p className="text-[0.75rem] font-semibold tracking-[0.14em] text-accent uppercase">
          {invite ? "Invitation" : "Account security"}
        </p>
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight font-bold tracking-tight">
          {invite ? `Welcome, ${first}` : "Choose a new password"}
        </h1>
        <p className="mt-1 text-body-sm text-fg-secondary">
          {invite
            ? "Set a password to activate your staff account."
            : "Pick something long and memorable. Other sessions will be signed out."}
        </p>
        <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--bg-sunken)] py-1 pr-3 pl-1 text-[0.8125rem]">
          <span className="grid size-6 place-items-center rounded-full bg-[#0145b8] text-[0.6875rem] font-semibold text-white uppercase">
            {first.slice(0, 1)}
          </span>
          <span className="truncate">{account.email}</span>
        </p>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3.5 py-2.5 text-body-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <form action={action} className="grid gap-4" noValidate>
        <input type="hidden" name="token" value={token} />
        {invite && <input type="hidden" name="invite" value="1" />}
        {/* Lets password managers save the new password against the right account. */}
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={account.email}
          readOnly
          hidden
        />
        <div className="grid gap-1.5 text-[0.8125rem] font-medium">
          <label htmlFor="reset-password">New password</label>
          <span className="relative">
            <input
              id="reset-password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              aria-describedby="reset-strength"
              required
              autoFocus
              minLength={PASSWORD_MIN}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={input}
            />
            <Lock className={iconCls} aria-hidden />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-fg-muted hover:bg-[var(--bg-sunken)] hover:text-fg"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
          <span className="mt-1 grid grid-cols-4 gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-[var(--bg-sunken)] transition-colors duration-300",
                  i < score && TONES[score],
                )}
              />
            ))}
          </span>
          <span
            id="reset-strength"
            aria-live="polite"
            className={cn("text-[0.75rem] font-normal", problem ? "text-danger" : "text-fg-muted")}
          >
            {pw ? (problem ?? LABELS[score]) : "A short sentence works well."}
          </span>
        </div>
        <div className="grid gap-1.5 text-[0.8125rem] font-medium">
          <label htmlFor="reset-confirm">Repeat password</label>
          <span className="relative">
            <input
              id="reset-confirm"
              name="confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={input}
            />
            <Lock className={iconCls} aria-hidden />
            {matches && (
              <Check
                className="absolute top-1/2 right-3.5 size-4.5 -translate-y-1/2 text-success"
                aria-hidden
              />
            )}
          </span>
        </div>
        <ul className="grid gap-1.5 text-[0.8125rem]" aria-label="Password requirements">
          {checks.map((c) => (
            <li
              key={c.text}
              className={cn(
                "flex items-center gap-2 transition-colors",
                c.ok ? "text-fg" : "text-fg-muted",
              )}
            >
              <span
                className={cn(
                  "grid size-4.5 place-items-center rounded-full border transition-colors",
                  c.ok ? "border-transparent bg-success text-white" : "border-strong",
                )}
              >
                {c.ok && <Check className="size-3" strokeWidth={3} aria-hidden />}
              </span>
              {c.text}
              <span className="sr-only">{c.ok ? "(done)" : "(not yet)"}</span>
            </li>
          ))}
        </ul>
        <button
          type="submit"
          disabled={pending}
          className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0145b8] font-semibold text-white shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--accent-primary)_70%,transparent)] transition-[translate,box-shadow,opacity] hover:-translate-y-0.5 hover:bg-[#0a52cc] disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="size-4.5 animate-spin" aria-hidden />
          ) : (
            <>
              {invite ? "Activate account" : "Set password & sign in"}
              <ArrowRight
                className="size-4.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
