# Approved third parties

Every external origin the public site loads code or frames from. CI (`pnpm check:csp`) fails if `src/lib/security/csp.ts` allows an origin that is not listed here (NFR-SEC-08).

| Origin | Purpose | Loads | Consent needed |
|---|---|---|---|
| https://challenges.cloudflare.com | Turnstile bot protection on forms | script, frame | No (strictly necessary, security) |
| https://plausible.io | Cookieless analytics | script, connect | Yes (PRV-04 — loaded only after consent) |
| https://app.cal.com | Discovery-call booking | frame | No (loaded on the booking page only) |
