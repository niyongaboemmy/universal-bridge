#!/usr/bin/env bash
# The one cPanel cron entry (docs/DEPLOYMENT.md, step 9). Namecheap allows at most
# 5 cron jobs, none more often than every 5 minutes, so this single entry runs
# every 5 minutes and calls every scheduled route that is due.
#
#   */5 * * * * /bin/bash $HOME/apps/universalbridge/current/deploy/cron.sh
set -uo pipefail

APP="${APP_ROOT:-$HOME/apps/universalbridge}"
ENV_FILE="$APP/.env.production"
LOG="$APP/logs/cron.log"
env_get() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }

SITE="$(env_get NEXT_PUBLIC_SITE_URL)"
SITE="${SITE%/}"
SECRET="$(env_get CRON_SECRET)"

call() {
  local code
  code="$(curl -sS -m 240 -o /dev/null -w '%{http_code}' \
    -H "authorization: Bearer $SECRET" "$SITE/api/cron/$1")"
  printf '%s %s %s\n' "$(date -u +%FT%TZ)" "$1" "$code" >>"$LOG"
}

call outbox # queued emails, team alerts, virus scans
call jobs   # scheduled publishing and unpublishing
# Monthly retention (SRS §11): the first run on the 1st of the month after 03:00 UTC.
if [ "$(date -u +%d)" = "01" ] && [ "$(date -u +%H)" = "03" ] && [ "$(date -u +%M)" -lt 5 ]; then
  call retention
fi

# Keep the log small (inodes and disk).
tail -n 2000 "$LOG" >"$LOG.tmp" && mv "$LOG.tmp" "$LOG"
