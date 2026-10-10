"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- /admin and /staff are separate root layouts: full page loads on purpose. */

import { useActionState, useState } from "react";
import { confirmSetup, finishSetup, regenerateCodes, verify, type MfaState } from "./actions";

const input =
  "h-12 w-full rounded-xl border border-strong bg-surface px-4 text-center font-mono text-lg tracking-[0.3em] text-fg placeholder:tracking-normal placeholder:text-fg-muted focus:border-accent focus:outline-none";
const button =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-spark px-6 font-medium text-on-spark transition-colors hover:bg-spark-hover disabled:opacity-60";

function ErrorLine({ state }: { state: MfaState }) {
  return state.error ? (
    <p role="alert" className="text-body-sm text-danger">
      {state.error}
    </p>
  ) : null;
}

export function RecoveryCodes({
  codes,
  next,
  finish,
}: {
  codes: string[];
  next?: string;
  finish?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-body-sm text-fg-secondary">
        Save these recovery codes somewhere safe, such as a password manager. Each one works once if
        you lose your phone. They won&apos;t be shown again.
      </p>
      <ul
        aria-label="Recovery codes"
        className="grid grid-cols-2 gap-2 rounded-xl border border-subtle bg-surface p-4 font-mono text-body-sm"
      >
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <button
        type="button"
        className="text-body-sm font-medium text-accent"
        onClick={() =>
          void navigator.clipboard?.writeText(codes.join("\n")).then(() => setCopied(true))
        }
      >
        {copied ? "Copied" : "Copy codes"}
      </button>
      {next && finish ? (
        <form action={finishSetup}>
          <input type="hidden" name="next" value={next} />
          <button type="submit" className={button}>
            I&apos;ve saved them, continue
          </button>
        </form>
      ) : next ? (
        <a href={next} className={button}>
          I&apos;ve saved them, continue
        </a>
      ) : null}
    </div>
  );
}

export function SetupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(confirmSetup, {});
  if (state.codes) return <RecoveryCodes codes={state.codes} next={state.next} finish />;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="code" className="block text-body-sm font-medium">
        Enter the 6-digit code from the app
      </label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        placeholder="123456"
        className={input}
      />
      <ErrorLine state={state} />
      <button type="submit" disabled={pending} className={button}>
        Turn on two-step verification
      </button>
    </form>
  );
}

export function VerifyForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(verify, {});
  const [recovery, setRecovery] = useState(false);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="code" className="block text-body-sm font-medium">
        {recovery
          ? "Enter one of your recovery codes"
          : "Enter the 6-digit code from your authenticator app"}
      </label>
      {recovery ? (
        <input
          id="code"
          name="code"
          autoComplete="off"
          required
          placeholder="xxxxx-xxxxx"
          className={input}
        />
      ) : (
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="123456"
          className={input}
        />
      )}
      <ErrorLine state={state} />
      <button type="submit" disabled={pending} className={button}>
        Verify
      </button>
      <button
        type="button"
        onClick={() => setRecovery(!recovery)}
        className="w-full text-center text-body-sm font-medium text-accent"
      >
        {recovery ? "Use the authenticator app instead" : "Use a recovery code"}
      </button>
    </form>
  );
}

export function RegenerateForm() {
  const [state, action, pending] = useActionState(regenerateCodes, {});
  if (state.codes) return <RecoveryCodes codes={state.codes} next="/admin" />;
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="text-body-sm font-medium text-accent">
        Create new recovery codes
      </button>
    </form>
  );
}
