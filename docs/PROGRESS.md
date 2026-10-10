# Implementation progress

Tracks delivery against [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md). Each phase lists what was built, how it was tested, and any deviation from the plan.

## Decisions waiting for UB

| Item | Why | Where |
|---|---|---|
| ADR-006 — static CSP instead of nonce-based | A nonce forces every page to render dynamically, which breaks NFR-PERF-05 | [adr/006](adr/006-csp-and-static-rendering.md) |
| ADR-007 — first-load JS budget 150 KB Brotli (not 120 KB gzip) | Next.js 16 + React 19.3 alone are ~114 KB; 120 KB is not reachable | [adr/007](adr/007-js-budget.md) |
| French and Kinyarwanda UI strings need native review | Drafted by engineering (assumption A-4) | `src/i18n/messages/{fr,rw}.json` |
| Horizontal logo as vector | Master monogram received (`public/brand/original-logo.svg`); the "Universal Bridge Ltd" wordmark is still live text in Plus Jakarta Sans until outlines/brand font arrive (OI-07) | `src/components/brand/Logo.tsx` |
| Real photos | Supplied office and apparel images are AI renders: usable only as labelled "Concept" (OI-06). Save them to `public/images/` with the names in `scripts/seed-content.ts` | — |
| Case studies, client logos, testimonials | None seeded (OI-13); those sections hide themselves until real, approved content exists | CMS |
| Stats | Only verifiable stats are public; 274 clients / 421 projects stay private until OI-02 is resolved | CMS → Stats |
| Virus scanner for uploads | Production keeps CVs "pending" until a clamd service is configured (`CLAMAV_HOST`, ADR-004) | Hosting (OI-08) |
| Certificate signing key | Generate with `pnpm cert:keygen`, store as `CERT_SIGNING_KEY` in the secret manager; rotating it invalidates printed QR signatures | Hosting |
| Agent commission tiers | Tier names shown; percentages withheld until OI-10 is decided | `/company/partners` |
| Leadership | Names and titles from the current site (SRS §2.1); the mockups disagree (OI-11). No bios or photos yet | CMS → Team members |
| Legal pages | Privacy, cookies, terms, accessibility and Academy terms are drafts from SRS §13 — a Rwandan legal adviser must review them before launch (SRS §13.4) | CMS → Pages `legal-*` |
| Draft articles and the 2024 hackathon | Four articles and the hackathon event are seeded as **drafts** in production; the hackathon's exact dates are not in the brief | CMS → Posts, Events |
| Globe markets | The Kigali → World globe draws arcs only to verified markets; none seeded (OI-13) | CMS → About / Home → Kigali → World |
| Cal.com booking event | `/book` falls back to "Request a call" / email / WhatsApp until `universal-bridge/discovery` exists on Cal.com (UI/UX audit P0-2) | Cal.com account, `NEXT_PUBLIC_CAL_LINK` |
| Two-step verification and staff SSO | Built and tested, but switched off: staff sign in with email and password for now. Turning them on needs UB's go-ahead (and, for SSO, Google Workspace / Microsoft Entra app registrations) | `MFA_ENFORCEMENT`, `SSO_ENABLED` + `GOOGLE_CLIENT_*`, `MICROSOFT_CLIENT_*` |
| Production services | S3 buckets (media + private CVs), clamd virus scanner, Upstash, Resend, Sentry DSN: the server refuses to start without the required ones | Hosting (OI-08) |
| Careers culture and benefits; partner logos; alumni stories | Sections exist in the CMS, but the content (and permission to publish it) must come from UB | CMS |
| Contact details use plan defaults | `hello@universalbridge.rw`, phones from the current site (OI-03, OI-12) | `scripts/seed-data/settings.ts` |

## S0 — Decisions (done, partly)

- ADR-001 to ADR-007 written in `docs/adr/`. Workshops, latency spike and device spikes need UB and real hardware.

## S1 — Foundation (done)

Built: Next.js 16.4 + React 19.3 + TypeScript strict, Payload 3.90 on PostgreSQL, next-intl (en/fr/rw, `as-needed` prefix, cookie), three-tier design tokens (Daylight/Night), fonts, theme toggle with circular View Transition, Popover-API language switcher, security headers and CSP, legacy 301s, `/api/health`, seed script, CI workflows, Lighthouse config, pre-commit hooks.

