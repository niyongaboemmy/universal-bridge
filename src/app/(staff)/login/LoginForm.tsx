"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, MailCheck } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { requestReset, signIn, type SignInState } from "@/features/staff-auth/actions";
import { cn } from "@/lib/utils";

const input =
  "peer h-12 w-full rounded-xl border border-strong bg-surface pr-11 pl-11 text-body-sm text-fg transition-[border-color,box-shadow] outline-none placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-primary)_16%,transparent)]";
const iconCls =
  "pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-fg-muted transition-colors peer-focus:text-accent";

export function LoginForm({
  next,
  providers,
  notice,
}: {
  next?: string;
  providers: { id: string; label: string }[];
  notice?: { tone: "error" | "info"; text: string };
}) {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [signInState, signInAction, signingIn] = useActionState<SignInState, FormData>(
    signIn,
    null,
  );
  const [resetState, resetAction, resetting] = useActionState<SignInState, FormData>(
    requestReset,
    null,
  );
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [email, setEmail] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const error = mode === "signin" ? signInState?.error : resetState?.error;

  // Shake the card on a failed attempt.
  useEffect(() => {
    if (!error || !card.current) return;
    const el = card.current;
    el.classList.remove("login-shake");
    void el.offsetWidth;
    el.classList.add("login-shake");
  }, [error, signInState, resetState]);

  return (
    <div ref={card} className="login-in grid gap-6">
      <div>
        <p className="text-[0.75rem] font-semibold tracking-[0.14em] text-accent uppercase">
          Staff
        </p>
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight font-bold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Reset your password"}
        </h1>
        <p className="mt-1 text-body-sm text-fg-secondary">
          {mode === "signin"
            ? "Sign in to the office and the CMS."
            : "We'll email you a link to set a new one."}
        </p>
      </div>

      {notice && !error && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-body-sm",
            notice.tone === "error"
              ? "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger"
              : "bg-accent-soft text-accent",
          )}
        >
          {notice.text}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3.5 py-2.5 text-body-sm text-danger"
        >
          {error}
        </p>
      )}

      {mode === "signin" ? (
        <form action={signInAction} className="grid gap-4" noValidate>
          <input type="hidden" name="next" value={next ?? ""} />
          <label className="grid gap-1.5 text-[0.8125rem] font-medium">
            Email
            <span className="relative">
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                defaultValue={signInState?.email ?? email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@universalbridge.rw"
                className={input}
              />
              <Mail className={iconCls} aria-hidden />
            </span>
          </label>
          <div className="grid gap-1.5 text-[0.8125rem] font-medium">
            <span className="flex items-center justify-between">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="font-medium text-accent hover:underline"
              >
                Forgot?
              </button>
            </span>
            <span className="relative">
              <input
                id="login-password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
                className={input}
              />
              <Lock className={iconCls} aria-hidden />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-fg-muted hover:bg-[var(--bg-sunken)] hover:text-fg"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
            {caps && (
              <span className="text-[0.75rem] text-[var(--accent-spark-text)]">
                Caps Lock is on
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={signingIn}
            className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0145b8] font-semibold text-white hover:bg-[#0a52cc] shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--accent-primary)_70%,transparent)] transition-[translate,box-shadow,opacity] hover:-translate-y-0.5 disabled:opacity-70"
          >
            {signingIn ? (
              <Loader2 className="size-4.5 animate-spin" aria-hidden />
            ) : (
              <>
                Sign in
                <ArrowRight
                  className="size-4.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </button>
          {providers.length > 0 && (
            <>
              <div className="flex items-center gap-3 text-[0.75rem] text-fg-muted">
                <span className="h-px flex-1 bg-[var(--border-subtle)]" />
                or
                <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {providers.map((p) => (
                  <a
                    key={p.id}
                    href={`/api/sso/${p.id}/start`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-strong text-body-sm font-medium hover:bg-[var(--bg-sunken)]"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </form>
      ) : resetState?.sent ? (
        <div className="grid justify-items-start gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <MailCheck className="size-6" aria-hidden />
          </span>
          <p className="text-body-sm text-fg-secondary">
            If <strong className="text-fg">{resetState.email}</strong> has a staff account, a link
            is on its way. It works once, for one hour.
          </p>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to sign in
          </button>
        </div>
      ) : (
        <form action={resetAction} className="grid gap-4" noValidate>
          <label className="grid gap-1.5 text-[0.8125rem] font-medium">
            Email
            <span className="relative">
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                defaultValue={email}
                className={input}
              />
              <Mail className={iconCls} aria-hidden />
            </span>
          </label>
          <button
            type="submit"
            disabled={resetting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0145b8] font-semibold text-white hover:bg-[#0a52cc] disabled:opacity-70"
          >
            {resetting ? <Loader2 className="size-4.5 animate-spin" aria-hidden /> : "Send link"}
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="inline-flex items-center justify-center gap-1.5 text-body-sm font-medium text-fg-secondary hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to sign in
          </button>
        </form>
      )}
    </div>
  );
}
