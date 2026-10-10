#!/usr/bin/env bash
# Switches the cPanel app to an uploaded release (docs/DEPLOYMENT.md).
#
#   bash ~/apps/universalbridge/releases/<id>/deploy/activate.sh <id>
#
# Links the shared upload folder, backs up the database, points `current` at the
# release, restarts the app and waits for /api/health. If the new release does
# not come up healthy it switches back to the previous one and exits non-zero.
set -euo pipefail

ID="${1:?usage: activate.sh <release-id>}"
APP="${APP_ROOT:-$HOME/apps/universalbridge}"
REL="$APP/releases/$ID"
KEEP="${KEEP_RELEASES:-2}"          # releases kept on disk, current included (inode budget)
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"
ENV_FILE="$APP/.env.production"

log() { printf '[deploy %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
env_get() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }

[ -f "$REL/server.js" ] || { log "No release at $REL"; exit 1; }
[ -f "$ENV_FILE" ] || { log "Missing $ENV_FILE (see docs/DEPLOYMENT.md, step 5)"; exit 1; }
SITE="$(env_get NEXT_PUBLIC_SITE_URL)"
SITE="${SITE%/}"

# 1. Uploads, CVs and mail live outside the releases and survive every deploy.
mkdir -p "$APP/shared/.data/media" "$APP/shared/.data/private" "$APP/shared/.data/mail" \
  "$APP/tmp" "$APP/logs" "$APP/backups"
chmod 700 "$APP/shared/.data/private"
ln -sfn "$APP/shared/.data" "$REL/.data"

# 2. Startup file: kept in step with the release that ships it.
cp "$REL/deploy/app.cjs" "$APP/app.cjs"

# 3. Database backup before the new release migrates anything.
DB_URL="$(env_get DATABASE_URL)"
if [ "${SKIP_DB_BACKUP:-0}" != "1" ] && command -v pg_dump >/dev/null; then
  DUMP="$APP/backups/db-$(date -u +%Y%m%d%H%M%S)-$ID.dump"
  if pg_dump --format=custom --no-owner --file="$DUMP" "$DB_URL"; then
    chmod 600 "$DUMP"
    log "Database backed up to $DUMP"
    ls -1t "$APP"/backups/db-*.dump | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f
  else
    rm -f "$DUMP"
    log "WARNING: pg_dump failed; continuing without a backup (set up a manual one)"
  fi
fi

# 4. Switch `current` atomically and restart.
PREV="$(readlink "$APP/current" 2>/dev/null || true)"
switch_to() {
  ln -sfn "$1" "$APP/current.next"
  mv -Tf "$APP/current.next" "$APP/current"
  touch "$APP/tmp/restart.txt"
  if command -v cloudlinux-selector >/dev/null; then
    cloudlinux-selector restart --json --interpreter nodejs \
      --app-root "${APP#"$HOME"/}" >/dev/null 2>&1 || true
  fi
}
switch_to "$REL"
log "current -> releases/$ID (previous: ${PREV:-none})"

# 5. Health check: the first request starts Node and runs pending migrations.
healthy=0
for _ in $(seq 1 36); do
  if curl -fs -m 20 -o /dev/null "$SITE/api/health"; then healthy=1; break; fi
  sleep 5
done
if [ "$healthy" != 1 ]; then
  log "Release $ID is not healthy after 3 minutes."
  if [ -n "$PREV" ]; then
    switch_to "$PREV"
    log "Rolled back to $PREV. Check $APP/logs and stderr.log in the app root."
  fi
  exit 1
fi
log "Healthy: $(curl -fsS -m 20 "$SITE/api/health" || true)"

# 6. The build prerendered pages from an empty CI database: drop them so the
#    next request renders from the real content (cached again from then on).
SECRET="$(env_get REVALIDATE_SECRET)"
curl -fsS -m 30 -X POST "$SITE/api/revalidate" \
  -H "authorization: Bearer $SECRET" -H "content-type: application/json" \
  -d '{"tags":["cms","sitemap","search-index"],"expire":true}' >/dev/null &&
  log "Content cache refreshed" || log "WARNING: cache refresh failed; run it by hand"
for path in / /fr /rw /sitemap.xml; do curl -s -m 60 -o /dev/null "$SITE$path" || true; done

# 7. Prune old releases (each one is ~5,000 files against the 300,000 inode cap).
cd "$APP/releases"
{ ls -1t | grep -vx "$ID" || true; } | tail -n +"$KEEP" | xargs -r rm -rf
log "Done. Releases on disk: $(ls -1 | tr '\n' ' ')"