Tests: unit (office hours, overlap, CSP, redirects, roles, locale paths), E2E (3 locales, light/dark axe, skip link, language switch, theme persistence, localised 404, 301s, headers, health). Bundle budget measured on the production build.

Deviations:
- **Storybook deferred.** Components are covered by Playwright + axe on real pages instead. Revisit when the network allows the install.
- **Sentry not wired yet** — planned for S6 hardening.
- next-intl's client provider is not used (saves ~10 KB); client components receive translated labels as props.

## S2 — Shell + first vertical slice (done)

Built:
- Header (transparent over Night hero → glass after 24 px, hides on fast scroll), mega-menu from the CMS (disclosure pattern, arrow keys, Esc), mobile drawer (native modal `<dialog>`), footer from the CMS, announcement bar (no layout shift), breadcrumbs + JSON-LD, cookie consent (Reject = Accept, analytics only after consent).
- Form platform: one submit pipeline (honeypot → Turnstile → hashed rate limits → zod → server refinements → one transaction with outbox jobs → delivery after the response). zod/mini schemas shared client/server; validation code lazy-loaded.
- Outbox (ADR-002) with `FOR UPDATE SKIP LOCKED`, backoff, dead-letter; cron route; React Email templates (localised confirmation, internal notification).
- Leads inbox in the Payload admin with status workflow, notes, assignee, consent record, UTM/referrer; audit log; first-response stamp (IX-10).
- Contact page: department routing (`?topic=`), copyable contact options, Kigali clock + open/closed, stylised map (no third-party widget), hours-overlap widget (IX-03).
- Protected `/api/revalidate` for content written outside Next.js.

Tests: 42 unit + integration (schema, phone E.164, rate limits, Turnstile, outbox rollback/delivery/retry/concurrency on a real database), 46 E2E on dev **and** production builds (mega-menu keyboard, drawer, header states, footer, cookie reject/accept, error summary + axe, full submission → email → admin API, French + `?topic`, keyboard-only journey 9, no-JS submission and server errors).

Bugs the tests caught and fixed: tailwind-merge dropping button text colour; ICU "9,999 problems"; consent message lost in resolver unions; no-JS defaults missing on radios; duplicate popover ids on mobile; hidden tracking inputs reset by React; red/green status text under 4.5:1.

## S3 — Marketing templates + SEO (done)

Built:
- CMS: Pages (block builder, 19 blocks incl. auto blocks for services, industries, stats, work, products, testimonials, logos), Services, Industries, Case Studies, Products, Technologies, Clients, Testimonials (approval + date enforced), FAQs, Stats (IX-01 Proof Ledger: source, as-of, verifier; stale after 18 months). Drafts, scheduled publishing, version history; revalidation on publish only (not on autosave).
- Templates: home (13 sections, Night→Day rhythm), services overview with pillar filter (View Transition), service detail (deliverables, process, stack, engagement, related work, FAQ), solutions overview + industry detail, work listing (URL filters, shareable, CSS-only hiding) + case-study detail (results first, anonymised clients), products + product detail with "Request a demo" (same lead pipeline), book a call (Cal.com iframe + hours overlap).
- SEO: per-page metadata, canonical + hreflang + x-default, JSON-LD (Organization, LocalBusiness, WebSite, BreadcrumbList, Service, FAQPage, SoftwareApplication), sitemap with alternates, robots (staging noindex), dynamic brand OG images, SVG favicon, apple-touch and PWA/maskable icons, manifest.
- Brand: monogram, favicons, icons and OG image now come from UB's master SVG (`public/brand/original-logo.svg`); brand tokens updated to the master colours (#0145B8, #FE760D).
- Seed: 8 services, 7 industries, Nyambika Design, 18 technologies, 6 FAQs, stats, 5 pages — home and overviews in en/fr/rw (I18N-06). Draft copy for UB review (CNT-01).

Tests: 86 E2E on dev and production builds (every template: one H1, metadata, canonical/hreflang, OG, axe light + dark; translations and fallback; hidden unverified content; pillar filter; JSON-LD; sitemap/robots/icons/manifest; journey 7 edit-to-live < 60 s; real case study created via admin API, filtered, anonymised, accessible; product demo → leads). Bundle: all pages 127–144 KB (budget 150).

