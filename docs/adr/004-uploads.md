# ADR-004 — File uploads and virus scanning

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-10-09 |
| Requirements | FR-FORM-08, NFR-SEC-06 |

## Decision

- Uploads (CV, portfolio) go to a Payload upload collection `private-files` with `access.read` limited to admins. No public URL exists.
- On the server the file is checked by **magic bytes** (PDF `%PDF`, DOCX/ZIP `PK\x03\x04`, DOC OLE `D0 CF 11 E0`) and size (≤ 5 MB) before it is stored.
- A `scanStatus` field starts as `pending`. A `scan-upload` outbox job runs the configured scanner (`CLAMAV_HOST`, clamd INSTREAM protocol). Without a scanner configured (local development) it is marked `skipped`, and the admin shows a warning.
- Production storage: S3-compatible private bucket via `@payloadcms/storage-s3`, signed URLs only. Local: disk under `.data/private`.

## Consequences

Files pass through a server action (5 MB limit is within the platform body limit). Direct-to-bucket presigned uploads are the next step if larger files are ever needed.
