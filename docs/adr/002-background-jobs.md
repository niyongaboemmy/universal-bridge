# ADR-002 — Background jobs and the email outbox

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-10-09 |
| Requirements | NFR-REL-02, CMS-06, SRS §11 retention, INT-06, INT-08 |

## Context

Emails, CRM sync, team alerts, scheduled publishing and retention purges must run outside the request, and must not be lost when a provider is down.

## Decision

- A Payload collection `outbox` stores jobs (`kind`, `payload`, `status`, `attempts`, `runAfter`, `lastError`).
- A submission and its outbox rows are created in the **same database transaction** (`req.transactionID`).
- `GET /api/cron/outbox` (protected by `CRON_SECRET`) processes due jobs. Vercel Cron calls it every minute in production; in development the request handler also drains the outbox after a submission (`after()`), so local work needs no cron.
- Retries: exponential backoff (1, 2, 4, 8, 16 min), 5 attempts, then `dead` + Sentry alert.

## Consequences

No extra service to run or pay for. Throughput is limited to what one function invocation can process per minute, which is far above expected volume (hundreds per day).