Bugs the tests caught and fixed: scroll-reveal fade leaving text at low contrast (now motion-only); pillar filter CSS specificity; URL filters ignored when a dimension had one option; product status enum clashing with the drafts enum; Payload block/collection type-name collisions; tailwind-merge (~8 KB) shipped to every page via client components.

## UI review with UB's images (done)

- Selected renders imported through the CMS (8 images, 2 MB PNG → 20–42 KB AVIF as served); each carries a visible, translated "Concept" label. Decisions per image: `brand/source/README.md`. Originals moved out of `public/` so they are not published.
- Home hero: illuminated lobby sign in the bridge-mask panel (lazy, so the H1 stays the LCP element); on mobile the image follows the buttons and the hero no longer leaves ~400 px of empty space.
- Services and Solutions heroes use office/lobby renders; Labs cards get photo headers with hover zoom; Academy teaser uses the Academy hub render.
- Single product shown as a featured card with a phone mockup until real screenshots exist; stats grid adapts to the number of verified stats; consecutive same-mood sections share a tighter rhythm (no more 320 px gaps); footer contact column widened.
- Emails use the master colours and a PNG of the mark (email clients don't render SVG).
- Bug fixed: Payload's absolute media URLs were rejected by next/image (`mediaSrc` helper + unit test).

Tests: 43 unit/integration, 86 E2E on dev and production (axe on every template, light + dark). Bundle unchanged: 127–144 KB.

## S4 — Academy, careers, certificates (done)

Built:
- **Form engine** (`components/forms/FormEngine.tsx`): every application form is data — fields, steps, conditional fields (under-18 guardian), file uploads, review step, device drafts with restore, URL preselection (`?intake=`), lazy zod. Without JavaScript all steps render as one form and still submit.
- **Uploads** (ADR-004): magic-byte sniffing (PDF/DOC/DOCX), 5 MB limit, Payload's structural PDF validation, private storage (staff-only download), virus-scan job via clamd (`CLAMAV_HOST`; "skipped" in development, blocks in production until configured).
- **Academy**: programs (curriculum, outcomes, fees, Course JSON-LD), intakes with capacity → live "seats left · closes in N days" (IX-12) and automatic waitlist when full (FR-ACA-06), landing, programs listing with shareable filters (legacy `/online_trainings` → `?mode=online`), program page with sticky enrol panel / mobile bottom bar, 4-step application (You → Background → Program → Review), internships with CV.
- **Careers**: jobs (JobPosting JSON-LD, salary optional), job page with CV application, open application. **Partners**: agent programme page and application.
- **Applications inbox**: one collection, scoped per role (academy/HR/sales), status workflow, intake `accepted` count kept in sync, consent + guardian recorded, confirmation and team emails in the applicant's language.
- **Certificates**: unguessable codes, public verify page (rate-limited, uncached, `noindex`), QR scanning where the browser supports it, Ed25519-signed QR links with tamper detection and a published public key (IX-05), "Add to LinkedIn", revocation with reason, print-ready A4 PDF with brand and QR, CSV bulk import with dry-run (all-or-nothing).
- **Newsletter**: footer sign-up, double opt-in, single-use confirm link, signed one-click unsubscribe. `/.well-known/security.txt` (NFR-SEC-11).
- Seed: 4 programs, sample intakes in development only (one full, to exercise the waitlist), Academy/Internships/Careers/Partners pages in en/fr/rw.

Tests: 62 unit + integration (signatures incl. tampering and time zones, CSV parsing and real-date checks, file sniffing incl. disguised files, intake seats/deadlines, academy schema incl. under-18 rule), and E2E journeys 3, 4, 5 and 6 plus waitlist, drafts, typing-before-hydration, no-JS academy application, disguised and malformed PDFs, private file access, revocation, rate limiting, PDF and CSV tools, newsletter opt-in. 143 E2E tests on desktop + mobile, passing on the dev server and the production build. All 15 measured pages within the bundle budget (125–147 KB).

Bugs the tests caught and fixed — several would have hit real visitors:
- **Typing before the page finished loading was wiped** when React Hook Form registered fields (slow 3G). Defaults now render as HTML; RHF adopts what's in the field.
- **Clicks lost when errors cleared on blur**: the button moved between mouse-down and mouse-up. Forms now validate on Continue/Send and re-check while typing; the error summary is a snapshot of the last attempt.
- **Continue on the last step also submitted the form**: React reused the button node as `type="submit"` before the browser ran the click's default action.
- **Signed QR codes failed for valid certificates**: the issue date was read in UTC while stored at Kigali midnight.
- **Drafts never saved**: an unstable callback re-ran the autosave effect on every keystroke, cancelling it.
- **A tap on the mobile menu before hydration did nothing**: it now uses native Invoker Commands (`command="show-modal"`), so the drawer opens without JavaScript.
- Error summary focused before React had rendered it; chip radios unclickable at their centre; phone input 30 px wide after removing tailwind-merge from client code; invalid `<dl>` markup; CSV accepting `2026-13-01`.

## S5 — Labs, insights, company, signature moments (done)

Built:
- **Labs** (FR-LAB-01…03): landing and three hub pages (focus areas, equipment, projects with status, collaborate CTA), each with its labelled concept photo.
- **Insights** (FR-BLOG-01…04): featured post, category tabs as shareable links, post page with table of contents, reading time, share links (no third-party scripts), related posts, BlogPosting JSON-LD, RSS (`/feed.xml`). Four draft articles meet the CNT-03 minimum. Posts and events without a photo get a generated branded cover instead of an empty box.
- **Company**: about (mission, values, timeline, Kigali → World), leadership (FR-TEAM-03: no personal contacts), events (upcoming/past, agenda, registration with team names, Event JSON-LD, capacity), press (news, mentions, press kit). Legal pages from the CMS.
- **Search** (FR-GL-08): ⌘K / Ctrl K palette, a native modal dialog with combobox/listbox semantics; the index and MiniSearch load on first open. Quick actions (book a call, copy email, theme, language) rank first when the query names them.
- **Signature moments**: living circuit hero (canvas), cobe globe with arcs from Kigali, Ideas → Code → Impact scroll story, 404 "broken bridge" game (drag or keyboard). All effects are off under reduced motion, Lite mode, small screens and low-end devices, and the same information is in the text beside them.
- `llms.txt`, sitemap now covers S4 and S5 pages.

Tests: `tests/e2e/s5.spec.ts`, which covers:
- axe checks on nine S5 pages;
- hub navigation, plus the "Concept" label on images;
- leadership showing no personal contacts;
- French fallback;
- category filtering;
- TOC, share links and JSON-LD;
- RSS, `llms.txt` and the sitemap;
- event registration end to end (email and staff record);
- no form on past events;
- the palette (search, empty state, actions, shortcut, Escape);
- the 404 game by keyboard;
- the story block;
- globe and circuit on desktop, and off under reduced motion and Lite mode.

Bugs the tests caught and fixed:
- **Event registration never sent**: hidden form values (the event id) weren't passed to client validation, so the form failed silently. The form engine now validates hidden values too.
- Typing "book" in the palette opened a blog post instead of "Book a discovery call".
- Share buttons were announced as "Share: linkedin".
- Duplicate breadcrumb keys on the privacy page (the "Legal" crumb pointed at the page itself; there is no legal index, so it was removed).
- **Home page 52 px wider than a phone screen**: the story's code window set the grid's minimum width, pushing the menu button off-screen. Fixed, and a phone-width overflow test now covers six pages.
- **Bundle budget**: the globe and living-circuit code was shipped to every CMS page, even though it only runs on capable desktops. Their drawing code now loads with `import()` only when it will run. The form pages (careers, partners, internships) are at 149.4 KB, just 0.6 KB under the 150 KB budget: the next client feature on those pages needs a saving first.

Results:
- Unit/integration: 62 passed.
- E2E on dev: 182 passed; the 6 mobile failures were the overflow bug above, and all pass after the fix.
- E2E on the production build: 193 passed, plus 1 story test that had read a stale local data cache (passes after revalidation).
- Bundle: 23 pages at 127–149 KB.

Local note: `.next-prod/cache` keeps fetched CMS data between builds. After seeding, revalidate the production server too (`/api/revalidate`), or delete `.next-prod/cache/fetch-cache`.

Skipped per the plan's trimming order: monogram intro animation, bento service demos and shared-element view transitions between listing and detail.

## UI/UX audit follow-up (done)

All code-fixable findings in [UI-UX-AUDIT.md](UI-UX-AUDIT.md) are fixed. The status of each item is in §10 of that document, and every fix has a test in `tests/e2e/ux-audit.spec.ts`.

On the production build:
- 237 E2E tests pass, as do 62 unit tests.
- All 23 measured pages are within the bundle budget.
- Throttled LCP on image-hero pages is now 1.8–2.3 s (it was up to 3.3 s).

Still open, both needing UB: the Cal.com event, and real photography.

## UI/UX audit v2 follow-up (done)

All engineering items in [UI-UX-AUDIT-v2.md](UI-UX-AUDIT-v2.md) are fixed. Status per item is in §6 of that document. Highlights:
- A proof-of-work `/work` page.
- A cheaper and more visible circuit field with large ring nodes.
- The globe stays on Kigali.
- Cross-page transitions.
- An animated product phone.
- A hero showcase of what UB builds.
- A bento services grid.
- A shorter contact form.
- A logo that follows the surface (white on dark, blue on light).
- About 70 strings of shorter copy across en, fr and rw.

Interactive islands now load on demand through `data-fx`, which keeps every page within the JS budget.

Still with UB: photography, product screenshots, approved logos and testimonials, and the Cal.com event.

## Design system pass: white-paper light theme (done)

- **Light theme is white paper.** It uses a white canvas and surfaces. Night sections (hero, Labs, Kigali → World, …) become "accent paper": a cool off-white with a faint dot grid and soft blue light. Dark theme is unchanged. In light theme, everything previously dark now has a light version: the CTA card, the cover art, the code editor (GitHub-light style), the phone mockups (silver device, light screen) and the globe (a pale sphere, plus a light pre-rendered frame).
- **Smooth junctions.** Full-width Night sections fade into their neighbours. The CTA is a floating card instead of a full-bleed slab. The footer fades in, and its divider and bottom rule fade at both ends.
- **Softer borders and shadows.** Borders are translucent navy hairlines in light theme and translucent white in dark theme. Shadows are layered and low-opacity.
- **Story visuals rebuilt.** The visuals are a whiteboard (connected notes, a plan that ticks itself, collaborator cursors), an editor with a pipeline strip, and a results card with a trend line that draws itself, plus an app notification. They build with the step's scroll timeline.
- **Circuit pulses** follow every chamfer. Trails fade from tail to head, and an arriving pulse lights its node with a soft ring.
- **Academy section redesigned minimal:** a hairline intake list with status chips, one action, and the photo.
- **Fixes:** text clipped inside cards on phones (all two-column grids now constrain their phone column, and buttons wrap long labels). The tests now catch clipping hidden by `overflow-hidden`. Cursor-label contrast is fixed.

## Design rounds: services, labs, products, copy (done)

- **Services:** each card has a live mini-diagram drawn in inline SVG and CSS, with no JavaScript:
  - pipeline (Custom Software)
  - performance score (Web & Mobile)
  - uptime ticks (Cloud & DevOps)
  - forecast with confidence band (AI & Data)
  - live sensor signal (Embedded & IoT)
  - design kit (UI/UX)
  - roadmap (IT Consulting)
  - SLA bars (Managed IT)

  Each diagram draws in on scroll and then loops quietly. A "Not sure which service?" strip leads to "Request a service" and "Book a call". **The figures in the diagrams (99.9%, 98, "Within SLA") are illustrative and need UB's sign-off or removal.**
- **Labs:** frameless photo cards with a "Lab 0n" tag and a "now building" chip taken from each hub's real projects. Cards rise in on scroll; on hover the photo zooms, a light scan passes and a line draws across. A short stats line and a "Partner with our labs" link sit above.
- **Products:** an open spotlight layout. The phone floats over turning orbit rings with pointer parallax, and the feature list lights up in sync with the phone's screens. Actions: "View product" and "Visit nyambika.com".
- **Academy:** minimal hairline intake list with seat chips.
- **Circuit pulses:** they follow every chamfer, stop at the ring's edge and flash the ring. Only one engine runs per canvas (this fixed overlapping animations after hot reload); the globe has the same guard.
- **Radius scale:** 8 / 12 / 16 / 22 / 28 / 32 / 40 px. `2xl` and `3xl` were still on Tailwind's defaults, which were smaller than `xl`.
- **Copy:** two minimal passes in en, fr and rw (about 175 strings), and leads that repeated their headline were removed. FAQ answers, legal pages, articles and error messages are unchanged. Sections also have more spacing.


## S6 — Admin security, backend completion and page gaps (done)

Started from two code reviews against the SRS (pages and backend). Every gap that code can close is closed; the rest needs content or accounts from UB (table above).

**Admin authentication (ADM-01, NFR-SEC-04/05)**. Staff sign in with email and password for now; two-step verification and SSO below are switched off by default (`MFA_ENFORCEMENT`, `SSO_ENABLED`) and will be rolled out later.
- Two-step verification with any authenticator app (RFC 6238, no new dependency). Secrets are encrypted (AES-256-GCM); recovery codes are hashed and single-use; codes can't be replayed.
- MFA is bound to Payload's session id and enforced in the proxy for every admin page and API call (`401 MFA_REQUIRED`), not just the admin UI. "required" in production, "enrolled" in development.
- Google and Microsoft SSO (OpenID Connect with PKCE, state and nonce, keys from the provider). It only signs in existing staff, can be limited to domains, and still requires two-step verification.
- Invitations by email (set your own password); password policy (12+ characters, blocklist, no name/email); sign-in and reset rate limits; Payload's password-reset emails now actually send (they were only logged).
- Audit log: sign-in, sign-out, two-step events, throttling, user and role changes.

**Backend**
- Initial database migration (211 tables, verified on an empty database); the Vercel build runs it.
- Object storage: media and a private CV bucket with 5-minute signed links; the virus scan reads from storage. CVs are visible only to the roles that handle that application type, and only after a clean scan; infected files alert the team.
- Retention job (SRS §11) and the missing `/api/cron/retention` route; job queue cron for scheduled publishing (CMS-06 was never running).
- CSV export (ADM-06) and the data-subject tool (ADM-09) in the admin, both logged with hashed references.
- Applicant status emails in en/fr/rw (ADM-05); notes signed by their author (ADM-04); team alerts carry absolute links and no names.
- Fixed: the cron routes accepted `Bearer undefined` when `CRON_SECRET` was unset.
- Start-up configuration check, server error reporting to Sentry without an SDK, health check reports stuck or dead emails, Dependabot and CodeQL.

**Pages**
- Branded 500 page in three languages (loaded only when an error happens, so it costs nothing on other pages).
- Home: latest insights. Insights: pagination, topic pages, tags and an author card on articles.
- Case studies show gallery, team and previous/next; programs show instructors and filter by duration; labs show their team.
- Global WhatsApp button; Solutions menu descriptions; translated press facts; `/company` and `/legal` redirect; Academy forms link the Academy terms.

**Tests**: 77 unit (TOTP reference vectors, encryption, password policy, MFA proofs, SSO claim checks, CSV, cron secret, config check) and new E2E for the MFA journey, staff data tools and completed pages.
- Dev server: 285 passed, 0 failed.
- Production build (two-step "enrolled" for the test run): 282 passed; the 3 failures were test or local-setup issues, fixed and re-run green. "Required" mode checked separately: password-only tokens get 401 and the admin redirects to two-step set-up.
- Bundle: every page within 150 KB; form pages at 149.9 KB, so the next client feature there needs a saving first.

Bugs the tests caught and fixed:
- Recovery codes were never shown: setting the session cookie re-rendered the page first.
- Invitation emails never sent: Payload's reset step can't see a user created in the same transaction, so the invitation now goes through the outbox.
- Staff actions failed when the site was reached on another host name than `NEXT_PUBLIC_SITE_URL`.
- The 500 page would have pushed the form pages over the JS budget.

## Live editing on the page (CMS-07, done)

Staff edit text and images directly on the live site instead of in admin forms. The steps for editors are in the README ("Editing on the page").

**Data model.** Pages are built from blocks, and each language has its own block list (`layout` is localized as a whole). Content collections have drafts, autosave, version history and scheduled publishing. Values are addressed by collection, id, locale and a path that uses row ids rather than indexes, so a reference stays correct when sections move.

**Design**
- Edit mode is Next.js draft mode plus a staff session with an editing role. Visitors get static pages with no edit markup, and the editor (a lazily loaded module) is never downloaded.
- Server components mark editable values; most sections get this through `SectionHeader`, with hero, CTA band, cards, process, timeline, media, Academy teaser and detail-page headers annotated individually.
- `/api/live-edit/save` resolves each path against the collection's field config, so only text, textarea and image fields can be written. Technical fields (slug, links, SEO, read-only) are refused. It saves as the signed-in user (access rules, hooks, versions), validates length and required fields, and logs to the audit log.
- Saves are drafts, and Publish publishes the language's latest draft (which refreshes the public pages). An updatedAt check prevents overwriting someone else's newer save.
- A language without its own content starts from the English blocks, with fresh row ids.

**Tests**: 6 unit (path resolution and refusals, markup helpers, safe redirects) and 7 E2E:
- visitors get nothing;
- edit → private draft → publish → visitors see it;
- undo;
- accent titles;
- conflict, with "keep mine / load theirs";
- image replacement from the library;
- French edits leave English untouched;
- the API refuses bad paths and values.

Fixed during testing: the page could jump while typing when the pointer rested on the edited text. Text being edited now wraps in place and the page holds still.

Not on the page (admin only): adding, removing or reordering sections, rich text, links and URLs, SEO settings, navigation and site settings.

## Company dashboard (`/office`, done)

A second staff app, next to the content admin, for running the company. It's built on the same data and sign-in. Sections are listed in the README. ADM-02/03/04/05/06 and ADM-10 (KPI dashboard) are delivered here in a modern form.

**Data model**
- Leads stay one inbox, viewed three ways: service requests (sales department, no product), demo requests (a product is set) and messages (other departments). New fields: estimated `value` and `currency`, and `nextFollowUpAt`.
- Applications gain a 1–5 `rating`.
- New collections: `employees` (HR only), `projects` (client projects, internal tools, products; milestones, team, budget, link to the lead and product) and `page-views` (cookieless analytics).

**Interactivity**
- Drag-and-drop pipelines with optimistic moves (a menu on each card does the same by keyboard or touch).
- Saves happen on change, with no Save buttons on records.
- Notes are signed automatically.
- Charts have hover and keyboard tooltips and a toggleable legend; visitor counts update live.
- Milestones drive project progress.
- Saves from one page are queued: Payload writes whole records, so overlapping saves could otherwise drop a note. The E2E tests caught this.

**Analytics**
- `/api/collect` receives page views from a tracker loaded only after consent, as a separate chunk.
- It drops bots, staff sessions and cross-site requests, applies rate limits, and stores a daily visitor hash (no IP).
- Aggregates are SQL queries over `page_views`, which retention purges after 13 months.

**Tests**: 4 unit (user-agent classification, bots, deltas, formatting) and 8 E2E:
- sign-in redirect;
- role gating (hr and sales accounts);
- request stage, value, follow-up, notes, and the board move;
- applicant stage, rating and the email toggle;
- project creation and milestone progress;
- adding an employee;
- analytics only with consent, never for bots or staff, with no IP stored.

All dashboard pages fit a phone screen without sideways scrolling.

Development-only sample data: six sample employees and two projects were created in the local database to review the screens. They aren't in the seed.

## Office administration (done)

**Sign-in.** A new staff sign-in page at `/login` replaces Payload's screen:
- Animated brand panel, show/hide password, Caps Lock warning, inline "forgot password", SSO buttons when enabled.
- The `/admin/login` route redirects to it.
- After sign-in, staff land in the office or the CMS (their choice, or the default in Settings).
- `/office` now passes the same MFA gate as `/admin`.

**Roles & permissions (RBAC).**
- `roles` collection; `users.roles` is now a relationship to it, loaded with the user (`auth.depth: 1`).
- 39 permissions cover the office, administration, website content and member accounts.
- Access checks now use permissions instead of role names. This covers every collection and global, plus exports, live editing, privacy and the office areas.
- Leads are scoped per kind: service requests, demo requests and messages.
- Applications are scoped per type through `applicants.<type>`.
- Built-in roles are created at start-up if missing.
- Seeds and tests may still pass role slugs; they are resolved to ids.

**Settings.**
- `system-settings` global, edited in office → Settings.
- Holds what used to sit in env: sender and inboxes, analytics domain, booking link, webhooks, ClamAV host, SSO domains, retention periods, upload limit, noindex, registration, member roles, staff landing, reply target, board size, currency.
- Env values remain as fallbacks; secrets stay in env.
- Public pages read settings through a cache tag; server code through a 30-second in-memory copy that clears on save.

**System logs.**
- Audit entries now also store: the actor's name and type (staff, member, public, system), a non-personal label (ref or title, never a person's name), from → to for status changes, a shortened IP, and the device.
- The office page shows them as a readable timeline, with charts, filters and CSV export.

