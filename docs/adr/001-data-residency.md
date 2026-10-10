# ADR-001 — Data residency and hosting topology

| Field | Value |
|---|---|
| Status | Accepted (pending OI-08 confirmation by the MD) |
| Date | 2026-10-09 |
| Requirements | SRS §13.3, PRV-01, NFR-PERF-05 |

## Context

Rwanda Law No. 058/2021 requires personal data to stay in Rwanda unless the NCSA authorises cross-border storage. Payload stores content and submissions in one PostgreSQL database. Vercel has no Rwandan region.

## Decision

- **Option A**: one PostgreSQL 16+ database and one private object store at a Rwandan provider.
- Vercel Functions are pinned to `cpt1` (Cape Town), the closest region, set in `vercel.json`.
- Public pages are cached (`"use cache"` + tags, ADR-003) and served from the CDN, so visitors rarely wait on the database.
- The code only reads `DATABASE_URL` and `S3_*`; it has no knowledge of where they are. Moving to Option B is a configuration change.

## Consequences

- Cache misses, form submissions, certificate lookups and the admin pay ~30–50 ms extra per query (to be measured in the S0 latency spike).
- **Fallback** if latency is poor: split into a content database (anywhere) and a personal-data database (Rwanda) accessed through Drizzle. Estimated 1 sprint-week.
