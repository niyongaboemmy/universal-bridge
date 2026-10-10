# Deployment: Namecheap cPanel (production)

This guide takes the site from a fresh checkout to running on `https://universalbridge.rw`. It runs on the Namecheap shared hosting account `uruzjktk` (server `premium231.web-hosting.com`), and every merge to `main` then deploys automatically. Do sections 1–4 in order the first time. Sections 5–7 cover day-to-day work.

> **Credentials.** Never write the cPanel password into this repo, a GitHub secret or a workflow. The pipeline signs in over SSH with its own key (step 2.1), and you can revoke that key without touching the cPanel login.

## Status (2026-10-10)

**Done**

- Code: standalone build, startup file, activate/rollback, cron, migration check, `.env.production` generator (`deploy/cpanel/init-env.sh`), and the workflow `.github/workflows/deploy.yml`.
- GitHub secrets: `CPANEL_SSH_HOST`, `CPANEL_SSH_PORT`, `CPANEL_SSH_USER`, `CPANEL_SSH_KEY` (a new deploy key; the private half exists only in GitHub) and `CPANEL_SSH_KNOWN_HOSTS`.
- GitHub variables: `NEXT_PUBLIC_SITE_URL=https://universalbridge.rw`, `NODE_VERSION=22`, `CPANEL_APP_DIR=apps/universalbridge`.
- GitHub environment `production`, deployable from `main` only.

**Still to do: in the code**

- Generate and commit the missing migration: `pnpm db:migrate:create <name>`.
- Commit and push this deployment work.

**Still to do: on GitHub**

- Add the variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY` with the production key. The deploy stops until it exists.
- Optional: add required reviewers to the `production` environment.

**Still to do: manual cPanel steps, in this order**

| #   | Step                                                                                         | Section |
| --- | -------------------------------------------------------------------------------------------- | ------- |
| 1   | Import and **authorize** the deploy public key (below)                                         | 2.1     |
| 2   | Free at least 30,000 inodes                                                                   | 2.2     |
| 3   | Create the PostgreSQL database and user                                                       | 2.3     |
| 4   | Issue SSL for `universalbridge.rw` and `www.`                                                 | 2.4     |
| 5   | Back up the old PHP site, check and move the legacy APIs, empty the docroot                   | 3.3     |
| 6   | Create the Node.js app (`apps/universalbridge`, `app.cjs`, Node 22)                            | 3.4     |
| 7   | Run `init-env.sh` and fill in `.env.production`                                                | 3.5     |
| 8   | Run the first deploy from GitHub Actions, then seed the admin                                 | 3.6–3.7 |
| 9   | Add the cron job                                                                               | 4       |

Deploy public key to import in step 1:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKXVQfe4nIn5L0s5+3i0reuuLEcPA6g9Pby0nfe5ZSYG github-deploy-universalbridge
```

---

## 1. How it fits together

```
 merge to main ──► CI (ci.yml) passes ──► Deploy (cPanel) workflow
                                            1. check migrations match the collections
                                            2. build a standalone bundle (Linux, Node 22)
                                            3. smoke-test it (/api/health)
                                            4. upload over SSH (port 21098)
                                            5. activate.sh on the server:
                                               link uploads, back up DB, switch release,
                                               restart, health check (auto rollback),
                                               refresh content cache, prune old releases
```

**One domain, one Node app.** Next.js and Payload CMS run in one process. That process serves the website, `/admin`, `/api/*` and uploaded files (`/api/media/file/...`). **You don't need `api.universalbridge.rw` or `cdn.universalbridge.rw` for this app.** Both subdomains already exist in cPanel (with empty folders). Leave them alone or use them for something else, for example the legacy PHP APIs in section 3.3. Keeping everything on one origin matters: admin cookies, the CSP (`'self'`) and server actions all assume a single origin.

**Layout on the server** (outside `public_html`, so nothing here is directly web-reachable):

```
/home/uruzjktk/apps/universalbridge/       ← "Application root" in Setup Node.js App
├── app.cjs                ← startup file (installed by each deploy)
├── .env.production        ← all runtime secrets (chmod 600, you create it once)
├── current -> releases/20261010120000-ab12cd34
├── releases/              ← the last 2 releases (~5,000 files each)
├── shared/.data/          ← uploads (media/), CVs (private/), mail/: survive deploys
├── backups/               ← pg_dump before every deploy (last 5)
├── logs/                  ← node.log (app), cron.log
└── tmp/restart.txt        ← touched to restart the app
```

