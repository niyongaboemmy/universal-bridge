# ADR-006 — Content Security Policy on statically cached pages

| Field | Value |
|---|---|
| Status | Proposed — needs sign-off from the CTO (deviates from NFR-SEC-02 wording) |
| Date | 2026-10-09 |
| Requirements | NFR-SEC-02, NFR-SEC-08, NFR-PERF-05 |

## Context

NFR-SEC-02 asks for a **nonce-based** CSP. In Next.js a nonce must be unique per response, which forces every page to render dynamically. That removes CDN caching, and with the database in Rwanda (ADR-001) it would make NFR-PERF-05 (TTFB ≤ 200 ms in Europe and East Africa) impossible.

## Decision

- Public pages stay **statically rendered and CDN-cached**.
- They send a strict, static CSP: `default-src 'self'`; scripts from `'self'`, `'unsafe-inline'` (required for the framework's inline hydration data) and named third parties only (Turnstile, Plausible, Cal.com); `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`.
- The **admin** (`/admin`) is already dynamic. It keeps its own CSP header.
- All other headers in NFR-SEC-02 are sent unchanged.
- The third-party allow-list is defined once in `src/lib/security/csp.ts` and checked in CI against `docs/third-parties.md` (NFR-SEC-08).

## Consequences

`'unsafe-inline'` scripts weaken XSS protection. This is mitigated by: no user HTML is ever rendered unsanitised (rich text is rendered from Lexical JSON, never `dangerouslySetInnerHTML` of user input), Zod validation of all input, and no third-party widgets that inject markup. Revisit when Next.js supports hash-based CSP for its inline payloads on static pages.
