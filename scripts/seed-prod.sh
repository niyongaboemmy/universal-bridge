#!/usr/bin/env bash
# Re-seeds PRODUCTION content safely (docs/DEPLOYMENT.md §3.7), from your computer:
#
#   pnpm db:seed:prod                       # protect anything edited after the first seed
#   SEED_PROTECT_AFTER=2026-10-10T12:30:00Z pnpm db:seed:prod
#   pnpm db:seed:prod --dry-run     # backup + dry run only
#   pnpm db:seed:prod --yes         # skip the "production" prompt (after a dry run)
#
# 1. One SSH login: backs up the database on the server (pg_dump), reads the
#    three secrets the seed needs into a private temp file (never printed) and
#    keeps a tunnel to PostgreSQL open.
# 2. Dry run: lists what would be created, updated or skipped. Documents and
#    globals edited by staff after SEED_PROTECT_AFTER are skipped; team members
#    removed on the site are not re-created; published documents stay published.
# 3. Asks you to type "production", then seeds for real and refreshes the site.
# 4. Second login: copies new uploads to the server. Uploads live on the server's
#    disk (shared/.data/media), but a seed run from here writes them locally.
#
# Rollback: pg_restore --clean --no-owner -d "$DATABASE_URL" <the backup it prints>
set -euo pipefail

DRY_ONLY=0 YES=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_ONLY=1 ;;
    --yes) YES=1 ;;
    *) echo "Unknown option $arg"; exit 1 ;;
  esac
done

TARGET="${UB_SSH_TARGET:-uruzjktk@premium231.web-hosting.com}"
PORT="${UB_SSH_PORT:-21098}"
APP_DIR="${UB_APP_DIR:-apps/universalbridge}"
KEY="${UB_SSH_KEY:-$HOME/.ssh/cpanel_deploy}"
SITE="${UB_SITE_URL:-https://universalbridge.rw}"
LPORT="${UB_TUNNEL_PORT:-6543}"
PROTECT="${SEED_PROTECT_AFTER:-2026-10-10T12:30:00Z}"
SSH_OPTS=(-p "$PORT" -o BatchMode=yes -o PasswordAuthentication=no -o ConnectTimeout=20)
[ -f "$KEY" ] && SSH_OPTS+=(-i "$KEY" -o IdentitiesOnly=yes)

cd "$(dirname "$0")/.."
TMP="$(mktemp -d)"
chmod 700 "$TMP"
TUNNEL_PID=""
cleanup() {
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null || true
  rm -rf "$TMP"
}
trap cleanup EXIT

echo "→ Backing up the production database and opening a tunnel (one SSH login)…"
read -r -d '' REMOTE <<'REMOTE' || true
set -euo pipefail
ENV="$APP/.env.production"
get() { grep -E "^$1=" "$ENV" | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }
mkdir -p "$APP/backups"
B="$APP/backups/db-before-seed-$(date -u +%Y%m%d%H%M%S).dump"
pg_dump --format=custom --no-owner --file="$B" "$(get DATABASE_URL)"
chmod 600 "$B"
echo "BACKUP=$B"
echo "DATABASE_URL=$(get DATABASE_URL)"
echo "PAYLOAD_SECRET=$(get PAYLOAD_SECRET)"
echo "REVALIDATE_SECRET=$(get REVALIDATE_SECRET)"
echo READY
sleep 1800
REMOTE
(umask 077 && : >"$TMP/remote")
ssh "${SSH_OPTS[@]}" -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 \
  -L "$LPORT:127.0.0.1:5432" "$TARGET" "APP=\$HOME/$APP_DIR bash -c $(printf %q "$REMOTE")" \
  >"$TMP/remote" 2>"$TMP/ssh.err" &
TUNNEL_PID=$!
for _ in $(seq 1 90); do
  grep -q '^READY$' "$TMP/remote" && break
  kill -0 "$TUNNEL_PID" 2>/dev/null || { cat "$TMP/ssh.err"; echo "SSH failed."; exit 1; }
  sleep 2
done
grep -q '^READY$' "$TMP/remote" || { cat "$TMP/ssh.err"; echo "Timed out."; exit 1; }
val() { grep -E "^$1=" "$TMP/remote" | head -1 | cut -d= -f2-; }
echo "  Backup on the server: $(val BACKUP)"

# The server's DATABASE_URL points at its own PostgreSQL; go through the tunnel.
DATABASE_URL="$(val DATABASE_URL | sed -E "s#@[^/@]+/#@127.0.0.1:$LPORT/#")"
export DATABASE_URL
PAYLOAD_SECRET="$(val PAYLOAD_SECRET)" REVALIDATE_SECRET="$(val REVALIDATE_SECRET)"
export PAYLOAD_SECRET REVALIDATE_SECRET
export NEXT_PUBLIC_SITE_URL="$SITE" NODE_ENV=production SEED_PROTECT_AFTER="$PROTECT"

seed() { pnpm -s db:seed 2>&1 | grep -v -e 'Pulling schema' -e 'not found. Continuing'; }

if [ "$YES" != 1 ]; then
  echo "→ Dry run (nothing is written):"
  SEED_DRY_RUN=1 seed
  [ "$DRY_ONLY" = 1 ] && exit 0
  echo
  read -r -p 'Apply these changes to PRODUCTION? Type "production" to continue: ' answer
  [ "$answer" = production ] || { echo "Cancelled. Nothing was changed."; exit 1; }
fi

mkdir -p .data/media
ls -1 .data/media | sort >"$TMP/media.before"
seed
ls -1 .data/media | sort >"$TMP/media.after"
kill "$TUNNEL_PID" 2>/dev/null || true
TUNNEL_PID=""

NEW=()
while IFS= read -r f; do NEW+=(".data/media/$f"); done < <(comm -13 "$TMP/media.before" "$TMP/media.after")
if [ ${#NEW[@]} -gt 0 ]; then
  echo "→ Copying ${#NEW[@]} new upload file(s) to the server (second SSH login, after a pause)…"
  sleep 20 # the server's firewall blocks bursts of logins
  scp -P "$PORT" "${SSH_OPTS[@]:2}" "${NEW[@]}" "$TARGET:$APP_DIR/shared/.data/media/"
  rm -f "${NEW[@]}" # they belong to production, not to your local library
fi
echo "✓ Production seeded. Check $SITE"
