# ADR-003 — Caching and revalidation

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-10-09 |
| Requirements | CMS-08, NFR-PERF-05, journey 7 (SRS §14.2) |

## Decision

- All CMS reads for public pages go through `src/lib/cms/*`. Each function uses `"use cache"`, `cacheLife("max")` and tags: `${collection}` and `${collection}:${slug}`, plus `global:${slug}` for globals.
- Payload `afterChange` / `afterDelete` hooks call `revalidateTag` for the document tag and its collection tag (`src/lib/cms/revalidate.ts`).
- Certificate verification, forms and admin are never cached.

## Consequences

Edits go live on the next request after publish (target < 60 s). Pages that list many collections must tag every collection they read, which the helpers do for you.
