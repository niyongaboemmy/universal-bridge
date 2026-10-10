#!/usr/bin/env bash
# Creates ~/apps/universalbridge/.env.production once, with fresh random secrets
# (docs/DEPLOYMENT.md, step 3.5). Run it on the server over SSH or in cPanel → Terminal:
#
#   bash <(curl -fsSL https://raw.githubusercontent.com/niyongaboemmy/universal-bridge/main/deploy/cpanel/init-env.sh)
#   # or copy this file to the server and: bash init-env.sh
#
# Never overwrites an existing file: PAYLOAD_SECRET must not change after launch.
set -euo pipefail

APP="${APP_ROOT:-$HOME/apps/universalbridge}"
FILE="$APP/.env.production"
SITE="${SITE_URL:-https://universalbridge.rw}"

if [ -e "$FILE" ]; then
  echo "$FILE already exists; edit it instead (nano $FILE)."
  exit 1
fi
mkdir -p "$APP"
umask 077
rand() { openssl rand -hex 32; }

cat >"$FILE" <<EOF
# Runtime settings for $SITE (docs/DEPLOYMENT.md). Keep this file private (chmod 600).
# After editing: cPanel → Setup Node.js App → Restart, or: touch $APP/tmp/restart.txt

# --- Required: fill in the database ------------------------------------------
DATABASE_URL=postgres://uruzjktk_ubweb:CHANGE_ME@localhost:5432/uruzjktk_ubweb

# --- Generated: do not change after launch -----------------------------------
PAYLOAD_SECRET=$(rand)
REVALIDATE_SECRET=$(rand)
CRON_SECRET=$(rand)
RATE_LIMIT_SALT=$(rand)
NEXT_PUBLIC_SITE_URL=$SITE

# --- Required before launch ----------------------------------------------------
# Cloudflare Turnstile (production keys; the site key must also be the GitHub variable)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
# Resend (emails); without it emails are only written to disk
RESEND_API_KEY=
EMAIL_FROM="Universal Bridge <hello@universalbridge.rw>"
INBOX_SALES=sales@universalbridge.rw
INBOX_ACADEMY=academy@universalbridge.rw
INBOX_CAREERS=careers@universalbridge.rw
INBOX_PARTNERS=partners@universalbridge.rw
INBOX_PRESS=press@universalbridge.rw
INBOX_SUPPORT=support@universalbridge.rw
INBOX_EVENTS=

# --- Recommended -----------------------------------------------------------------
CERT_SIGNING_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
CLAMAV_HOST=

# --- Optional ------------------------------------------------------------------
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_CAL_LINK=universal-bridge/discovery
CRM_WEBHOOK_URL=
TEAM_ALERT_WEBHOOK_URL=
MFA_ENFORCEMENT=
SSO_ENABLED=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
SSO_ALLOWED_DOMAINS=universalbridge.rw
EOF
chmod 600 "$FILE"
echo "Created $FILE. Now set DATABASE_URL and the 'Required before launch' values."
