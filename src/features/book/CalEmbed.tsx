"use client";

import { CalendarDays } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button-variants";

/**
 * FR-BOOK-01: Cal.com in an iframe (allowed by the CSP, no script injection).
 * It detects the visitor's time zone itself. The iframe is only requested when
 * the visitor asks for it, so /book stays fast (UI/UX audit P0-2).
 */
export function CalEmbed({
  calLink,
  title,
  copy,
}: {
  calLink: string;
  title: string;
  copy: { loading: string; show: string; note: string };
}) {
  const { resolvedTheme } = useTheme();
  const [requested, setRequested] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = `https://app.cal.com/${calLink}?embed=true&layout=month_view&theme=${resolvedTheme === "dark" ? "dark" : "light"}`;
  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-xl border border-subtle bg-surface">
      {!requested ? (
        <div className="absolute inset-0 grid place-items-center p-8 text-center">
          <div className="max-w-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <CalendarDays aria-hidden className="size-7" strokeWidth={1.5} />
            </span>
            <button
              type="button"
              onClick={() => setRequested(true)}
              className={buttonVariants({ size: "lg", className: "mt-6" })}
            >
              {copy.show}
            </button>
            <p className="mt-4 text-body-sm text-fg-secondary">{copy.note}</p>
          </div>
        </div>
      ) : (
        <>
          {!loaded && (
            <p role="status" className="absolute inset-0 grid place-items-center text-fg-secondary">
              {copy.loading}
            </p>
          )}
          <iframe
            title={title}
            src={src}
            onLoad={() => setLoaded(true)}
            className="relative h-[680px] w-full"
            allow="payment"
          />
        </>
      )}
    </div>
  );
}
