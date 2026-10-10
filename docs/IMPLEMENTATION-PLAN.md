# Implementation Plan

## Universal Bridge Ltd — Website & Digital Platform

| Field | Value |
|---|---|
| Document ID | UB-WEB-IMP-001 |
| Version | 1.0 (Draft) |
| Date | 2026-10-09 |
| Companion to | [SRS.md](SRS.md) (what) · [UI-UX-PLAN.md](UI-UX-PLAN.md) (how it feels) · [README.md](../README.md) (developer handbook) |
| Audience | Engineering, design, content and UB leadership |

The SRS says **what** to build. The UI/UX plan says **how it should look and feel**. This plan says **in what order, by whom, with which technical decisions, and how we know each step is finished**. If this plan and the SRS disagree on scope, the SRS wins. New ideas in [§8](#8-innovation-proposals) are proposals until they are approved through change control ([SRS §15.3](SRS.md#153-change-control)).

---

## Contents

1. [Summary](#1-summary)
2. [How this plan works](#2-how-this-plan-works)
3. [Team and workstreams](#3-team-and-workstreams)
4. [Timeline at a glance](#4-timeline-at-a-glance)
5. [Sprint-by-sprint plan](#5-sprint-by-sprint-plan)
6. [Architecture decisions the docs leave open](#6-architecture-decisions-the-docs-leave-open)
7. [Changes to the UI/UX tech choices](#7-changes-to-the-uiux-tech-choices)
8. [Innovation proposals](#8-innovation-proposals)
9. [CI/CD pipeline and quality gates](#9-cicd-pipeline-and-quality-gates)
10. [Content and translation track](#10-content-and-translation-track)
11. [Launch and cutover](#11-launch-and-cutover)
12. [After launch](#12-after-launch)
13. [Risks](#13-risks)
14. [Decisions needed and when](#14-decisions-needed-and-when)

---

## 1. Summary

- **15 working weeks (week 0 + seven 2-week sprints) + 1 holiday buffer week.** Kick-off Monday **2026-10-12**, staging beta (M3) on **2027-01-08**, launch on **Tuesday 2027-01-26**. This sits inside the SRS estimate of 12–15 weeks.
- **Design runs one sprint ahead of build**, so the work overlaps instead of running design → build in series. That is how the SRS phases (Design 2–3 weeks, Foundation 1 week, Core build 4–5 weeks) fit in 14 weeks.
- **Build in vertical slices, riskiest first.** The first feature built end to end is the **project inquiry** (form → database → email outbox → admin inbox). It proves the plumbing that every other form reuses, and it serves the main business goal (BO-1 leads).
- **Content, not code, is on the critical path.** Case studies, real photos, accurate stats and translations have their own track from week 0, with a weekly readiness board ([§10](#10-content-and-translation-track)).
- **Five technical decisions are made in week 0 as ADRs.** Data residency is the most important. It changes where the database lives and which Vercel region runs the server code ([§6](#6-architecture-decisions-the-docs-leave-open)).
- **Some planned tech is swapped for lighter options**, saving roughly 250 KB of JavaScript with the same look ([§7](#7-changes-to-the-uiux-tech-choices)). Examples: a 5 KB globe library instead of three.js, and CSS sticky scroll before GSAP.
- **12 innovation proposals** ([§8](#8-innovation-proposals)) give UB things competitors don't have: signed certificates holders can add to LinkedIn, sourced and dated stats, a guided project scoper, save-and-resume applications, a working-hours overlap widget and a public page showing this site's own speed scores. Most are small and reuse parts we already have to build.

---

## 2. How this plan works

### 2.1 Principles

1. **Vertical slices over layers.** Each sprint ends with something a visitor or admin can use on staging, not "the database layer is done".
2. **Every task links to a requirement ID** (`FR-…`, `NFR-…`, `CMS-…`). If a task has no ID, it is either an [innovation proposal](#8-innovation-proposals) or out of scope.
3. **Static first, effects later.** Every page ships complete without its signature animation. Effects are added in Sprint 5 as progressive enhancement, so a late effect never blocks launch.
4. **Real content from day one.** Seed data uses real UB services and programs, never lorem ipsum. The placeholder scan (CNT-02) runs in CI from Sprint 1.
5. **Budgets are enforced, not hoped for.** Lighthouse CI and bundle limits block merges from the first page built.

### 2.2 Cadence

| Ritual | When | Who |
|---|---|---|
| Sprint planning | Monday, week 1 of each sprint | Whole team + UB product owner |
| Stand-up | Daily, 15 min | Engineering + design |
| Design review on preview deploy | Every PR touching UI | Designer |
| Content readiness board | Weekly, Thursday | Content lead + UB Marketing |
| Sprint demo on staging | Friday, week 2 of each sprint | Team + UB leadership |
| Retro | After demo | Team |

### 2.3 Definition of done

The [README definition of done](../README.md#definition-of-done), plus:

- Requirement ID(s) in the PR description
- Storybook story for any new component (light + dark)
- Reduced-motion behaviour checked for anything that moves
- Works with JavaScript off for any page or form (FR-FORM-10)

---

## 3. Team and workstreams

Recommended minimum team. One person can hold two roles where noted.

| Role | FTE | Owns |
|---|---|---|
| Tech lead / senior full-stack | 1 | Architecture, ADRs, CMS, server actions, security, CI, code review |
| Frontend engineer (motion focus) | 1 | Design system, components, templates, signature interactions, performance |
| Full-stack engineer | 1 | Forms, admin dashboard, academy, certificates, integrations |
| Product designer | 1 (0.5 after Sprint 4) | Figma tokens, templates, motion specs, design QA |
| Content lead / copywriter | 0.5–1 | Copy, case studies, photo shoot brief, translation coordination |
| QA (can be shared with the tech lead) | 0.5 from Sprint 3 | E2E journeys, accessibility and device testing |
| UB product owner | ~4 h/week | Decisions, approvals (assumption A-1: 3 business days) |

Four workstreams run in parallel:

```
Design      ▓▓▓▓ tokens ▓▓▓▓ templates ▓▓▓▓ motion specs ▓▓ design QA ▓▓▓▓▓▓▓▓
Platform    ▓▓ foundation ▓▓▓ forms/outbox ▓▓▓ admin/security ▓▓▓ hardening ▓▓
Experience  ▓▓▓ components ▓▓▓ templates ▓▓▓▓ signature moments ▓▓ polish ▓▓
Content     ▓ inventory ▓ photo shoot ▓▓ case studies ▓▓ translations ▓▓ QA ▓▓▓
```

---

## 4. Timeline at a glance

| Sprint | Weeks | Dates | Theme | Milestone |
|---|---|---|---|---|
| **S0** | 0 | Oct 12 – Oct 16 | Discovery, decisions, spikes | M1 SRS approved |
| **S1** | 1–2 | Oct 19 – Oct 30 | Foundation + design system | |
| **S2** | 3–4 | Nov 2 – Nov 13 | Shell + first vertical slice (project inquiry) | |
| **S3** | 5–6 | Nov 16 – Nov 27 | Marketing templates + SEO | M2 Design approved (all templates) |
| **S4** | 7–8 | Nov 30 – Dec 11 | Academy, careers, certificates | |
| **S5** | 9–10 | Dec 14 – Dec 23 | Signature moments + remaining pages | |
| — | — | Dec 24 – Jan 1 | **Holiday buffer** (catch-up only, no new scope) | |
| **S6** | 11–12 | Jan 4 – Jan 15 | Admin, compliance, hardening | **M3 Beta on staging (Jan 8)** |
| **S7** | 13–14 | Jan 18 – Jan 29 | UAT, training, launch | **M4 Launch (target Jan 26)** |
| — | +30 days | Late Feb 2027 | Review | M5 30-day review |

The M3 date lands mid-S6 on purpose: all Must features are on staging by then, and the rest of S6 is fixing what UAT finds.

---

## 5. Sprint-by-sprint plan

### S0 — Discovery, decisions, spikes (week 0)

**Goal:** remove the decisions that would block S1–S2, and prove that the riskiest effects are fast enough.

| Track | Task | Output |
|---|---|---|
| Decisions | Workshop with MD on blocking open issues: OI-02 stats, OI-03 domains/email, OI-04 academy domain, OI-07 logo files, OI-08 data residency, OI-11/12 leadership & phones | Decision log; see [§14](#14-decisions-needed-and-when) |
| Architecture | Write ADR-001 to ADR-005 ([§6](#6-architecture-decisions-the-docs-leave-open)) | `docs/adr/` |
| Spike | Latency test: Vercel function (Cape Town `cpt1` and Frankfurt `fra1`) → candidate Rwandan Postgres host | Numbers that feed ADR-001 |
| Spike | Circuit-field canvas + sticky pinned story + View Transitions on a throwaway page; measure on a real mid-range Android (Samsung A-series) at 4× CPU throttle | Go / simplify decision per effect |
| Content | Content inventory of the current site; list of case-study candidates (OI-13); photo-shoot brief and date (A-2) | Content readiness board |
| Ops | Domain, DNS on Cloudflare, company Google Workspace or M365 mailboxes (INT-02), Resend domain verification started (DNS propagation takes time) | Accounts list in the password manager |
| Design | Moodboard, 3 hero directions (UI/UX §19 phase A) | Chosen direction |

**Exit:** M1. Blocking OIs resolved or accepted as assumptions; ADRs merged; spikes reported.

### S1 — Foundation + design system (weeks 1–2)

**Goal:** a deployable, empty-but-real site with every quality gate already running.

| Area | Tasks | Req IDs |
|---|---|---|
| Repo & tooling | Next.js 16 + TypeScript strict + pnpm + Turbopack; ESLint/Prettier, Husky + lint-staged, Conventional Commits; Renovate | NFR-MNT-01/02/05 |
| CI | GitHub Actions pipeline ([§9](#9-cicd-pipeline-and-quality-gates)) with typecheck, lint, unit, build, gitleaks, placeholder scan, Lighthouse CI, bundle limit | NFR-PERF-07, NFR-SEC-07, CNT-02 |
| Environments | Vercel project, preview per PR, `develop` → staging (password + `noindex`), `main` → production (manual approval) | §10.5, SEO-09 |
| CMS | Payload 3 inside Next.js, Postgres adapter, migrations, seed script, Media collection with required alt text, S3 storage adapter | CMS-01, CMS-09 |
| i18n | next-intl with `en` / `fr` / `rw`, `as-needed` prefix, cookie override; Payload localisation with EN fallback | I18N-01/02/03/05, CMS-05 |
| Proxy | `proxy.ts`: locale negotiation, legacy 301 map from a single tested table | §5.3, SEO-06 |
| Security baseline | Nonce-based CSP, security headers, HSTS, `security.txt` | NFR-SEC-01/02/11 |
| Tokens | `tokens/global.css`, `alias.light.css`, `alias.dark.css`, `motion.css`, Tailwind `@theme` mapping, `springs.ts`, fonts via `next/font` | UI/UX §5, §7, §9 |
| Theme | `next-themes`, no flash, toggle | FR-GL-06 |
| Storybook | Storybook with a11y addon; light/dark toolbar; Chromatic or Playwright screenshots | §4.7 |
| Brand | `Logo`, `Monogram` SVG components (from master files, OI-07) | §4.4 |
| Monitoring | Sentry with PII scrubbing; Better Stack uptime on staging | NFR-REL-04/05 |

**Design during S1:** Figma variables (tokens), component library with all states, wireframes for Home, Service, Case study, Contact.

**Exit:** a "hello" home page on staging in three languages and two themes, Lighthouse 100/100/100/100, every CI check blocking.

### S2 — Shell + first vertical slice (weeks 3–4)

**Goal:** the site frame is finished, and one real lead can travel from visitor to admin inbox to email.

| Area | Tasks | Req IDs |
|---|---|---|
| Layout | Header (transparent → glass, hide on scroll), mega-menu (acrylic, keyboard), mobile drawer (focus trap), footer, breadcrumbs + JSON-LD, skip link, announcement bar | FR-GL-01/02/03/04/07/12, NFR-A11Y-02 |
| Switchers | Language switcher that keeps the current page; theme toggle | FR-GL-05/06 |
| Consent | Cookie banner (Reject as easy as Accept), consent store, script gating; Plausible/Umami after consent | FR-GL-10, PRV-04, INT-04 |
| Core components | Button, Input family, Phone (E.164, +250 default), Select/Combobox, Checkbox/Radio, Textarea, Toast, Modal/Sheet, Section header, Card base, Chip | §4.7, FR-FORM-07 |
| **Form platform** | Shared form kit: RHF + Zod (one schema in `schema.ts`), server action wrapper that does Turnstile → honeypot → rate limit → Zod → save → enqueue emails; error summary; works without JS | FR-FORM-01–06, 09, 10 |
| **Outbox** | `outbox` table + Payload Jobs Queue worker + Vercel Cron; retries with backoff; dead-letter view | NFR-REL-02 |
| Email | React Email base template (Daylight brand), confirmation + internal notification | INT-01, FR-FORM-05 |
| **Project inquiry** | Contact page with department routing and the inquiry form; UTM + referrer capture | FR-CON-01/02, §7.2 |
| Admin inbox v1 | Leads list + detail + status workflow (New → … → Won/Lost) in Payload admin | ADM-02/03 |
| E2E | Journeys 1 (partial), 9 and 10 | §14.2 |

**Design during S2:** hi-fi Home, Services, Case study, Contact (desktop + mobile, both themes). Wireframes for Academy, Program, Apply, Verify.

**Exit:** demo — submit an inquiry on a phone on staging, the email arrives, sales sees it in the admin and moves it to "Contacted".

### S3 — Marketing templates + SEO (weeks 5–6)

**Goal:** every lead-generating page exists with real CMS data, static version (no signature effects yet).

| Area | Tasks | Req IDs |
|---|---|---|
| Collections | Services, Industries, Case Studies, Technologies, Clients, Testimonials, FAQs, Products; globals for nav, footer, settings, stats, SEO defaults | CMS-02/03 |
| Page builder | Blocks: Hero, Rich text, Cards grid, Stats, Logo cloud, CTA band, Testimonials, FAQ, Media+Text, Timeline | CMS-04 |
| Caching | `"use cache"` + `cacheTag` per document; Payload `afterChange` hook calls `revalidateTag`; check < 60 s | CMS-08, NFR-PERF-05 |
| Drafts | Draft/publish, scheduled publish, versions, live preview via draft mode | CMS-06/07 |
| Home | All 13 sections in static form; stats from the Proof Ledger ([IX-01](#ix-01--proof-ledger-sourced-dated-stats)) | FR-HOME-01–13 |
| Services | Overview grouped by pillar + detail template with engagement models, tech stack, FAQ | FR-SRV-01–05 |
| Solutions | Industry template | FR-SOL-01/02 |
| Work | Listing with URL-param filters (streamed results) + detail template; anonymised client mode | FR-WORK-01–03 |
| Products | Listing with status badges + detail + Nyambika page + demo request form (reuses form kit) | FR-PRD-01–03 |
| Book a call | Cal.com embed lazy-loaded in a sheet, visitor time zone | FR-BOOK-01 |
| SEO | `generateMetadata` everywhere, hreflang + x-default, sitemap and robots from CMS, JSON-LD helpers (Organization, LocalBusiness, WebSite, Service, FAQPage, Product), dynamic OG images | SEO-01–05 |
| E2E | Journeys 1 (full), 2, 7, 8 | §14.2 |

**Design during S3:** hi-fi for every remaining template; motion specs for the five brand moments. **M2 at end of S3.**

**Exit:** an international CTO (P-1) can go Home → Service → Case study → Contact on staging with real content.

### S4 — Academy, careers, certificates (weeks 7–8)

**Goal:** everything that takes applications and files.

| Area | Tasks | Req IDs |
|---|---|---|
| Uploads pipeline | Direct-to-quarantine-bucket presigned upload → magic-byte check → virus scan → move to private bucket → signed URLs for admins only ([ADR-004](#adr-004--file-uploads-and-virus-scanning)) | FR-FORM-08, NFR-SEC-06 |
| Academy | Programs + Intakes collections; landing; listing with filters; program detail with Course JSON-LD; internships page | FR-ACA-01–04 |
| Apply | Multi-step form (You → Background → Program → Review); guardian consent when under 18; waitlist when intake is full; save & resume ([IX-07](#ix-07--save-and-resume-applications)) | FR-ACA-05/06, PRV-08 |
| Careers | Jobs collection, listing, detail with JobPosting JSON-LD, apply with CV, open application | FR-CAR-01–03 |
| Partners | Partner page, agent tiers (pending OI-10), partner application | FR-PRT-01 |
| Newsletter | Double opt-in with the email provider | §7.2, INT-07 |
| Certificates | `certificates` table; ID generator `UB-YYYY-` + 10 random base32 characters; verify page + result page (uncached, rate-limited); signed QR ([IX-05](#ix-05--signed-certificates-you-can-add-to-linkedin)) | FR-CERT-01–03 |
| Certificate admin | Issue, CSV bulk import with dry-run preview, revoke with reason, print-ready PDF that matches the supplied certificate design | FR-CERT-04, ADM-07 |
| Admin inbox v2 | Applications inbox (academy, internship, job, partner) with their workflows; notes and assignment | ADM-02/03/04 |
| E2E | Journeys 3, 4, 5, 6 | §14.2 |

**Exit:** a student applies on a 3G-throttled phone; an admin shortlists them; an employer verifies a certificate by scanning its QR code.

### S5 — Signature moments + remaining pages (weeks 9–10)

**Goal:** the site goes from correct to memorable, and every page in the sitemap exists.

| Area | Tasks |
|---|---|
| Brand moments | Monogram intro (SVG + Motion), living circuit hero (canvas, lazy), Ideas → Code → Impact story ([§7](#7-changes-to-the-uiux-tech-choices)), capability bento with spotlight and mini demos, Kigali → World globe, case-study shared-element transition (feature flag), "Connected" form success |
| Micro-interactions | Pass through the UI/UX §11 catalogue: magnetic CTAs, link underlines, filter-chip morph + grid layout animation, toast trace, scroll progress trace, back-to-top ring |
| Command palette | ⌘K with a search index from the CMS ([ADR-005](#adr-005--site-search)) | FR-GL-08 |
| Remaining pages | Labs (3 hubs), About + timeline, Leadership + bio sheet, Events (Event JSON-LD) + registration form, Press + press kit ZIP, Insights (listing, post with ToC, Shiki code, Article JSON-LD, RSS), legal pages, 404 broken-bridge, 500 |
| Extras | WhatsApp button ([IX-04](#ix-04--context-aware-whatsapp)), time-zone overlap widget ([IX-03](#ix-03--your-hours--kigali-hours)), `llms.txt` + facts ([IX-09](#ix-09--ai-ready-content-layer)) |

Every effect is checked against its reduced-motion version, its mobile version and the Lighthouse budget before merge. An effect that misses the budget ships in its simpler form; it does not delay the sprint.

**Holiday buffer (Dec 24 – Jan 1):** catch-up only. No new features start.

### S6 — Admin, compliance, hardening (weeks 11–12)

**Goal:** safe to put real personal data in. M3 on Jan 8.

| Area | Tasks | Req IDs |
|---|---|---|
| Admin security | Roles (Editor, Academy, HR, Sales, Super), SSO Google/Microsoft, MFA, 8 h sessions, lockout | ADM-01, NFR-SEC-05 |
| Audit & data rights | Audit log on every admin action and export; role-limited CSV export; data-subject tool (find / export / delete a person across all tables and files) | ADM-06/08/09, PRV-05 |
| Retention | Monthly purge job (leads 24 months, applications and CVs 12 months) with a dry-run report | §11 |
| Status emails | Templated applicant status emails | ADM-05 |
| Lead SLA | Time-since-received, alerts ([IX-10](#ix-10--lead-sla-and-instant-alerts)) | INT-08 |
| Backups | Daily backups, 30-day retention, **restore drill** done and timed | NFR-REL-03 |
| Performance | Field-like testing on real devices; image audit (no image > 200 KB on mobile); bundle trim | NFR-PERF-01–06 |
| Accessibility | Full axe pass + manual NVDA and VoiceOver on all templates | NFR-A11Y-07 |
| Security | OWASP Top 10 review, ZAP baseline, header check, CSP report-only → enforce | NFR-SEC-10 |
| Print | Print stylesheet for case studies and programs | NFR-USE-04 |
| Content load | All launch content entered (CNT-03); FR/RW for core pages (I18N-06) | §12 |

**Exit:** M3 — all Must requirements on staging with real content; UAT starts.

### S7 — UAT, training, launch (weeks 13–14)

| Week | Tasks |
|---|---|
| 13 | UAT with UB staff; usability test (5 users per persona group: international buyer, local IT manager, student); fixes; editor training sessions 1 and 2 plus CMS handbook; legal review of policies done; NCSA registration confirmed |
| 14 | Production content freeze (Monday); cutover ([§11](#11-launch-and-cutover)); launch Tuesday morning Kigali time; 72 h watch |

**Exit:** M4 — every item on the [SRS §14.4 checklist](SRS.md#144-launch-acceptance-checklist) ticked.

---

## 6. Architecture decisions the docs leave open

These are written as ADRs in S0. Each has a recommendation.

### ADR-001 — Data residency and hosting topology

**Problem.** OI-08 / SRS §13.3 recommend Option A: personal data in Rwanda. But Payload stores **content and submissions in one Postgres database**, and Vercel has no Rwandan region. If the database is in Kigali and functions run in Frankfurt, every uncached read crosses continents.

**Recommendation: Option A, with one Rwandan Postgres, functions pinned to Cape Town, and aggressive caching.**

```
Visitor ─▶ Cloudflare ─▶ Vercel CDN (cached pages, served globally)
                              │  cache miss / server action / admin
                              ▼
                     Vercel Functions — region cpt1 (Cape Town)
                              │  ~30–50 ms (measure in S0)
                              ▼
                 Rwandan provider: PostgreSQL 16 + private object storage
                 (content, submissions, certificates, CVs)
```

- Public pages are served from the CDN, so database location barely affects visitors (NFR-PERF-05).
- Only cache misses, form submissions, verification lookups and admin use reach the database.
- **Fallback if S0 latency is bad:** split into two databases. Content stays with Payload on any host (it holds no personal data). Submissions, certificates and admin users move to a Rwandan database through Drizzle. This costs about 1 extra sprint-week, so we decide it in S0, not later.
- Option B (all in the EU after NCSA approval) needs only a config change, because the code does not depend on where the database is.

### ADR-002 — Background jobs and the email outbox

**Problem.** NFR-REL-02 needs an outbox, CMS-06 needs scheduled publishing, §11 needs a monthly purge, and the CRM webhook needs retries. Nothing in the stack runs background jobs yet.

**Recommendation:** **Payload Jobs Queue** (stored in Postgres, no new service) triggered every minute by **Vercel Cron** hitting a secret-protected route.

| Job | Trigger | Retry |
|---|---|---|
| `send-email` | Form submit, status change | 5× with exponential backoff, then dead-letter + Sentry alert |
| `crm-sync` | New lead | 5× |
| `notify-team` | New lead/application (Slack/Telegram) | 3× |
| `publish-scheduled` | Cron | — |
| `purge-expired` | Monthly cron | Dry-run report emailed to the Super Admin first |
| `scan-upload` | Upload finished | 3× |

The submission is saved **in the same database transaction** as its outbox rows, so a lead is never lost even if email is down.

### ADR-003 — Caching and revalidation

- Every CMS read goes through one `lib/cms/*` layer wrapped in `"use cache"` with `cacheTag(\`${collection}:${id}\`)` and a collection tag (`services`).
- Payload `afterChange` / `afterDelete` hooks revalidate the document tag, its collection tag and any pages that reference it (looked up from relationship fields).
- `cacheLife("max")` for content; the certificate result page is never cached.
- An E2E test (journey 7) asserts that an edit appears in under 60 s.

### ADR-004 — File uploads and virus scanning

NFR-SEC-06 asks for antivirus scanning, but no provider is named. This is a hidden cost and a hidden piece of infrastructure.

```
Browser ──presigned PUT──▶ quarantine bucket (no public read, 24 h expiry)
                               │ job: scan-upload
                               ▼
            magic-byte check + ClamAV (small container at the Rwandan host)
                     │ clean                     │ infected
                     ▼                           ▼
            private bucket (signed URLs, 5 min)   delete + flag submission + alert
```

- Files never pass through a Vercel function (avoids body-size limits and keeps uploads fast).
- The form submission only references the file after the scan passes; the applicant sees "Uploaded ✓" right away and the admin sees "Scanning…" for a few seconds.
- If the Rwandan host can't run a container, use a scanning API that has a data-processing agreement, and list it as a processor in the privacy policy.

### ADR-005 — Site search

The SRS names **Pagefind**, but Pagefind indexes static HTML files after a build, which doesn't fit cached server-rendered Next.js pages that change on CMS publish.

**Recommendation:** a cached route `/api/search-index.[locale].json` built from the CMS (title, summary, URL, type), revalidated by the same tags as content. The ⌘K palette loads it **on first open only**, together with a small client search library (Orama or MiniSearch, < 10 KB gzip). With fewer than 1,000 documents this is instant and costs nothing at first page load.

### Smaller decisions (no ADR needed)

| Topic | Decision |
|---|---|
| Rate limiting | Upstash with keys of **hashed** IP and email (SHA-256 + salt), so no raw personal data sits in a third-party store |
| Phone input | `libphonenumber-js` "min" metadata, lazy-loaded with the form |
| Dates | Store UTC; show in Kigali time for intakes and events, and in the visitor's time zone for booking |
| IDs | UUID v7 for submissions (sortable); certificate codes per FR-CERT-03 |
| Feature flags | Environment-variable flags for View Transitions, globe and ⌘K, so each can be switched off in production without a deploy rollback |

---

## 7. Changes to the UI/UX tech choices

These keep the same visual result as the UI/UX plan at a fraction of the cost. They are engineering changes, not design changes.

| UI/UX plan says | Proposed | Why |
|---|---|---|
| Globe with react-three-fiber + drei (≤ 250 KB) | **`cobe`** (~5 KB WebGL dotted globe with arcs and markers) | About 245 KB less JS, same dotted-globe look, runs on mid-range phones too, so mobile can get a real globe instead of a flat map |
| Pinned story with GSAP ScrollTrigger | **CSS `position: sticky` + `animation-timeline: view()`** first; GSAP only if the spike shows it is needed | Zero JS, runs off the main thread, no scroll-jank risk; GSAP stays as a fallback |
| Monogram intro in Rive or Motion | **Inline SVG + Motion** (`pathLength`) | Rive needs a WASM runtime (~100 KB+); the intro is 4 simple steps |
| 3D extruded monogram on Labs | **Cut for v1**; backlog | Risk register already caps v1 at five brand moments |
| Pagefind | **CMS-built JSON index + Orama/MiniSearch** | See [ADR-005](#adr-005--site-search) |
| Lottie as an option | **SVG + CSS** only | Lottie runtime is ~60 KB; not needed |

**Bundle plan per marketing page (first load, gzip):** React/Next runtime ~85 KB · Motion `LazyMotion` + `domAnimation` ~15 KB · page islands ≤ 20 KB → **≤ 120 KB** (NFR-PERF-03). Everything else (canvas field, globe, ⌘K, Cal.com, phone metadata) is loaded only when needed.

---

## 8. Innovation proposals

Ideas that make UB stand out, especially to the international CTO (P-1) who compares UB with vendors in Eastern Europe, India, Nairobi and Lagos. Each one is tied to a business objective and sized. **Status "In scope"** means it is a way of meeting an existing requirement. **Status "CR"** means it needs change control.

| ID | Proposal | Serves | Effort | Status |
|---|---|---|---|---|
| IX-01 | Proof Ledger — every stat has a source and a date | BO-2, CNT-04, OI-02 | 2 days | In scope |
| IX-02 | Project Scoper — guided inquiry that writes a brief | BO-1 | 4 days | CR (small) |
| IX-03 | "Your hours ↔ Kigali hours" overlap widget | BO-1 | 1 day | In scope (FR-HOME-12) |
| IX-04 | Context-aware WhatsApp | BO-1, BO-3 | 0.5 day | In scope (FR-GL-11) |
| IX-05 | Signed certificates you can add to LinkedIn | BO-3, BO-2 | 3 days | In scope + CR (small) |
| IX-06 | Lite mode for slow connections | NFR-USE-03 | 2 days | In scope |
| IX-07 | Save and resume applications | BO-3 | 3 days | CR (small) |
| IX-08 | "How this site is built" page with live scores | BO-2 | 2 days | CR (small) |
| IX-09 | AI-ready content layer | SEO-07, INT-10 | 2 days | In scope |
| IX-10 | Lead SLA and instant alerts | BO-1, BO-6 | 2 days | In scope (INT-08, ADM-10) |
| IX-11 | One PDF engine for certificates, case studies and brochures | FR-WORK-04, FR-CERT-04 | +2 days | In scope |
| IX-12 | Live seats and intake countdown | BO-3, FR-ACA-06 | 1 day | In scope |

Total extra effort for the CR items: about **12 days**, which fits in the holiday buffer plus S6 slack, or can move to Phase 1.5.

### IX-01 — Proof Ledger (sourced, dated stats)

**Problem:** OI-02 shows conflicting numbers (274 clients vs "30+ clients"). International buyers check claims.
**Idea:** stats are not free text. Each `Stat` in the CMS has `value`, `label`, `asOf` date, `source` (internal note), `verifiedBy` and `public`. The site shows a small "as of Oct 2026" note on hover/focus. CI warns when a stat is older than 12 months, and the stat is hidden after 18 months.
**Result:** CNT-04 is enforced by the system, not by memory.

### IX-02 — Project Scoper

**Idea:** a guided project inquiry on `/contact`: pick services (chips) → stage (idea / MVP / scaling / rescue) → timeline → budget band → short description. The visitor sees a **one-page brief** with a suggested engagement model (FR-SRV-03) and can download or email it to themselves. Sales receives the same brief, already structured, with a simple lead score (budget × fit × timeline).
**Why it's different:** most agency forms are a black box. This one gives value back right away, and sales gets better-qualified leads (BO-1: "qualified" inquiries).
**Guardrail:** no automatic prices unless UB approves CMS-controlled ranges; by default it suggests an engagement model only.

### IX-03 — "Your hours ↔ Kigali hours"

A small timeline on Contact, Book and Home (Global reach) that reads the visitor's time zone from the browser (`Intl`, no API, no data stored) and shows: "You're in Berlin. We overlap **8 working hours** a day." This turns the SRS §2.4 time-zone argument into something each visitor sees for their own city.

### IX-04 — Context-aware WhatsApp

The WhatsApp button pre-fills a message based on the page: on a program page, "Hi, I'm interested in *Web Development (Feb 2027 intake)*"; on a service page, "Hi, I'd like to discuss *Cloud & DevOps*". Templates live in the CMS per locale. The button stays hidden on application forms (FR-GL-11).

### IX-05 — Signed certificates you can add to LinkedIn

- The QR code on each certificate encodes the verify URL **plus an Ed25519 signature** of the certificate code and holder name. The verify page checks the signature, so a forged PDF with a copied QR code that points to a real ID still fails if the name was changed.
- The result page has an **"Add to LinkedIn profile"** button (LinkedIn's add-certification link with UB as the issuer, the certificate ID and the verify URL). Every intern who clicks it puts a link back to UB on their LinkedIn profile. That is free, credible reach for the Academy (BO-3) and for UB's international profile (BO-2).
- Phase 2 backlog: issue certificates as **Open Badges 3.0 / W3C Verifiable Credentials**.

### IX-06 — Lite mode for slow connections

Rwanda and the region have many users on low-end Android with 3G/4G (SRS §3.3). Lite mode turns on automatically when `Save-Data` is set, when `navigator.connection.effectiveType` is `2g`/`3g`, or when the visitor chooses it in the footer. It turns off canvas, globe, video, the monogram intro and non-critical images below the fold, and loads smaller image sizes. This builds on the reduced-motion and capability checks that already exist (UI/UX §17.9).

### IX-07 — Save and resume applications

The UI/UX plan saves drafts in `localStorage`. That fails when a student starts on a shared computer at school and finishes on their phone. **Proposal:** "Save and continue later" emails a one-time magic link (24 h, single use) that restores the draft from the server (no files stored until submit). This uses the same token system that the Phase 1.5 applicant status page needs, so it moves that work forward.

### IX-08 — "How this site is built"

A short `/company/how-we-build` page (also linked from the footer as "Colophon") that shows this site's own **Lighthouse scores, Core Web Vitals and accessibility results, pulled from CI at each deploy**, plus the stack and the practices behind them. For a CTO deciding whether UB can build their product, the site itself is the first case study. Numbers update on every release, so they can't go stale.

### IX-09 — AI-ready content layer

- A `Facts` global (founded, HQ, services, languages, time zone, certifications) used by JSON-LD, `llms.txt`, the press fact sheet and the footer, so there is **one source of truth**.
- `llms.txt` and `/llms-full.txt` generated from the CMS (SEO-07).
- Content stored as clean, sectioned text, so the Phase 2 "Ask UB" RAG assistant (INT-10) needs only indexing and a UI, roughly a two-week job instead of a project.
- Optional for the content team: machine-drafted FR/RW translations, marked **"Draft — needs native review"** in the CMS and blocked from publishing until a native speaker approves them (assumption A-4).

### IX-10 — Lead SLA and instant alerts

Leads go cold fast. Each inbox row shows **time since received**, turning amber at 4 working hours and red at 1 working day (Kigali office hours). New leads post to Slack/Telegram with the scoper brief (INT-08). The KPI view (ADM-10) shows median first-response time per week. This supports the promise in the success message: "We'll reply within 1 business day."

### IX-11 — One PDF engine

The certificate PDF (FR-CERT-04) needs a PDF pipeline anyway. Build it once with `@react-pdf/renderer` and brand components, then reuse it for **case-study one-pagers** (FR-WORK-04, a Could) and **program brochures**. Sales then has a leave-behind for every case study without extra design work.

### IX-12 — Live seats and intake countdown

Intake cards and the program sidebar show "**12 seats left · closes in 9 days**" from the `Intake` record. At capacity the form switches to the waitlist on its own (FR-ACA-06). Honest scarcity, based on real data, encourages people to apply before the deadline.

---

## 9. CI/CD pipeline and quality gates

```
PR opened/updated
 ├─ install (pnpm, cached)
 ├─ parallel:
 │   ├─ typecheck
 │   ├─ lint + format check
 │   ├─ unit + integration (Vitest, Postgres service container) — coverage ≥ 70 % on lib/ + actions
 │   ├─ gitleaks
 │   ├─ content scan (lorem|ipsum|TODO|placeholder in seed + CMS export) + i18n key parity (en/fr/rw)
 │   └─ contrast check of token pairs (alias.light / alias.dark)
 ├─ build + bundle size check (fail if any marketing route > 120 KB gzip first load)
 ├─ Vercel preview deploy
 └─ against the preview:
     ├─ Playwright E2E (critical journeys, Chromium + WebKit + Firefox, mobile viewports)
     ├─ axe on every template route (fail on serious/critical)
     ├─ Lighthouse CI on 5 key templates (perf ≥ 95, others = 100)
     ├─ visual regression (Storybook + key pages)
     └─ link check
merge → develop → staging deploy → smoke test
merge → main → manual approval → production deploy → smoke test + "no stray noindex" check
```

Extra checks that are easy to forget:

- **i18n key parity:** CI fails if a key exists in `en.json` but not in `fr.json`/`rw.json` (README rule).
- **Redirect table test:** every legacy URL in §5.3 returns 301 to the right target.
- **Third-party script list:** CI compares the CSP allow-list with an approved list in `docs/third-parties.md` (NFR-SEC-08).
- **Migrations:** a PR that changes a Payload collection must include a migration and regenerated types.

---

## 10. Content and translation track

Content is the most likely reason to miss launch. It gets its own owner and board.

| Content item | Needed by | Owner | Depends on |
|---|---|---|---|
| Decisions: tagline, stats, domains, leadership, phones | End S0 | MD | — |
| Master logo files and colours | End S0 | Marketing | OI-07 |
| Photo shoot (team, offices, labs, academy, portraits) | Shoot in S1, edited by S3 | Marketing + photographer | A-2 |
| 8 service pages | S3 | Content lead | Service interviews with the CTO |
| ≥ 4 case studies with client approval | 2 by S3, 4 by S6 | Sales + content lead | OI-13 client permission |
| 4 industry pages | S3 | Content lead | — |
| ≥ 3 programs + internship page | S4 | Academy admin | Intake dates |
| Leadership bios + portraits | S5 | HR | OI-11 |
| 4 blog posts | S5 | Team authors | — |
| Legal pages reviewed by a Rwandan legal adviser | S6 | MD | OI-08, OI-09 |
| FR + RW for core pages | S6 | Native-speaker reviewers | A-4 |
| Press kit (logos ZIP, boilerplate, fact sheet) | S5 | Marketing | IX-09 Facts |

**Case-study interview kit** (to make the hardest content easier): a 30-minute interview template, a results checklist (time saved, cost, users, uptime, revenue) and an "anonymised" option for NDA clients (FR-WORK-03). The content lead turns each interview into a draft within 3 days.

**Rule:** if a case study, photo or stat isn't ready, the section hides itself (testimonials already do, per FR-HOME-07). The layout never shows an empty or fake slot.

---

## 11. Launch and cutover

### 11.1 One week before

- Production database seeded from the final staging content export; admin accounts created with SSO + MFA.
- Lower DNS TTL to 300 s.
- TLS certificates issued for apex and `www` (fixes G-11).
- Final crawl of the old site to catch any URL missing from the redirect table.
- Search Console and Bing verified on the new property; sitemap ready.
- Rollback plan written: switch DNS back to the old host (keep it running for 14 days).

### 11.2 Launch day (Tuesday, 08:00 Kigali)

1. Content freeze in effect since Monday.
2. Deploy `main` with manual approval.
3. Switch DNS on Cloudflare; `www` → apex 301.
4. Smoke test: 5 core pages × 3 languages; submit each form type with real inboxes; verify one certificate; reject cookies and check that no analytics requests fire.
5. Submit the sitemap; request indexing for the home page and service pages.
6. Update Google Business Profile, social bios and email signatures to the new URLs and company-domain email.
7. Team on call for 72 hours: Sentry, uptime, outbox dead-letter queue, 404 log.

### 11.3 First week after

- Daily review of 404 logs → add missing redirects.
- Watch Core Web Vitals field data (Vercel Speed Insights).
- Decommission the old site after 14 days with no rollback.

---

## 12. After launch

| Phase | When | Scope |
|---|---|---|
| **M5 review** | Launch + 30 days | Analytics, CWV field data, lead volume and source, form drop-off per step, backlog reprioritised |
| **Phase 1.5** | Months 2–3 | Remaining FR/RW translations; applicant status page (reuses IX-07 tokens); full ⌘K search if it was trimmed; waitlists for "coming soon" products (FR-PRD-04); A/B test of the hero and Project Scoper |
| **Phase 2** | Months 4–6 | Academy fee payments (MTN MoMo, Airtel Money, card) with a penetration test first (NFR-SEC-10); "Ask UB" assistant on the IX-09 content layer; Open Badges certificates; client project portal discovery |

---

## 13. Risks

Risks the SRS and UI/UX plan already list are not repeated here. These are delivery risks.

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Content (case studies, photos, stats) late | High | Launch slips or looks empty | Own track and board from S0; sections hide themselves when empty; anonymised case-study option |
| Data residency decision late or provider unsuitable | Medium | Re-architecture mid-build | Decide in S0 with a latency spike; code doesn't depend on DB location; two-database fallback costed in advance |
| Payload or Next.js 16 breaking changes during the build | Medium | Lost days | Pin versions; Renovate PRs reviewed weekly, not auto-merged; upgrade only at sprint start |
| Approvals slower than 3 days (A-1) | Medium | Sprint slips | Weekly fixed approval slot with the MD; decisions logged; "silence = approved after 5 days" agreed up front |
| Holiday period cuts S5 short | High | Signature moments trimmed | Effects are progressive enhancement; buffer week; trimming order agreed: globe → bento demos → shared transitions |
| Virus-scan / in-country storage harder than expected | Medium | Uploads blocked in S4 | Prototype in S1; API-scanner fallback |
| One senior engineer holds all knowledge | Medium | Bus factor | ADRs, pairing on the form platform and caching layer, runbooks in `docs/` |
| Turnstile or Cal.com blocked by the CSP or ad blockers | Low | Forms fail | Server-side fallback: if the Turnstile token is missing, accept with a stricter rate limit and flag for review; Book page always offers an email fallback |

---

## 14. Decisions needed and when

Each open issue from [SRS §16](SRS.md#161-open-issues-decisions-needed-from-ub), mapped to the sprint it blocks. A decision not made by its date becomes the stated default so the build can continue.

| OI | Decision | Needed by | Default if not decided |
|---|---|---|---|
| OI-08 | NCSA registration, hosting Option A or B | **S0** (Oct 16) | Option A (Rwandan DB) |
| OI-07 | Master logo files, exact colours, brand font | **S0** | Estimated tokens + Plus Jakarta Sans; swap later is cheap with tokens |
| OI-03 | Domains, company email | **S0** (DNS and email take time) | `universalbridge.rw` + `hello@universalbridge.rw` |
| OI-02 | Accurate stats | S2 (home design) | Hide stats band until verified (IX-01) |
| OI-01 | Tagline | S2 | "Building Smart Solutions. Connecting the Future." |
| OI-04 | Academy domain | S3 | `/academy` section; `universalbridge.academy` redirects to it |
| OI-13 | Clients and projects that can be named | S3 | Anonymised case studies only |
| OI-05 | Which products are public | S3 | Nyambika Design only; AI products shown under Labs as "In development" |
| OI-06 | Real photos vs labelled renders | S3 | Renders only in labelled "Our vision" blocks |
| OI-10 | Show agent commission tiers? | S4 | Show tiers by name, percentages on request |
| OI-11 / OI-12 | Leadership names, official phones, WhatsApp line | S5 | Leadership page hidden; contact form + email only |
| OI-09 | RDB registration number, TIN | S6 | Launch blocker (legal pages) — no default |
| OI-14 | Budget for paid services | S0 | Free/low tiers; see cost note below |

**Indicative monthly running cost at launch** (to confirm under OI-14): Vercel Pro ~$20/seat · in-country Postgres + storage (provider quote needed) · Resend free–$20 · Upstash free tier · Sentry free/team · Plausible ~$9–19 · Cal.com free · Cloudflare free · ClamAV container (part of the in-country host). Budget for the photographer and legal review separately as one-off costs.
