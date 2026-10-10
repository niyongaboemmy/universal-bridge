# ADR-005 — Site search

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-10-09 |
| Requirements | FR-GL-08 |

## Context

Pagefind indexes static HTML after a build. Our pages are server-rendered and change when the CMS publishes, so a build-time index would be stale.

## Decision

- `GET /api/search-index/[locale]` returns a cached JSON index (title, summary, URL, type) built from the CMS and revalidated by the same tags as content.
- The ⌘K palette loads the index and MiniSearch (~7 KB gzip) **on first open only**.

## Consequences

Zero cost at first page load. Fine below a few thousand documents; revisit with a hosted search if content grows past that.
