# Universal Bridge Ltd — Website

> **Building Smart Solutions. Connecting the Future.**

The corporate website and digital platform for **Universal Bridge Ltd**, a software and technology company based in Kigali, Rwanda (founded 2019). It replaces the current site at [universalbridge.rw](https://universalbridge.rw).

The full requirements are in **[docs/SRS.md](docs/SRS.md)**. Read it before starting any feature. If this README and the SRS disagree, the SRS wins.

How the site should look, move and feel — tokens, motion system, signature interactions and page designs — is in **[docs/UI-UX-PLAN.md](docs/UI-UX-PLAN.md)**.

The build order, sprints, architecture decisions and innovation proposals are in **[docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)**.

> **Status:** Planning. The SRS is a draft and the app has not been scaffolded yet. Commands and folders below describe the agreed setup ([SRS §10](docs/SRS.md#10-technical-architecture)).

---

## Contents

- [What we're building](#what-were-building)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Brand and design tokens](#brand-and-design-tokens)
- [Content and the CMS](#content-and-the-cms)
- [Languages](#languages)
- [Coding standards](#coding-standards)
- [Git workflow](#git-workflow)
- [Testing and quality gates](#testing-and-quality-gates)
- [Environments and deployment](#environments-and-deployment)
- [Security and privacy](#security-and-privacy)
- [Open decisions](#open-decisions)
- [Contact](#contact)

---

## What we're building

A fast, multilingual website that presents Universal Bridge as an international technology company, plus the tools behind it:

| Area                     | What it does                                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing site           | Home, Services, Industry solutions, Products, Case studies, Labs (Coding, AI Innovations, Embedded Systems hubs), Company, Insights (blog), Contact |
| Academy                  | Training programs, internships, online applications                                                                                                 |
| Certificate verification | Anyone can check a UB certificate by ID or QR code                                                                                                  |
| Careers and partners     | Job listings, job applications, agent/referral programme                                                                                            |
| CMS                      | Editors change all content without a developer                                                                                                      |
| Admin dashboard          | Staff review leads and applications, issue certificates, handle data requests                                                                       |

Out of scope for v1: a full learning platform, online payments (Phase 2), a client project portal, and mobile apps. See [SRS §1.4](docs/SRS.md#14-scope).

## Tech stack

| Layer          | Choice                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React 19.2, Turbopack)                                              |
| Language       | TypeScript (strict)                                                                         |
| Styling        | Tailwind CSS v4, shadcn/ui (Radix), Lucide icons, Motion                                    |
| CMS            | Payload CMS 3 (runs inside the Next.js app)                                                 |
| Database       | PostgreSQL 16+                                                                              |
| Forms          | React Hook Form + Zod + Server Actions                                                      |
| Languages      | next-intl (`en`, `fr`, `rw`)                                                                |
| Email          | Resend + React Email                                                                        |
| Files          | S3-compatible storage (private bucket for CVs)                                              |
| Bot protection | Cloudflare Turnstile + rate limiting                                                        |
| Monitoring     | Sentry, Better Stack, Plausible/Umami                                                       |
| Testing        | Vitest, Testing Library, Playwright, axe-core, Lighthouse CI                                |
| Hosting        | Vercel + Cloudflare DNS (database location per [SRS §13.3](docs/SRS.md#133-data-residency)) |
| Tooling        | pnpm, Node.js 22 LTS, GitHub Actions                                                        |

## Getting started

### Prerequisites

- Node.js **22 LTS** (`node -v`)
- pnpm **9+** (`corepack enable`)
- PostgreSQL **16+** running locally, or Docker
- Git

### Setup

```bash
git clone <repo-url> universal-bridge
cd universal-bridge

pnpm install
cp .env.example .env.local          # then fill in the values

# Start a local database (if you don't run Postgres yourself)
docker run --name ub-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=universal_bridge -p 5432:5432 -d postgres:16

pnpm db:migrate                      # apply migrations
pnpm db:seed                         # load sample content and an admin user
pnpm dev                             # http://localhost:3000
```

- Website: <http://localhost:3000>
- CMS / admin: <http://localhost:3000/admin>
- Storybook: `pnpm storybook` → <http://localhost:6006>

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real values.

| Variable                                                               | Required | Purpose                                                    |
| ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`                                                         | Yes      | PostgreSQL connection string                               |
| `PAYLOAD_SECRET`                                                       | Yes      | Secret for CMS sessions (long random string)               |
| `NEXT_PUBLIC_SITE_URL`                                                 | Yes      | Public base URL, e.g. `http://localhost:3000`              |
| `REVALIDATE_SECRET`                                                    | Yes      | Protects the cache revalidation endpoint                   |
| `RESEND_API_KEY`                                                       | Yes      | Sending email                                              |
| `EMAIL_FROM`                                                           | Yes      | Sender, e.g. `Universal Bridge <hello@universalbridge.rw>` |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`                          | Yes      | Bot protection on forms                                    |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Yes      | Media and upload storage                                   |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`                  | Yes      | Rate limiting                                              |
| `SENTRY_DSN`                                                           | No       | Error tracking                                             |
| `PLAUSIBLE_DOMAIN`                                                     | No       | Analytics                                                  |
| `CAL_LINK`                                                             | No       | Discovery-call booking                                     |
| `CRM_WEBHOOK_URL`                                                      | No       | Send leads to the CRM                                      |
| `CRON_SECRET`, `RATE_LIMIT_SALT`                                       | Yes      | Protects the cron routes; salts rate-limit keys            |
| `S3_PRIVATE_BUCKET`                                                    | Yes      | Private bucket for CVs (5-minute signed downloads)         |
| `CLAMAV_HOST`                                                          | Yes      | Virus scanner for uploads (`host:port` of clamd)           |
| `MFA_ENFORCEMENT`, `MFA_ENCRYPTION_KEY`                                | No       | Staff two-step verification (see below)                    |
| `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID`      | No       | Staff single sign-on                                       |
| `SSO_ALLOWED_DOMAINS`                                                  | No       | Email domains allowed to use SSO                           |

For local work, Turnstile has [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) that always pass.

## Scripts

| Command               | What it does                                                   |
| --------------------- | -------------------------------------------------------------- |
| `pnpm dev`            | Start the dev server (Turbopack)                               |
| `pnpm build`          | Production build                                               |
| `pnpm start`          | Run the production build                                       |
| `pnpm lint`           | ESLint                                                         |
| `pnpm format`         | Prettier (write)                                               |
| `pnpm typecheck`      | `tsc --noEmit`                                                 |
| `pnpm test`           | Unit and integration tests (Vitest)                            |
| `pnpm test:e2e`       | End-to-end tests (Playwright)                                  |
| `pnpm storybook`      | Component library                                              |
| `pnpm db:migrate`     | Apply database migrations                                      |
| `pnpm db:seed`        | Load sample data                                               |
| `pnpm generate:types` | Regenerate Payload TypeScript types after changing collections |

## Project structure

```
universal-bridge/
├─ docs/
│  ├─ SRS.md                  # requirements (source of truth)
│  └─ adr/                    # architecture decision records
├─ public/                    # favicons, static files
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/[locale]/ # public pages
│  │  ├─ (payload)/admin/     # CMS admin
│  │  ├─ api/                 # webhooks, health check
│  │  ├─ sitemap.ts, robots.ts, manifest.ts
│  │  └─ opengraph-image.tsx
│  ├─ components/
│  │  ├─ ui/                  # shadcn primitives
│  │  ├─ brand/               # Logo, Monogram, CircuitLines
│  │  ├─ blocks/              # CMS page-builder blocks
│  │  └─ layout/              # Header, Footer, MegaMenu
│  ├─ features/               # one folder per feature
│  │  └─ <feature>/           # actions.ts, schema.ts, components/, emails/
│  ├─ collections/            # Payload collections
│  ├─ globals/                # Payload globals (nav, footer, settings)
│  ├─ i18n/                   # next-intl config + messages/{en,fr,rw}.json
│  ├─ lib/                    # db, email, rate-limit, seo, utils
│  ├─ styles/globals.css      # Tailwind + design tokens
│  └─ proxy.ts                # locale detection, redirects
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ payload.config.ts
└─ .env.example
```

Rules of thumb:

- Pages are **Server Components** by default. Add `"use client"` only for interactivity.
- Feature code stays in `src/features/<feature>`. Only truly shared code goes in `components/` or `lib/`.
- Every form has **one Zod schema** in `schema.ts`, used on both client and server.

## Brand and design tokens

Defined in `src/styles/globals.css` with Tailwind's `@theme`. Full rules are in [SRS §4](docs/SRS.md#4-brand--design-system-requirements).

| Token           | Value*    | Use                                  |
| --------------- | --------- | ------------------------------------ |
| `ub-blue-600`   | `#0B47C1` | Primary: logo, buttons, links        |
| `ub-blue-700`   | `#0036A3` | Hover, solid brand backgrounds       |
| `ub-navy-900`   | `#0A1633` | Dark sections, footer, dark mode     |
| `ub-orange-500` | `#FF7A00` | Accent only (about 10 % of a screen) |

\* Estimated from artwork; confirm against the master logo files before release.

- Fonts: **Plus Jakarta Sans** (headings), **Inter** (body), **JetBrains Mono** (code), loaded with `next/font`.
- Logo: use the SVG components in `src/components/brand`. Never stretch, recolour or re-type the logo.
- Visual motif: circuit lines ending in ringed nodes, and the diagonal "bridge" cut.
- Light and dark themes are both required.
- Motion must respect `prefers-reduced-motion`.

## Content and the CMS

- **All marketing copy lives in the CMS.** Don't hard-code text in components (UI labels go in `messages/*.json`).
- Publishing a document revalidates its pages by cache tag. Changes should be live in under a minute.
- Alt text is required on every image.
- **No placeholder text in production.** CI fails on "lorem", "ipsum", "TODO" or "placeholder" in content.
- Testimonials need written client approval. Stats must be accurate and dated.
- Concept renders (AI images) must be labelled as concepts. Use real photos for real offices and people.

### Company dashboard (`/office`)

The admin (`/admin`) manages content. The office runs the company. Staff sign in once at **`/login`** (`/admin/login` redirects there) and land in the office; each person can choose the CMS instead under **My profile → Open after sign-in** (default for everyone: Settings → Accounts). The CMS is one click away in the sidebar. Each section appears only for people whose role grants it (see **Roles & permissions** below):

| Section           | What it's for                                                                                                                                                                                                                    | Roles                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Overview          | This week's numbers against last week, open pipeline value, average first-reply time, a 30-day activity chart, "Needs attention" (requests unanswered for 24 h, overdue follow-ups, applicants waiting 3+ days), latest activity | everyone                                             |
| Service requests  | Drag-and-drop pipeline (New → Contacted → Qualified → Proposal → Won/Lost), cards coloured by reply urgency, list view, "only mine", CSV                                                                                         | sales                                                |
| Demo requests     | "Request a demo" submissions grouped by product                                                                                                                                                                                  | sales                                                |
| Messages          | Contact-form messages for the Academy, careers, partnerships, press and support, with department tabs and unread state                                                                                                           | sales                                                |
| Request detail    | Message and details, Email / Call / WhatsApp, stage, owner, estimated value, next follow-up, team notes, "Start a project" once won                                                                                              | sales                                                |
| Applicants        | Pipeline boards for trainees, interns, job seekers, partners and event sign-ups, plus seats per intake. Detail pages show answers, CVs (only after the virus scan), guardian consent, a 1–5 screening score, reviewer and notes  | academy, hr, sales, editor (each sees its own types) |
| Projects & tools  | Client projects, internal tools and products: progress, health, due dates, team, milestones that update progress, budget, and demand per product                                                                                 | sales (edit), hr (read)                              |
| Employees         | Directory, headcount by department, joiners and leavers, reporting lines, skills, HR notes, the projects each person is on                                                                                                       | hr                                                   |
| Website analytics | Visitors now (live), visitors, page views, sessions, bounce rate, pages per session, conversion rate, trend chart, top pages, sources and campaigns, countries, devices, browsers and languages, over 7, 30 or 90 days           | everyone with a staff role                           |

Every board page follows the same three steps:

1. Summary numbers.
2. Category cards: requests by service, messages by department, applicants by type, openings by kind, projects by type, employees by department. Each card has a bar of its items by stage.
3. A status board where cards are dragged, or moved from their menu, to another stage. A list (or card) view is one click away.

| Admin section       | What it's for                                                                                                                                                                                                                                                                                                                        | Permission                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Openings            | Intakes, internships, jobs, partner programmes and events people apply to: dates, seats, status board, and a drag-and-drop **form builder** (11 question types, suggested questions per kind, live preview). Each opening gets a public page at `/apply/{slug}`, and applications link back to it.                                   | `openings.view` / `openings.manage` |
| Accounts            | Staff (invite, roles, unlock, remove) and website members (role).                                                                                                                                                                                                                                                                    | `users.manage` / `members.manage`   |
| Roles & permissions | Every role × every permission as a switch matrix, with coverage per group; create, rename, colour and delete roles. Built-in roles (super, editor, academy, hr, sales, visitor, applicant) are created at start-up and can't be deleted.                                                                                             | `roles.manage`                      |
| System logs         | Who did what, to which record, and when, written as sentences ("Grace moved L-8K2 from new → contacted"). Includes a 14-day chart by category, the most active people, alerts (deletions, blocked sign-ins, erasures), filters, the anonymised network and device in the details, and a CSV export.                                  | `audit.view`                        |
| Settings            | Email sender and inboxes, registration and member roles, workflow (reply target, follow-up, board size, currency, applicant emails), upload limits and virus scanner, integrations (analytics, booking, CRM and team webhooks), retention periods, search-engine visibility, plus a read-only check of which server secrets are set. | `settings.manage`                   |
| My profile          | Name, title, phone, profile picture (drag and drop), password change with a strength meter, signed-in devices (sign out the others), permissions held, an 18-week activity heatmap and recent actions.                                                                                                                               | everyone                            |

**Roles & permissions.** Access is permission-based. A role (the `roles` collection) is a named set of permissions from `src/access/permissions.ts`. Collections, office pages, CSV exports, live editing and the CMS itself (`cms.access`) all check permissions, and super admins hold all of them. Only a super admin can give or take away the super admin role.

**Website accounts.** People can register at `/account/register` (switch: Settings → Accounts). New accounts get the **visitor** role, and their first application promotes them to **applicant**. At `/account` they follow each application through its stages and edit their profile. Member accounts (`members` collection) are separate from staff accounts and never reach the office or the CMS.

**Working in the office.**

- **Overview by role.** The home page shows only what the person's role covers:
  - KPI tiles with 14-day sparklines;
  - incoming work over 30 days;
  - "Your day" (overdue replies, follow-ups due, openings closing, intakes starting, projects due, applicants waiting);
  - the sales funnel with values, request sources, win rate and reply-time gauges;
  - applicants by stage and type, open openings with seats filled;
  - project health and delivery, the team by department;
  - website visitors and top pages;
  - recent activity.

  Each section streams in on its own.

- **Several roles?** The role switcher in the top bar lets someone work as one of their roles (or all of them). The office, the CMS and the API then follow only that role's permissions. Switching can only narrow access, never widen it.
- **Notifications.** The bell shows new requests, applicants and assignments for your role, plus "Upcoming" items worked out live (follow-ups due, replies past the target, openings closing, intakes starting, projects due). It checks every 45 seconds. The full list is at `/office/notifications`.
- **Search everything.** Press `/` or ⌘K for the command palette, or open `/office/search`. Search covers:
  - requests, including messages and notes;
  - applicants, including form answers and notes;
  - openings, projects, people, staff and member accounts, roles, subscribers and certificates;
  - website content in every language.

  Every word must match. Results show where the match was, highlighted, and only include what the active role may open.

- **Navigation.** Sidebar sections fold, and the current one stays open. On phones and tablets the menu is a drawer, filters fold behind a "Filters" button, and category cards scroll sideways. A thin progress line at the top shows a page is loading, and skeletons fill each page until its data arrives.
- **Forms.** All inputs, selects and text areas share one size and style. Select lists open as floating panels, and menus render above tables and cards so nothing clips them.

**Maintenance mode** (Settings → Website): visitors get a "back soon" page with your message and expected time (HTTP 503 with `Retry-After`, so search engines wait). Signed-in staff still see the site, and the office shows a red banner while it's on. The switch takes effect within 15 seconds.

**Lists.** Every list has instant search, filters, sorting, page size (10/25/50/100) and pagination, all kept in the URL so a filtered view can be bookmarked or shared. "Clear" resets the filters. Boards apply the same filters, and long boards link to the full list.

| List                        | Filters                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Service requests            | stage, owner (me / unassigned / person), service, budget, follow-up (overdue / this week / none), received from–to |
| Demo pipeline (per product) | stage, owner, received from–to                                                                                     |
| Messages                    | department tabs, state (unread / in progress / closed), owner, received from–to                                    |
| Applicants                  | type tabs, stage, program / role / event, intake, minimum score, reviewer, under 18, applied from–to               |
| Projects & tools            | type tabs, status (finished hidden by default), health, lead, due (overdue / next 30 days / none)                  |
| Employees                   | department, status (former hidden by default), employment, reports to, skill                                       |

**Working faster:**

- Press **⌘K / Ctrl+K** (or **/**) anywhere to search requests, applicants, projects and people, jump to a page, or run an action.
- Press **g** then a letter to jump straight to a section: **o** overview, **r** requests, **d** demos, **m** messages, **a** applicants, **e** employees, **p** projects, **w** analytics.
- The theme switch in the top bar offers light, dark (a deep blue-tinted dark) or system. The choice is shared with the website.
- The office and the CMS use the website's typefaces (Inter for text, Plus Jakarta Sans for headings), with a compact type scale suited to a working tool.

Changes go through Payload as the signed-in person, so access rules, the audit log and applicant status emails behave exactly as in the admin.

**Analytics and privacy.** Page views are first-party and recorded only after a visitor accepts analytics in the cookie banner. No cookie is set and no IP address is stored. Unique visitors are counted with a hash that changes every day, so nobody can be followed across days. Bots and signed-in staff aren't counted. Raw page views are deleted after 13 months by the monthly retention job.

### Editing on the page (live editing, CMS-07)

Staff with an editing role can change text and images directly on the site, seeing exactly what visitors will see:

1. In the admin, click **Edit site live** in the nav, or **Preview** on any page, service, program, post, event, etc. The site opens in edit mode for your browser only.
2. Editable text and images have a dashed outline. Click text and type. **Enter** keeps the change, **Esc** cancels, and **Shift + Enter** adds a line break in longer text. In titles, wrap a word in `*asterisks*` to colour it orange. Click an image to pick another from the media library, or upload one (a description is required).
3. Changes collect in the toolbar at the bottom: **Undo**, **Save draft** (Ctrl/Cmd + S) and **Publish**. Drafts are private; visitors see a change only after **Publish**. The ⋯ menu has **Open in admin**, **Hide outlines**, **Discard unsaved changes** and **Exit live editing**.
4. If someone else saved the same page after you opened it, saving stops and offers **Keep mine** or **Load theirs**.

What stays in the admin: page structure (adding, removing or reordering sections), rich text (articles, legal pages), links and URLs, SEO settings and site-wide settings. Edits apply to the language of the page you're on; editing a language that has no translation yet starts it from the English text.

How it works: edit mode is Next.js draft mode plus a staff session. Pages then render drafts uncached, and editable values carry a `data-edit` reference (collection, id, language, path with row ids). The editor (`src/lib/fx/liveedit.ts`) loads only in edit mode, so visitors download nothing extra. Saves go to `/api/live-edit/save`, which checks every path against the collection's field config, applies the user's access rules, validates values and records the change in the audit log.

## Languages

- Locales: `en` (default), `fr`, `rw`.
- URLs: `/fr/...`, `/rw/...`; English has no prefix.
- UI strings: `src/i18n/messages/{en,fr,rw}.json`. When you add a key, add it to all three files (English is the fallback).
- Content translation is done per field in the CMS.
- Format dates, numbers and money with `Intl` / next-intl helpers, never by hand.

## Coding standards

- TypeScript `strict`. Avoid `any`; if you must use it, add a comment explaining why.
- ESLint + Prettier run on commit (Husky + lint-staged).
- Names: `PascalCase` components, `camelCase` functions and variables, `kebab-case` file names and route folders.
- Validate all input on the server with Zod, even if the client already did.
- Use `next/image` for images and `next/link` for internal links.
- Accessibility is part of "done": semantic HTML, labels on every input, visible focus, keyboard support.

## Git workflow

- `main` → production, `develop` → staging. Work on short-lived branches:
  `feat/academy-apply-form`, `fix/header-focus-trap`, `chore/deps`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(academy): add intake waitlist`.
- Every PR needs a passing CI run, a Vercel preview, and one approving review.
- Link the SRS requirement ID in the PR description (e.g. `Implements FR-ACA-03`).

### Definition of done

- [ ] Meets the acceptance criteria in the SRS
- [ ] Types, lint and tests pass
- [ ] Works at 360 px to 1920 px, in light and dark themes
- [ ] axe reports no serious or critical issues
- [ ] SEO metadata set; content editable in the CMS
- [ ] Reviewed and approved on the preview deployment

## Testing and quality gates

| Check              | Tool            | Target                                                                                        |
| ------------------ | --------------- | --------------------------------------------------------------------------------------------- |
| Unit / integration | Vitest          | ≥ 70 % coverage on `lib/` and server actions                                                  |
| End-to-end         | Playwright      | The 10 critical journeys in [SRS §14.2](docs/SRS.md#142-critical-user-journeys-must-pass-e2e) |
| Accessibility      | axe-core        | WCAG 2.2 AA, no serious/critical issues                                                       |
| Performance        | Lighthouse CI   | Performance ≥ 95; Accessibility, Best Practices, SEO = 100                                    |
| Bundle size        | Bundle analyser | First-load JS ≤ 120 KB gzip on marketing pages                                                |
| Secrets            | gitleaks        | No secrets in the repo                                                                        |

CI blocks the merge if any check fails.

## Environments and deployment

| Environment | URL                                                | Deploys when                      |
| ----------- | -------------------------------------------------- | --------------------------------- |
| Local       | `localhost:3000`                                   | —                                 |
| Preview     | `*.vercel.app`                                     | A PR is opened or updated         |
| Staging     | `staging.universalbridge.rw` (password, `noindex`) | Merge to `develop`                |
| Production  | `universalbridge.rw`                               | Merge to `main` + manual approval |

**Content written outside the CMS editor.** Publishing in Payload refreshes the cached pages automatically. Content written any other way (`pnpm db:seed`, scripts, SQL) doesn't, so cached pages keep showing the old content, or a 404 for pages that didn't exist at build time, until they are refreshed. `pnpm db:seed` refreshes the site at `NEXT_PUBLIC_SITE_URL` when it finishes. For any other running build (a second local server, or a deployment), call:

```bash
curl -X POST "$SITE/api/revalidate" -H "authorization: Bearer $REVALIDATE_SECRET" \
  -H "content-type: application/json" -d '{"tags":["pages","sitemap","search-index"]}'
```

Locally you can instead delete `.next-prod/cache/fetch-cache` before `next start`.

**Database migrations.** Development pushes schema changes automatically. Staging and production use migrations: the Vercel build runs `pnpm db:migrate` before `pnpm build`. After changing a collection, run `pnpm db:migrate:create <name>` and commit the files in `src/migrations/`.

**Scheduled jobs** (`vercel.json`, all protected by `CRON_SECRET`):

| Route                 | When         | Does                                                           |
| --------------------- | ------------ | -------------------------------------------------------------- |
| `/api/cron/outbox`    | Every minute | Sends queued emails, team alerts and virus scans               |
| `/api/cron/jobs`      | Every 5 min  | Scheduled publishing and unpublishing                          |
| `/api/cron/retention` | Monthly      | Deletes expired personal data (SRS §11). `?dry=1` only reports |

**Start-up check.** In production the server refuses to start if a required setting is missing or still an example value, and logs a warning for recommended ones (`src/lib/env.ts`). `/api/health` reports the database and whether emails are stuck.

Old URLs from the current site (`/team`, `/agents`, `/application`, …) must keep working through 301 redirects. See [SRS §5.3](docs/SRS.md#53-legacy-url-redirects-301).

## Security and privacy

The site handles personal data (applications, CVs, leads), so it must follow **Rwanda Law No. 058/2021** on personal data protection. See [SRS §13](docs/SRS.md#13-security-privacy--compliance).

- Never commit secrets. Use `.env.local` locally and the hosting provider's secret store elsewhere.
- Forms: Turnstile, honeypot, rate limiting, and an unticked consent box.
- Uploaded files go to a **private** bucket and are only shared through short-lived signed links.
- Don't log personal data. Server errors go to Sentry (`SENTRY_DSN`) with the error and route only: no request bodies, cookies or query strings.
- Analytics and other non-essential scripts load only after cookie consent.
- A data breach must be reported to the NCSA within **48 hours**. Tell the CTO immediately if you suspect one.
- Report security issues privately to the CTO, not in public issues.

### Staff accounts and sign-in (ADM-01, NFR-SEC-05)

- **Adding staff** (office → Accounts → Add staff). Someone with `users.manage` sends an invitation: the person gets an email to set their own password. A super admin can instead create the account with a password typed in (or generated), with no email sent. By default the person must choose their own password at first sign-in: until they do, the office opens only their profile. Passwords need at least 12 characters and can't be common or contain the person's name or email.
- **Sign-in** is email and password for now. Two-step verification and Google/Microsoft SSO are built but **switched off** until UB decides to roll them out:
  - Two-step verification: set `MFA_ENFORCEMENT=required` (every account) or `enrolled` (opt-in). Staff then enrol at `/staff/mfa` with an authenticator app and get 10 recovery codes; sessions that haven't passed the step can't open the admin or the API (`401 MFA_REQUIRED`). A super admin resets it by unticking "Two-step verification" on the user.
  - SSO: set `SSO_ENABLED=1` plus the Google and/or Microsoft client id and secret, and register `{NEXT_PUBLIC_SITE_URL}/api/sso/{google|microsoft}/callback` with the provider. It signs in existing staff accounts only (optionally limited by `SSO_ALLOWED_DOMAINS`).
- **Limits.** Sessions last 8 hours. Accounts lock for 15 minutes after 5 wrong passwords, and sign-in and password resets are rate limited per IP and per email.
- **Audit.** Sign-ins, record changes (with from → to), role and permission changes, settings, CSV exports and privacy requests are in the office's **System logs**. IP addresses are shortened (the last block is dropped) before they are stored.

### Personal data tools (ADM-06, ADM-09)

- **CSV export:** "Export CSV" above the Leads, Applications and Subscribers lists. Each role exports only what it can see, and every export is logged.
- **Data-subject requests:** Privacy requests in the admin nav (super admins). Find everything held for an email address, download it as JSON, or erase it. Certificates are kept as proof of qualification and are listed so staff can tell the person.
- **Applicant emails:** moving an application to shortlisted, accepted, rejected or waitlisted emails the applicant in their language, unless "Email the applicant" is unticked.

## Open decisions

These must be settled before the build is signed off. Details in [SRS §16](docs/SRS.md#16-open-issues--assumptions).

- Final tagline
- Which company stats are accurate
- Official domains and company-domain email
- Whether the Academy has its own domain
- Which products are public (beyond Nyambika Design)
- Real photos to replace AI renders
- Master logo files and exact colours
- NCSA registration and where the database is hosted
- Confirmed leadership names and official phone numbers

## Contact

**Universal Bridge Ltd**
1st floor, Maison Voisin Building, 11 KN 89 St, Nyabugogo–Muhima Road, Kigali, Rwanda

- Web: [universalbridge.rw](https://universalbridge.rw)
- Products: [Nyambika Design](https://nyambika.com)

---

© Universal Bridge Ltd. All rights reserved.
