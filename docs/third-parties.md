# Approved third parties

Every external origin the public site loads code or frames from. CI (`pnpm check:csp`) fails if `src/lib/security/csp.ts` allows an origin that is not listed here (NFR-SEC-08).

| Origin | Purpose | Loads | Consent needed |
|---|---|---|---|
| https://challenges.cloudflare.com | Turnstile bot protection on forms | script, frame | No (strictly necessary, security) |
| https://plausible.io | Cookieless analytics | script, connect | Yes (PRV-04 — loaded only after consent) |
| https://www.googletagmanager.com | Google Analytics 4 loader (gtag.js) | script | Yes (PRV-04 — loaded only after consent) |
| https://*.googletagmanager.com | Google Analytics 4 collection | connect, img | Yes (PRV-04 — only after consent) |
| https://*.google-analytics.com | Google Analytics 4 collection | connect, img | Yes (PRV-04 — only after consent) |
| https://*.analytics.google.com | Google Analytics 4 collection (regional endpoints) | connect | Yes (PRV-04 — only after consent) |
| https://app.cal.com | Discovery-call booking | frame | No (loaded on the booking page only) |

## Google Analytics 4

Measurement ID is set in Office → Settings → Integrations (`NEXT_PUBLIC_GA_MEASUREMENT_ID` when empty); clearing it turns Google Analytics off. Nothing loads until the visitor accepts analytics in the cookie banner. It runs for analytics only: advertising storage, Google signals and ad personalisation are off. Withdrawing consent stops it immediately and deletes the `_ga` cookies. The staff office and CMS never load it.
