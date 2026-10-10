#!/usr/bin/env bash
# Runs SQL against the production database on the cPanel server (docs/DEPLOYMENT.md §5).
#
#   pnpm db:prod-sql "select count(*) from leads"            # read-only (default)
#   pnpm db:prod-sql -f db/sql/2026-10-11-fix-slugs.sql      # read-only, from a file
#   pnpm db:prod-sql -f db/sql/2026-10-11-fix-slugs.sql --write
#
# Read-only runs are enforced by Postgres (default_transaction_read_only), so a
# typo can't change data. --write asks for confirmation, backs up the database,
# runs the whole input in ONE transaction (any error rolls everything back),
# refreshes the site cache and logs the run on the server (logs/sql.log).
#
# Schema changes are not for this: change the collection, run
# `pnpm db:migrate:create <name>` and merge; the deploy applies it.
#
# SSH settings (defaults match the production account):
#   UB_SSH_TARGET=uruzjktk@premium231.web-hosting.com  UB_SSH_PORT=21098
#   UB_SSH_KEY=~/.ssh/cpanel_deploy (if present)        UB_APP_DIR=apps/universalbridge
set -euo pipefail

usage() { sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

MODE=read YES=0 FILE="" SQL="" REFRESH=1
while [ $# -gt 0 ]; do
  case "$1" in
    -f | --file) FILE="${2:?-f needs a file}"; shift 2 ;;
    --write) MODE=write; shift ;;
    --yes) YES=1; shift ;;
    --no-refresh) REFRESH=0; shift ;;
    -h | --help) usage ;;
    --) shift ;;
    -*) echo "Unknown option $1"; usage 1 ;;
    *) SQL="$1"; shift ;;
  esac
done
if [ -n "$FILE" ]; then
  [ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }
  SQL="$(cat "$FILE")"
fi
[ -n "${SQL//[[:space:]]/}" ] || { echo "No SQL given."; usage 1; }

TARGET="${UB_SSH_TARGET:-uruzjktk@premium231.web-hosting.com}"
PORT="${UB_SSH_PORT:-21098}"
APP_DIR="${UB_APP_DIR:-apps/universalbridge}"
KEY="${UB_SSH_KEY:-$HOME/.ssh/cpanel_deploy}"
SSH=(ssh -p "$PORT" -o BatchMode=yes -o PasswordAuthentication=no -o ConnectTimeout=20)
[ -f "$KEY" ] && SSH+=(-i "$KEY" -o IdentitiesOnly=yes)

if [ "$MODE" = write ] && [ "$YES" != 1 ]; then
  echo "About to run on PRODUCTION (${TARGET#*@}), in one transaction, after a backup:"
  echo "----------------------------------------------------------------"
  printf '%s\n' "$SQL" | head -40
  [ "$(printf '%s\n' "$SQL" | wc -l)" -gt 40 ] && echo "… ($(printf '%s\n' "$SQL" | wc -l | tr -d ' ') lines)"
  echo "----------------------------------------------------------------"
  read -r -p 'Type "production" to continue: ' answer
  [ "$answer" = production ] || { echo "Cancelled."; exit 1; }
fi

WHO="$(git config user.email 2>/dev/null || whoami)"
REV="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

# Runs on the server; the SQL arrives on stdin.
read -r -d '' REMOTE <<'REMOTE' || true
set -euo pipefail
ENV="$APP/.env.production"
get() { grep -E "^$1=" "$ENV" | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }
DB="$(get DATABASE_URL)"
mkdir -p "$APP/tmp" "$APP/logs" "$APP/backups"
SQLF="$(mktemp "$APP/tmp/sql.XXXXXX")"; trap 'rm -f "$SQLF"' EXIT
cat >"$SQLF"
HASH="$(sha256sum "$SQLF" | cut -c1-12)"
log() { printf '%s %s %s by=%s rev=%s file=%s sha=%s\n' "$(date -u +%FT%TZ)" "$MODE" "$1" "$WHO" "$REV" "$FILE" "$HASH" >>"$APP/logs/sql.log"; }

if [ "$MODE" = write ]; then
  B="$APP/backups/db-before-sql-$(date -u +%Y%m%d%H%M%S).dump"
  pg_dump --format=custom --no-owner --file="$B" "$DB"; chmod 600 "$B"
  echo "Backup: $B"
  if psql "$DB" -X -v ON_ERROR_STOP=1 --single-transaction -f "$SQLF"; then
    log ok; echo "Committed."
  else
    log failed; echo "Failed: nothing was changed (rolled back)."; exit 1
  fi
  ls -1t "$APP"/backups/db-before-sql-*.dump | tail -n +6 | xargs -r rm -f
  if [ "$REFRESH" = 1 ]; then
    SITE="$(get NEXT_PUBLIC_SITE_URL)"
    curl -fsS -m 30 -X POST "${SITE%/}/api/revalidate" -H "authorization: Bearer $(get REVALIDATE_SECRET)" \
      -H "content-type: application/json" \
      -d '{"tags":["cms","sitemap","search-index","_N_T_/layout"],"expire":true}' | grep -q revalidated &&
      echo "Site cache refreshed." || echo "WARNING: cache refresh failed."
  fi
else
  if PGOPTIONS="-c default_transaction_read_only=on" psql "$DB" -X -v ON_ERROR_STOP=1 -f "$SQLF"; then log ok; else log failed; exit 1; fi
fi
REMOTE

# One SSH login per run: the server's firewall blocks bursts of logins.
printf '%s\n' "$SQL" | "${SSH[@]}" "$TARGET" \
  "MODE=$MODE REFRESH=$REFRESH APP=\$HOME/$APP_DIR WHO=$(printf %q "$WHO") REV=$REV FILE=$(printf %q "${FILE:-inline}") bash -c $(printf %q "$REMOTE")"
