"use client";

import { useEffect } from "react";
import { legacyHashRedirects } from "@/lib/seo/legacy-redirects";

/** SRS §5.3: old one-page anchors (/#about, /#services) can only be handled client-side. */
export function LegacyHashRedirect() {
  useEffect(() => {
    const target = legacyHashRedirects[window.location.hash];
    if (target) window.location.replace(target);
  }, []);
  return null;
}
