"use client";

import { useEffect, useRef } from "react";

/**
 * UI/UX §10.9 "Connected": a pulse travels along a trace from your node to the
 * UB node, then a check draws in. Reduced motion shows the final state.
 */
export function ConnectedSuccess({
  title,
  body,
  reference,
  againLabel,
  onAgain,
  next,
}: {
  title: string;
  body: string;
  reference?: string;
  againLabel?: string;
  onAgain?: () => void;
  /** Optional next step, e.g. "Want to talk sooner? Book a call" (audit v2 U-4). */
  next?: { prompt: string; label: string; href: string };
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <div role="status" className="connected flex flex-col items-center py-10 text-center">
      <svg aria-hidden viewBox="0 0 220 72" className="w-56 max-w-full text-accent">
        <path
          className="connected__trace"
          d="M24 36 H 100 l10 -12 h 0 l 10 12 H 188"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          pathLength={1}
        />
        <circle cx="24" cy="36" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle className="connected__pulse" r="4" fill="var(--accent-spark)">
          <animateMotion dur="0.9s" fill="freeze" path="M24 36 H 100 l10 -12 l 10 12 H 188" />
        </circle>
        <circle className="connected__node" cx="196" cy="36" r="16" fill="var(--accent-primary)" />
        <path
          className="connected__check"
          d="M189 36 l5 5 l9 -10"
          fill="none"
          stroke="var(--on-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      </svg>
      <h2 ref={heading} tabIndex={-1} className="mt-6 font-display text-heading-lg outline-none">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-body-lg text-fg-secondary">{body}</p>
      {reference && <p className="mt-4 font-mono text-body-sm text-fg-muted">{reference}</p>}
      {next && (
        <p className="mt-6 text-fg-secondary">
          {next.prompt}{" "}
          <a href={next.href} className="font-semibold text-accent underline underline-offset-4">
            {next.label}
          </a>
        </p>
      )}
      {againLabel && onAgain && (
        <button
          type="button"
          onClick={onAgain}
          className="mt-6 font-semibold text-accent underline-offset-4 hover:underline"
        >
          {againLabel}
        </button>
      )}
    </div>
  );
}
