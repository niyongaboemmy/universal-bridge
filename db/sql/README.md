# One-off production SQL

Data fixes and checks that run against the production database, reviewed like
any other change. Schema changes don't belong here: change the collection, run
`pnpm db:migrate:create <name>` and merge; the deploy applies it.

1. Add a file named `YYYY-MM-DD-short-description.sql` and open a PR.
2. After review and merge, run it:
   - **GitHub:** Actions → **Production SQL** → Run workflow → enter the file path, choose `read` or `write`.
   - **Terminal (needs the SSH key):** `pnpm db:prod-sql -f db/sql/<file>.sql` (read-only) or add `--write`.

`read` runs inside a read-only transaction: Postgres rejects any change.
`write` backs up the database first (`~/apps/universalbridge/backups/db-before-sql-*.dump`, last 5 kept),
runs the whole file in one transaction (an error rolls it all back), refreshes the
site cache and records the run in `~/apps/universalbridge/logs/sql.log`.

Write the SQL for PostgreSQL 10 (the production server's version).
