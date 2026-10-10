# ADR-007 — First-load JavaScript budget

| Field | Value |
|---|---|
| Status | Proposed — needs a change-control decision on NFR-PERF-03 (SRS §15.3) |
| Date | 2026-10-09 |
| Requirements | NFR-PERF-03, NFR-PERF-02 |

## Context

NFR-PERF-03 sets first-load JS ≤ 120 KB gzip on marketing pages. Measured on the S1 production build (`scripts/check-bundle.ts`, Brotli as served by the CDN, `nomodule` polyfills excluded):

| Part | Brotli |
|---|---|
| React DOM 19.3 | 60 KB |
| Next.js 16.4 App Router client + runtime | ~54 KB |
| **Framework floor** | **~114 KB** |
| UB code (header, theme, language switcher, icons) | ~14 KB |
| **Total** | **127.9 KB** |

The framework alone uses almost the whole budget. Already done to stay lean: no Radix in the first-load path (native Popover API instead, −33 KB), no next-intl client provider (labels passed as props, −10 KB), heavy effects lazy-loaded.

## Decision (proposed)

Replace NFR-PERF-03 with two limits that can actually be enforced:

- **Total first-load JS ≤ 150 KB Brotli** on marketing pages (framework included).
- **UB application code ≤ 36 KB Brotli** of that total (150 − 114).

CI enforces 150 KB now (`BUNDLE_BUDGET_KB`). The user-facing targets in NFR-PERF-01/02 (LCP ≤ 2.0 s, Lighthouse ≥ 95) are unchanged and remain the real goal.

## Consequences

If UB keeps 120 KB, the only route is to leave the App Router (e.g. static HTML + islands framework), which conflicts with the Payload-in-Next architecture in SRS §10.