**Openings and website accounts.**
- `openings` collection with a form builder.
- Public pages `/apply` and `/apply/{slug}` reuse the existing submit pipeline (honeypot, rate limits, validation, transaction, outbox), with server-side validation built from each opening's questions.
- `members` auth collection with register, sign-in, reset and an account page with a progress stepper per application.
- A member's first application promotes them from visitor to applicant.
- Strings are in en/fr/rw. **Kinyarwanda strings for `openings` and `account` need native review.**

**Boards everywhere.** Requests, messages, applicants, openings, projects and employees all follow the same layout: summary, category cards with stage bars, then a drag-and-drop status board. Board size and the reply-time colours come from Settings.

**Migration.** The pre-launch initial migration was regenerated (`20261010_162618_initial`, 228 tables, checked on a fresh database). Local databases created before this change need the old `users_roles` table dropped before Payload's dev push. Without that, push stops at a data-loss prompt; staff role links are restored by slug.

**Tests.**
- Unit: permissions, settings fallbacks, log sentences, IP anonymising (100 unit + integration in total).
- E2E (`access.spec.ts`): the one sign-in page; a custom role gets exactly what the matrix grants; only super admins can grant super; settings save and appear in the logs; an opening goes live, a visitor registers, applies (required questions enforced, CV upload) and sees "Applicant" with the application on their account; staff see it on the opening's funnel.