**What changed in the code to make this work** (already in the repo):

| File                                 | Why                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts`                     | `NEXT_OUTPUT=standalone` builds a self-contained bundle: ~5k files instead of 115k for `node_modules` (the account has an inode cap). `.data` is excluded from tracing; before this fix, local dev emails were copied into the bundle.                                     |
| `src/payload.config.ts`              | `PAYLOAD_MIGRATE_ON_START=1` (set by `app.cjs` only) applies pending migrations when the server starts. The server has no Payload CLI. `next build` never migrates.                                                                                                        |
| `src/lib/cms/cached.ts`              | Every CMS read also carries the `cms` cache tag.                                                                                                                                                                                                                          |
| `src/app/api/revalidate/route.ts`    | `{"expire": true}` drops cached pages immediately. Each deploy uses it, because the build prerenders pages from an empty CI database.                                                                                                                                      |
| `deploy/cpanel/*`                    | Startup file, bundle, activate (with rollback) and cron scripts.                                                                                                                                                                                                         |
| `scripts/check-migrations.sh`        | The deploy fails if `src/migrations` doesn't create the tables the collections need.                                                                                                                                                                                      |
| `.github/workflows/deploy.yml`       | The pipeline.                                                                                                                                                                                                                                                             |

---

## 2. Before you start: blockers and facts about this account

Checked against the live account on 2026-10-10:

| Fact                                                                                                     | Consequence                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan **Stellar Plus**: 2 GB RAM, 30 entry processes, CloudLinux 8, LiteSpeed. Many other sites share it. | Never build on the server (the build needs ~8 GB). Watch _Resource Usage_ after go-live.                                                                                                                                                                          |
| **Inodes: 277,248 / 300,000 used (92%)**                                                                 | Only ~22,700 files left. A release is ~5,000 files and two are kept. **Free at least 30,000 inodes first** (2.2).                                                                                                                                                 |
| `universalbridge.rw` is an addon domain whose docroot `~/universalbridge.rw` holds an **old PHP site** plus `dmrapi/`, `exapi/`, `pbapi/` | Once Node serves the domain, those URLs stop working. **Find out who calls them** (3.3) before cut-over.                                                                                                                                                          |
| HTTPS on `universalbridge.rw` serves the server's `*.web-hosting.com` certificate. **No valid SSL.**     | The app refuses to start without an `https://` site URL. Install SSL first (2.4).                                                                                                                                                                                 |
| PostgreSQL is enabled, but Namecheap runs **PostgreSQL 10.23** (end of life since 2022)                   | The migration uses no PG 13+ syntax, but Payload has not been proven on PG 10. The staging rehearsal (section 3) is the gate. Fallback in 2.3.                                                                                                                     |
| Cron: **every 5 minutes at most, 5 jobs maximum** (1 already used)                                        | One cron entry runs everything. Emails go out within 5 minutes (not 1).                                                                                                                                                                                           |
| SSH on port **21098**, key authentication supported                                                      | The pipeline uses an SSH key.                                                                                                                                                                                                                                     |
| **Current migration is out of date.** `Roles`, `Members`, `Avatars`, `Openings` and `SystemSettings` have no tables in `src/migrations/20261010_141749_initial.ts`. | The deploy's migration check fails until someone runs `pnpm db:migrate:create <name>` and commits the result. This was found by deploying to an empty database: the `roles` table did not exist.                                                                 |

### 2.1 Authorize the deploy key (manual, cPanel)

The deploy key pair is already generated. Its private half is stored only in the GitHub secret `CPANEL_SSH_KEY`, and the server's host key is in `CPANEL_SSH_KNOWN_HOSTS`. SSH (port 21098) already answers on this account.

1. cPanel → **Security → SSH Access → Manage SSH Keys → Import Key**.
   - Key name: `github-deploy`
   - Leave _Private key_ and _Passphrase_ empty.
   - _Public key_: the `ssh-ed25519 … github-deploy-universalbridge` line from the [Status](#status-2026-10-10) section.
2. Save, go back, and click **Manage → Authorize** next to `github-deploy`. The deploy fails with `Permission denied (publickey)` until you do this.
3. If SSH is ever switched off: cPanel → **Exclusive for Namecheap Customers → Manage Shell** → _Enable SSH access_.

Your own SSH access for the steps below can use your cPanel login, or your own key imported the same way:

```bash
ssh -p 21098 uruzjktk@premium231.web-hosting.com 'node -v; psql --version; pg_dump --version'
```

**Replacing the deploy key** (if it leaks or someone leaves):

```bash
ssh-keygen -t ed25519 -C github-deploy-universalbridge -f ub_deploy -N ""
gh secret set CPANEL_SSH_KEY < ub_deploy
rm ub_deploy
```

Then import `ub_deploy.pub` in cPanel, authorize it, and delete the old key there.

### 2.2 Free inodes

Over SSH, find the biggest file counts:

```bash
cd ~ && for d in * .[!.]*; do printf '%8s %s\n' "$(find "$d" -xdev 2>/dev/null | wc -l)" "$d"; done | sort -n | tail -20
```

Usual safe wins:

- `rm -rf ~/.npm/_cacache` (npm download cache, often tens of thousands of files)
- `~/.trash`
- Old zips such as `deafactionrda.org.zip`
- `node_modules` of dead projects in `~/nodevenv`

**Ask the owners before deleting any project folder.** The target is **≤ 260,000 used**.

### 2.3 Create the database

**Option A: cPanel PostgreSQL (default, no extra cost).**

1. cPanel → **Databases → PostgreSQL Database Wizard**:
   - database `uruzjktk_ubweb`
   - user `uruzjktk_ubweb`
   - a generated password using letters and digits only (so nothing needs URL-encoding)
   - **all privileges**
2. Your connection string is `postgres://uruzjktk_ubweb:<PASSWORD>@localhost:5432/uruzjktk_ubweb`.

**Option B: managed PostgreSQL 16 (if the PG 10 rehearsal fails).** Use Neon or Supabase in a **US-West** region; the server is in Phoenix, AZ. Before choosing, check over SSH that the server can reach it, e.g. `nc -zv <db-host> 5432`. Shared hosts sometimes block outbound ports. Use the provider's pooled connection string with `?sslmode=require`. Per-deploy `pg_dump` backups will warn rather than run (version mismatch). Rely on the provider's backups instead.

### 2.4 SSL certificate

1. cPanel → **Security → SSL/TLS Status** (or the _Namecheap SSL_ tool). Select `universalbridge.rw` and `www.universalbridge.rw` and issue or install the free certificate.
2. Check it:
   ```bash
   curl -sI https://universalbridge.rw | head -1
   ```
   This must succeed **without** `-k`.

### 2.5 Services the app needs (accounts outside cPanel)

| Setting                                                           | Where                                                                                                                                                                                                                                                                              | Required?                                                                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                                                  | resend.com → add domain `universalbridge.rw` → add the DNS records it lists (DKIM `resend._domainkey`, SPF/MX on `send.`) in cPanel **Zone Editor**. **Do not change the root MX records** (Jellyfish mailboxes).                                                               | Yes. The app has no SMTP option, and Namecheap SMTP is capped at 200 emails/hour.                              |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`          | Cloudflare dashboard → Turnstile → add a widget for `universalbridge.rw` (and the staging host).                                                                                                                                                                                    | Yes. The test keys in `.env.example` let bots through.                                                          |
| `CERT_SIGNING_KEY`                                                | `pnpm cert:keygen` on your computer.                                                                                                                                                                                                                                                | Recommended                                                                                                   |
| `UPSTASH_REDIS_REST_URL/TOKEN`                                    | upstash.com (free tier). Without it, rate limits are per Node process.                                                                                                                                                                                                              | Recommended                                                                                                   |
| `SENTRY_DSN`                                                      | sentry.io                                                                                                                                                                                                                                                                           | Recommended                                                                                                   |
| `CLAMAV_HOST`                                                     | The server runs `clamd`. Check whether it accepts TCP: `nc -zv 127.0.0.1 3310`. If it does, use `127.0.0.1:3310`. **If not, uploaded CVs stay "pending" until a scanner exists. That is a product decision to take before launch.**                                                  | Decision                                                                                                      |
| `S3_*`                                                            | Leave empty. Uploads go to `shared/.data` on the server. Each image creates several files (sizes), so watch inodes. Moving to Cloudflare R2 later is a settings change.                                                                                                             | No                                                                                                            |

---

## 3. First deployment

### 3.1 GitHub settings (done; reference)

Already configured, except `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the optional variables. You can check or change them under Repository → **Settings → Secrets and variables → Actions**, or with `gh secret list` and `gh variable list`.

**Secrets:**

| Name                     | Value                                                 |
| ------------------------ | ----------------------------------------------------- |
| `CPANEL_SSH_HOST`        | `premium231.web-hosting.com`                          |
| `CPANEL_SSH_PORT`        | `21098`                                               |
| `CPANEL_SSH_USER`        | `uruzjktk`                                            |
| `CPANEL_SSH_KEY`         | full contents of the private key file `ub_deploy`     |
| `CPANEL_SSH_KNOWN_HOSTS` | contents of `known_hosts.txt`                         |

**Variables** (these are compiled into the browser code, so they're set at build time, not on the server):

| Name                             | Value                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | `https://universalbridge.rw` (no trailing slash)                       |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | production site key                                                    |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | optional                                                               |
| `NEXT_PUBLIC_CAL_LINK`           | optional (default in code)                                             |
| `CPANEL_APP_DIR`                 | optional, default `apps/universalbridge` (relative to the home folder) |

Then **Settings → Environments → New environment `production`**:

- Optionally add **required reviewers**; each deploy then waits for approval, which is the "manual approval" the README asks for.
- Restrict deployment branches to `main`.

### 3.2 Rehearse on a staging subdomain (strongly recommended)

This proves PostgreSQL 10, the startup file and the cron on this exact server without touching the live domain. Do sections 3.4–3.7 with these substitutions:

| Production                     | Rehearsal                                              |
| ------------------------------ | ------------------------------------------------------ |
| `universalbridge.rw`           | new subdomain `next.universalbridge.rw` (cPanel → Domains → Create; SSL is issued automatically) |
| `apps/universalbridge`         | `apps/ub-staging` (variable `CPANEL_APP_DIR`)          |
| database `uruzjktk_ubweb`      | `uruzjktk_ubstage`                                     |
| `NEXT_PUBLIC_SITE_URL` variable | `https://next.universalbridge.rw`                     |
| `.env.production`              | add `NOINDEX=1`                                        |

Run the workflow by hand: Actions → **Deploy (cPanel)** → _Run workflow_ → `main`. Then work through the checklist in 3.8. If migrations fail on PG 10 (the deploy rolls back, and `logs/node.log` shows the SQL error), switch to Option B in 2.3.

Afterwards, point the variables back to production. Delete the staging app, database and subdomain, or keep them as a permanent staging site.

### 3.3 Cut-over prep on the live domain

1. **Back up the old site:**
   ```bash
   cd ~ && tar -czf ~/backups-universalbridge-php-$(date +%F).tgz universalbridge.rw
   ```
   Also download the archive.
2. **Check whether anything still uses the legacy PHP APIs.** In cPanel → **Metrics → Raw Access**, download the `universalbridge.rw` log, then:
   ```bash
   zgrep -hoE '"(GET|POST|PUT|DELETE) /(dmrapi|exapi|pbapi)/[^ ]*' universalbridge.rw*.gz | sort | uniq -c | sort -rn | head
   ```
   If there is traffic (likely from `dmrclient.`, `dmradmin.`, `exam.`), move those folders to the empty `api.universalbridge.rw` docroot. Then update the client apps' base URLs to `https://api.universalbridge.rw/dmrapi/…` and test them **before** step 3.4.
3. Keep **only** the existing `.htaccess` in `~/universalbridge.rw`. Move everything else out, e.g. `mkdir ~/old-universalbridge-php && mv ~/universalbridge.rw/* ~/old-universalbridge-php/`. Delete that folder once the new site is stable; it frees inodes.

### 3.4 Create the Node.js app

cPanel → **Software → Setup Node.js App → Create Application**:

| Field                       | Value                                                                    |
| --------------------------- | ------------------------------------------------------------------------ |
| Node.js version             | **22.x** (the build uses 22; change `NODE_VERSION` if you pick 24)       |
| Application mode            | Production                                                               |
| Application root            | `apps/universalbridge`                                                   |
| Application URL             | `universalbridge.rw` (path empty)                                        |
| Application startup file    | `app.cjs`                                                                |
| Passenger log file          | `/home/uruzjktk/apps/universalbridge/logs/node.log`                      |
| Environment variables       | none: they go in `.env.production`                                       |

**Never click "Run NPM Install".** Each release carries its own `node_modules`. The app will show errors until the first deploy; that's expected.

cPanel writes a `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION` block into `~/universalbridge.rw/.htaccess`. Leave it there, and put the HTTPS and `www` redirects **above** it:

```apache
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
```

### 3.5 Create `.env.production` on the server

Over SSH, or in cPanel → **Advanced → Terminal**, run the generator once. It writes the file with fresh random secrets and permissions `600`, and it never overwrites an existing file:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/niyongaboemmy/universal-bridge/main/deploy/cpanel/init-env.sh)
nano ~/apps/universalbridge/.env.production
```

In nano, set the `DATABASE_URL` password and the "Required before launch" values. The result must contain at least:

```dotenv
DATABASE_URL=postgres://uruzjktk_ubweb:<PASSWORD>@localhost:5432/uruzjktk_ubweb
PAYLOAD_SECRET=<64 hex chars>
NEXT_PUBLIC_SITE_URL=https://universalbridge.rw
REVALIDATE_SECRET=<64 hex chars>
CRON_SECRET=<64 hex chars>
RATE_LIMIT_SALT=<64 hex chars>
TURNSTILE_SECRET_KEY=<from Cloudflare>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<same as the GitHub variable>
RESEND_API_KEY=<from Resend>
EMAIL_FROM="Universal Bridge <hello@universalbridge.rw>"
INBOX_SALES=sales@universalbridge.rw
# … the other INBOX_*, CERT_SIGNING_KEY, UPSTASH_*, SENTRY_DSN, MFA_*/SSO_* as needed
```

- `PAYLOAD_SECRET` must **never change** after launch, because sessions and two-step secrets depend on it.
- `NEXT_PUBLIC_SITE_URL` must match the GitHub variable exactly.
- If a required value is missing or still an example, the server refuses to start and the deploy rolls back. The log says which value.

### 3.6 Deploy

Run the workflow by hand: GitHub → **Actions → Deploy (cPanel) → Run workflow** (`ref: main`). After that, every merge to `main` deploys by itself once CI passes. A run takes about 10 minutes (plus CI). The last step prints, for example:

```
[deploy 12:00:05] Database backed up to …/backups/db-….dump
[deploy 12:00:06] current -> releases/20261010120000-ab12cd34 (previous: none)
[deploy 12:00:31] Healthy: {"status":"ok","db":"ok","outbox":"ok",…}
[deploy 12:00:32] Content cache refreshed
```

The first start creates all tables (migrate-on-start).

### 3.7 First admin and starting content

The server has no `tsx`, so run the seed **from your computer** through an SSH tunnel to the server's database:

```bash
# terminal 1: keep open
ssh -i ub_deploy -p 21098 -N -L 6543:127.0.0.1:5432 uruzjktk@premium231.web-hosting.com

