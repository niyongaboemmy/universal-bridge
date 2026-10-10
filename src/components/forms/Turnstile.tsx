"use client";

import { useEffect, useRef } from "react";

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * FR-FORM-03 bot protection. The script loads only when the form scrolls near
 * the viewport (performance). The widget adds a hidden `cf-turnstile-response`
 * input to the surrounding form. Without JS there is no token; the server then
 * applies stricter limits and flags the submission.
 */
export function Turnstile({ siteKey, locale }: { siteKey?: string; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!siteKey || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (!document.querySelector(`script[src^="${SCRIPT}"]`)) {
          const s = document.createElement("script");
          s.src = SCRIPT;
          s.async = true;
          s.defer = true;
          document.head.appendChild(s);
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [siteKey]);
  if (!siteKey) return null;
  return (
    <div
      ref={ref}
      className="cf-turnstile min-h-0"
      data-sitekey={siteKey}
      data-appearance="interaction-only"
      data-language={locale === "rw" ? "en" : locale}
      data-response-field-name="cf-turnstile-response"
    />
  );
}