## Office workspace round (done)

- **Forms and dropdowns.** One `ui-field` style for every input, select and text area (40 px, same padding and radius). Selects use the browser's customizable-select styling: the list floats, is animated, and has a checkmark, with a styled fallback in older browsers. Popovers render in a portal, so tables can't clip them.
- **Navigation.**
  - The sidebar is an accordion with its state remembered; phones get a drawer.
  - Every page has a loading skeleton; the editor, matrix and charts load lazily.
  - A top progress line appears on navigation. It is inline JS on the website and the office, so the bundle cost is zero.
- **Role switching.** An `ub-act` cookie names the active role (`userId:roleId`). It is applied in every access function (`actingFromReq`), the office session and the API routes. It never touches stored roles; Payload's session refresh writes the whole user, so narrowing at read time would lose roles.
- **Notifications.**
  - New `notifications` collection, written from lead and application hooks: new items go to everyone holding the permission, assignments to the assignee.
  - "Upcoming" items are computed live.
  - Bell, page, and an API to mark items read.
- **Deep search.** SQL over the record tables and the website's localised content tables, scoped by the active role's permissions, with match snippets.
- **Settings audit.** "Follow-up after" now sets a follow-up date when a request leaves New. The default currency now fills new requests and projects, which can use KES and UGX too. "Email applicants" now really switches the emails off. Board size and reply target now also apply to demo pipelines and the overview. Maintenance mode was added.
- **Overview.** Rebuilt per role with animated SVG charts: KPI sparklines, donuts, gauges, funnels and rings.
- **Tests.**
  - `workspace.spec.ts`: role switching across the office, the API and search; the assignment notification through the bell; deep search inside notes; sidebar memory; role-based overview; follow-up from settings; the phone drawer and folding filters.
  - `maintenance.spec.ts`: runs last, as its own project, because it takes the site down.
  - Unit tests for role narrowing.