# terminal 2: from the repo, at the commit that is deployed
DATABASE_URL='postgres://uruzjktk_ubweb:<PASSWORD>@127.0.0.1:6543/uruzjktk_ubweb' \
PAYLOAD_SECRET='<same as server>' NODE_ENV=production \
NEXT_PUBLIC_SITE_URL=https://universalbridge.rw REVALIDATE_SECRET='<same as server>' \
SEED_ADMIN_EMAIL=admin@universalbridge.rw SEED_ADMIN_PASSWORD='<strong password>' \
pnpm db:seed
```

`NODE_ENV=production` stops Payload from "pushing" a dev schema into the production database. Never point `pnpm dev` at it. When the seed finishes it refreshes the live site. Then sign in at `/login`, change the password and enrol two-step verification.

### 3.8 Go-live checklist

- [ ] `curl https://universalbridge.rw/api/health` → `"status":"ok"`
- [ ] Home page in EN / FR / RW, the menu, and a few service and insight pages
- [ ] `http://` and `www.` redirect to `https://universalbridge.rw`
- [ ] Contact form → lead in `/admin` → email received (within 5 minutes, after the cron)
- [ ] Careers application with a CV: file saved, CV not downloadable without sign-in
- [ ] Image upload in `/admin` → shown on the site
- [ ] Old URLs (`/team`, `/agents`, `/application`) return 301
- [ ] `robots.txt` / `sitemap.xml` use `https://universalbridge.rw`
- [ ] Legacy API clients (3.3) still work
- [ ] Cron configured (section 4) and `logs/cron.log` shows `200`s
- [ ] Uptime monitor (e.g. UptimeRobot) on `/api/health`

