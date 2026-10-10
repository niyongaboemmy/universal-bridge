#!/usr/bin/env bash
# Fails when src/migrations does not build the schema the collections need, e.g.
# a collection was added without `pnpm db:migrate:create` (docs/DEPLOYMENT.md).
#
#   MIGRATED_URL=postgres://…/a PUSHED_URL=postgres://…/b scripts/check-migrations.sh
#
# Both databases must exist and be empty. One gets the migrations, the other a
# dev-mode schema push; their tables and columns must match.
set -euo pipefail
: "${MIGRATED_URL:?}" "${PUSHED_URL:?}"

DATABASE_URL="$MIGRATED_URL" pnpm db:migrate >/dev/null
DATABASE_URL="$PUSHED_URL" NODE_ENV=development PAYLOAD_PUSH=1 \
  pnpm exec tsx scripts/push-schema.ts >/dev/null

columns() {
  psql "$1" -Atc "select table_name || '.' || column_name || ' ' || data_type
    from information_schema.columns
    where table_schema = 'public' and table_name not like 'payload_migrations%'
    order by 1"
}
out="$(mktemp)"
if ! diff <(columns "$MIGRATED_URL") <(columns "$PUSHED_URL") >"$out"; then
  echo "Migrations are out of date (< migrations, > collections):"
  head -50 "$out"
  echo "Run: pnpm db:migrate:create <name>, review it, and commit src/migrations."
  exit 1
fi
echo "Migrations match the collections."
