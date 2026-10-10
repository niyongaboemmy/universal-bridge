// ADR-006: static CSP for cached public pages. Third parties must also be
// listed in docs/third-parties.md (checked by scripts/check-csp.ts).
export const THIRD_PARTY_ORIGINS = {
  turnstile: "https://challenges.cloudflare.com",
  plausible: "https://plausible.io",
  cal: "https://app.cal.com",
  // Google Analytics 4 (Google's CSP guide): the gtag.js loader and the collection endpoints.
  googleTag: "https://www.googletagmanager.com",
  googleTagAll: "https://*.googletagmanager.com",
  googleAnalytics: "https://*.google-analytics.com",
  googleAnalyticsRegion: "https://*.analytics.google.com",
} as const;

export function buildCsp({ dev = false }: { dev?: boolean } = {}): string {
  const t = THIRD_PARTY_ORIGINS;
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      t.turnstile,
      t.plausible,
      t.googleTag,
      ...(dev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", t.googleAnalytics, t.googleTagAll],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      t.plausible,
      t.googleAnalytics,
      t.googleAnalyticsRegion,
      t.googleTagAll,
      ...(dev ? ["ws:"] : []),
    ],
    "frame-src": [t.turnstile, t.cal],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };
  const csp = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!dev) csp.push("upgrade-insecure-requests");
  return csp.join("; ");
}

// NFR-SEC-01/02 — headers for every response.
export function securityHeaders({ dev = false }: { dev?: boolean } = {}) {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(dev
      ? []
      : [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]),
  ];
}