---

## 4. Scheduled jobs (cron)

cPanel → **Advanced → Cron Jobs**. Add **one** entry: _Once Per Five Minutes_ (`*/5 * * * *`):

```bash
/bin/bash $HOME/apps/universalbridge/current/deploy/cron.sh >/dev/null 2>&1
```

Each run calls `/api/cron/outbox` (emails, alerts, virus scans) and `/api/cron/jobs` (scheduled publishing). On the 1st of the month at 03:00 UTC it also calls `/api/cron/retention`. It reads `CRON_SECRET` from `.env.production`, so no secret appears in cPanel. Results go to `logs/cron.log`. The 5-minute calls also keep the app warm.

---

## 5. Everyday work

**Deploying.** Merge a PR into `main`. The deploy only runs after **CI** passes on that commit. If the `production` environment has reviewers, approve it under Actions.

**Database changes.** After changing a collection or global:

1. Run `pnpm db:migrate:create <short_name>`.
2. Review the generated SQL.
3. Commit `src/migrations/*`.

The deploy refuses to run when the migrations don't match the collections, and pending migrations run automatically when the new release starts. Migrations must be **backwards compatible** with the previous release (add, don't rename or drop in one step), because rollback switches the code but not the database.

**Environment changes.** Edit `~/apps/universalbridge/.env.production`, then restart (below). A `NEXT_PUBLIC_*` value also needs the GitHub variable updated and a new deploy.

**Restart:** pick one of

- cPanel → Setup Node.js App → **Restart**
- `touch ~/apps/universalbridge/tmp/restart.txt`
- `cloudlinux-selector restart --json --interpreter nodejs --app-root apps/universalbridge`

**Logs:**

- `~/apps/universalbridge/logs/node.log` (app output and errors)
- `logs/cron.log`
- `stderr.log` in the app root, if present
- cPanel → Metrics → Errors

**Refresh content written outside the CMS** (scripts, SQL):

```bash
curl -X POST https://universalbridge.rw/api/revalidate -H "authorization: Bearer $REVALIDATE_SECRET" \
  -H "content-type: application/json" -d '{"tags":["cms","sitemap","search-index"],"expire":true}'
```

---

## 6. Rollback and recovery

- **Automatic:** if the new release isn't healthy within 3 minutes, `activate.sh` switches back to the previous release and the workflow fails.
- **Fast manual rollback** (seconds):
  ```bash
  cd ~/apps/universalbridge && ls -t releases
  ln -sfn releases/<previous-id> current && touch tmp/restart.txt
  ```
- **Rollback to any commit:** Actions → Deploy (cPanel) → Run workflow with the commit SHA.
- **Restore the database** (only if a migration damaged data). Stop the app first, in cPanel → Setup Node.js App → Stop, then:
  ```bash
  set -a; . ~/apps/universalbridge/.env.production; set +a
  pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" ~/apps/universalbridge/backups/db-<…>.dump
  ```
- **Files:** `shared/.data` (uploads and CVs) is outside the releases and survives deploys. Include `~/apps/universalbridge/shared` and `backups` in the account's cPanel backups (**Files → Backup**), and keep an off-server copy weekly.

---

## 7. Troubleshooting

| Symptom                                               | Cause / fix                                                                                                                                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflow fails at **Migrations match the collections** | Someone changed a collection without `pnpm db:migrate:create`. The log lists the missing tables and columns.                                                                                                     |
| Workflow fails at **Upload and activate**, "Permission denied" | The deploy key is not **Authorized** in cPanel → SSH Access, or SSH is off (cPanel → Manage Shell). |
| SSH **times out** (deploy retries, or your own `ssh`)  | The server firewall blocks an IP for roughly 10–15 minutes after a few SSH logins in quick succession, or after failed password attempts. Wait and retry; use one connection for several commands. If it persists, ask Namecheap support to check the IP. |
| Deploy rolled back, `node.log` says `[env] Configuration problems` | A required value in `.env.production` is missing or still an example value.                                                                                                                                      |
| Deploy rolled back, SQL error in `node.log`           | The migration failed on this PostgreSQL version. See 2.3 Option B.                                                                                                                                               |
| `503` / `508` / app killed                            | The account hit its 2 GB memory or 30 entry-process limit (cPanel → Resource Usage). Other sites on the account count too.                                                                                       |
| Uploads fail with "disk quota exceeded"               | Inode cap reached (cPanel home page → File Usage). Clean up as in 2.2.                                                                                                                                           |
| Emails not arriving                                   | `logs/cron.log` should show `outbox 200` every 5 minutes. Check `RESEND_API_KEY`, the Resend domain status and `/api/health` (`"outbox":"attention"` means stuck emails).                                        |
| Old content after a deploy                            | The cache refresh in `activate.sh` failed. Run the revalidate command in section 5.                                                                                                                              |

**Limits to know.** Shared hosting suits this site's traffic, but there is no isolation from the other sites on the account and nothing to scale into. If memory limits or inode pressure keep recurring, the same bundle runs on any VPS with Node 22 (`node server.js` behind Nginx); only `activate.sh`'s restart line changes.
