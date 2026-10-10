# UI/UX audit v2 — Universal Bridge website

| | |
|---|---|
| **Date** | 2026-10-10 |
| **Build tested** | Fresh production build of the current working tree (`next build` → `next start`) |
| **Previous audit** | [UI-UX-AUDIT.md](UI-UX-AUDIT.md) (v1: 83 %) |
| **Overall grade** | **89 %** (B+) on the stricter v2 rubric · **90 %** on the v1 rubric |
| **Evidence** | [`docs/ui-ux-audit/v2/`](ui-ux-audit/v2/) |

> **Why the score is not 92 %.** v1 projected about 92 % once its fixes landed, and on the v1 rubric the site now scores 90 %. v2 goes further than v1: it judges design quality, brand trust and the animated "tech" layer, not only defects. Under that stricter rubric the site scores 89 %. The engineering is close to best-in-class. What remains is mostly **content, brand and art direction**.

---

## 1. Scorecard

| # | Area | Weight | v1 | **v2** | Δ | One-line judgement |
|---|---|---:|---:|---:|---:|---|
| 1 | Visual design & modernity | 15 % | 86 | **89** | +3 | One CTA colour and a proper dark theme now. The card grids and the hero idea are still generic. |
| 2 | Motion & animated tech elements *(new)* | 10 % | — | **84** | — | A rich, accessible motion system. The signature hero effect is too faint for what it costs to render. |
| 3 | Graphics & imagery | 10 % | 82 | **82** | 0 | The image pipeline is excellent. The imagery is 100 % AI renders, with no people and no product UI. |
| 4 | Layout & alignment | 10 % | 82 | **90** | +8 | Overflow and truncation are fixed. Small rhythm issues remain. |
| 5 | Responsiveness | 10 % | 72 | **93** | +21 | 0 overflows in 84 page loads. The mobile home page is still long. |
| 6 | Performance | 15 % | 85 | **92** | +7 | LCP is 1.2–2.4 s on Slow 4G (was up to 3.3 s), with TBT ≤ 85 ms. |
| 7 | UX & workflows | 15 % | 83 | **85** | +2 | Booking degrades gracefully now. "Work" in the main navigation leads to an empty page. |
| 8 | Accessibility | 10 % | 93 | **96** | +3 | axe is clean in both themes, the toggle exposes its state and tap targets are fixed. |
| 9 | Light / dark theming | 5 % | 86 | **95** | +9 | A clean circular reveal and a layered dark palette. |
| | **Weighted total** | 100 % | 83 | **89** | **+6** | |

### Verification of the v1 fixes (all confirmed on a fresh build)

| v1 item | Claimed | Verified by | Result |
|---|---|---|---|
| P0-1 mobile overflow | Fixed | Overflow scan of 28 routes × 3 viewports | ✅ 0 overflows (was 2) |
| P0-2 Cal.com dead end | Fallback | `/book` network log + screenshot | ✅ No 4xx. Clean "Request a call / Email / WhatsApp" state (`v2/book-fallback.png`) |
| P1-1 hero LCP | Fixed | Slow 4G + 4× CPU | ✅ `/` 3.27 → **2.10 s**, `/academy` 3.01 → **2.36 s**, `/labs` 2.80 → **2.10 s**, `/services` 2.79 → **2.01 s** |
| P1-2 theme wash-out | Fixed | View Transition animation list + frames | ✅ Only the `clip-path` reveal runs (`v2/theme-transition-clean.png`) |
| P1-3 contact truncation | Fixed | Screenshot | ✅ |
| P1-4 CTA colour | Fixed | Screenshots on every template | ✅ Orange is the only primary-action colour, including the header "Let's talk" |
| P2-1 toggle state | Fixed | Accessibility tree | ✅ "Dark theme", `aria-pressed=true/false` |
| P2-2 dark rhythm | Fixed | Dark full-page capture | ✅ Day sections `#0b1631` vs Night `#060d20` (`v2/home-dark.png`) |
| P2-3 page length | Partly | Mobile `scrollHeight` | ⚠️ Home is 13,413 → **11,005 px**, still about 16 phone screens |
| P2-7 tap targets | Fixed | 24 px scan | ✅ Only icon glyphs inside 44 px buttons and inline text links are flagged |
| P2-8 404 game | Fixed | axe | ✅ `nested-interactive` is gone |

---

## 2. Motion & animated tech elements

This section answers the question asked for this review: are the modern, professional animated elements present, and are they done well?

### 2.1 Inventory

| Element | Present | Where | Tech | Quality | Accessibility / performance guard |
|---|:-:|---|---|---|---|
| **Living circuit field** (pointer-reactive nodes and pulses) | ✅ | Home, About, other Night heroes (desktop ≥ 1024 px) | 2D canvas, ~110 nodes, lazy `import()` | ⚠️ Very faint, almost invisible behind the hero (`v2/hero-circuit.png`). See M-1. | Skipped for reduced motion, Lite mode, < 4 cores and phones. Pauses off-screen and in hidden tabs. ✅ Verified |
| **3D dotted globe with Kigali arcs** | ✅ | Home, "Built in Kigali" | WebGL (`cobe`), lazy chunk, fades in | Good craft. Starts facing the Americas and keeps rotating, so the "Kigali" story only shows part of the time. See M-2. | Only ≥ 768 px with WebGL2. A static list carries the same facts. ✅ |
| **Scroll-driven pinned story** (Ideas → Code → Impact) | ✅ | Home | CSS `animation-timeline: view()`, no JS | Strong, Apple-style. The visuals cross-fade as the text scrolls. | Stacked on mobile and with reduced motion. ✅ |
| **Scroll reveals** (`reveal-rise`) | ✅ | Most sections | CSS scroll timelines | Subtle and consistent | Motion-only (text never starts transparent) ✅ |
| **Circuit SVG trace draw + node pulse** (`dash-in`, `node-pulse`, `node-pop`) | ✅ | Hero art, About, Products | SVG + CSS | Elegant brand motif | ✅ |
| **Circular theme reveal** | ✅ | Theme toggle | View Transitions API | ✅ Clean now | Instant swap with reduced motion ✅ |
| **Cursor spotlight cards** | ✅ | Service cards (8) | CSS vars set from `pointermove` via rAF | Subtle, Linear/Vercel style ✅ | Mouse only ✅ |
| **Hover lift + image zoom** | ✅ | Labs and other image cards | `translate: 0 -4px`, `scale: 1.05` | ✅ | — |
| **CTA micro-interaction** | ✅ | Buttons | 1 px lift + ring | Restrained. Could add an arrow nudge. | — |
| **Count-up stats** | ✅ | Stats band | rAF easing, server-rendered final value | ✅ | Real number for no-JS and reduced motion ✅ |
| **Header glass + hide on fast scroll** | ✅ | Global | rAF-throttled scroll listener | ✅ Smooth, though see V-4 for the tint | — |
| **Mega-menu / drawer motion** | ✅ | Global | CSS + native `<dialog>` | ✅ | ✅ |
| **Pillar filter transition** | ✅ | Services | View Transition | ✅ | ✅ |
| **Form "connected" success state** | ✅ | Forms | SVG draw | On-brand | ✅ |
| **Interactive 404 mini-game** | ✅ | 404 | SVG + pointer | Delightful, memorable | ✅ |
| **Logo marquee** | ⏸ Built, hidden | Home | CSS | Hidden until approved client logos exist | Pauses on hover. Static with reduced motion. ✅ |
| **Cross-page View Transitions** | ❌ | — | — | `NEXT_PUBLIC_VIEW_TRANSITIONS` is set in `.env.local`, but nothing in `src/` reads it | — |
| **Animated product UI** (looping app screens or video) | ❌ | — | — | Products and Labs use static mockups and renders | — |
| **Lottie / 3D models / WebGL hero** | ❌ (by choice) | — | — | Not needed. The canvas and globe cover this at a fraction of the weight. | — |

**Verdict:** The site has a more complete and better-guarded motion system than most agency and corporate sites, and it meets the Apple and Microsoft standard for accessibility. Every element respected `prefers-reduced-motion` (0 running animations under that setting). Under Lite mode and on phones the canvases stay off. **The gap is in art direction, not engineering.** The most expensive effect (the circuit field) is the least visible, and the most meaningful one (the globe) does not stay on Kigali.

### 2.2 Motion findings

| # | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| **M-1** | P1 | **The circuit field costs more than it shows.** It redraws every node and trace each frame at up to 2× DPR, which is about 15 M pixels per frame on a 1440p Retina screen. In headless Chromium (software GL), pages with it ran at **15–17 fps against 120 fps** with it off, while script time stayed tiny (15 ms per 3 s), so the cost is rasterisation. On screen, the traces are barely visible. | [circuit-engine.ts:61-68](../src/components/motion/circuit-engine.ts#L61-L68), `v2/hero-circuit.png` | Draw the static traces once to an offscreen canvas or `ImageBitmap` and blit it, then animate only pulses and nearby nodes. Cap at 30 fps and DPR 1.5. **Then raise its visibility** (trace opacity about 0.18 → 0.3, larger pointer halo) so it reads as the site's signature. Verify on a real M-series MacBook and a mid-range Windows laptop. |
| **M-2** | P2 | **The globe doesn't stay on Kigali.** It starts at `phi 0.55` and rotates forever, so for most of each turn the "Built in Kigali" section shows the Americas (`v2/globe.png`). Arcs are hard to see against `dark: 1`. | [globe-engine.ts:16-50](../src/components/motion/globe-engine.ts#L16-L50) | Start centred on Kigali (lng 30.06°). Ease the rotation to a stop or oscillate about ±60° around Africa. Brighten the arcs and Kigali marker (spark orange) and pulse the Kigali dot. Pause on hover. |
| **M-3** | P2 | **No cross-page transitions.** The flag exists but isn't wired up, so page changes are hard cuts. | `.env.local`, `src/` | Enable the View Transitions API for same-origin navigations (`@view-transition { navigation: auto; }`), with a shared `view-transition-name` on the header and hero H1 for an Apple-like continuity. Keep it off for reduced motion. |
| **M-4** | P3 | **Products show no motion.** Nyambika Design is a static phone mockup. | `/products/*` | A 6–8 s muted loop or a CSS-animated screen carousel inside the phone frame, lazy-loaded and paused off-screen. This is the biggest "modern tech" upgrade for the least effort once real screens exist. |

---

## 3. Design judgement by area

### 3.1 Visual design & modernity — 89

**What's working (benchmark level):**
- **Typography has a clear point of view.** Very large display headings with tight tracking, one orange accent word per H1, and monospace eyebrows ("IDEAS → CODE → IMPACT", "KIGALI → WORLD"). It reads like a product company, not a template.
- **The colour system is disciplined now.** Spark orange is used only for action and the accent word. Blue is used for links, focus and selection. Navy sets the Night mood. The same habit is what makes Apple and Stripe pages feel calm.
- **Night → Day rhythm** in both themes, with depth in dark mode (`v2/home-dark.png`).

**What holds it back:**

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| V-1 | P1 | **The hero headline is generic.** "Building digital solutions for a better tomorrow" could belong to thousands of agencies. Beside it, the hero image is a render of UB's own sign, which says "we have a logo", not "here is what we build". Linear, Vercel and Stripe heroes show the product or the outcome. | Lead with the differentiator, for example *"Software, AI and devices — engineered in Kigali, shipped worldwide."* Replace the sign render with a composite of real work: a dashboard, the Nyambika app and a device photo. |
| V-2 | P2 | **The card grids look like a template.** Services (8), Learning areas (8) and Engagement models (4) all use the same white card with a 16 px line icon in a 40 px tile. Eight equal cards in a row give the eye no entry point. | Make one hero card per grid (a 2×2 feature tile with an illustration or screenshot), or use a bento layout with mixed sizes. Increase icon size and colour weight, or replace icons with small product thumbnails. |
| V-3 | P2 | **The story section has dead space on desktop.** Each step is `min-h-[70vh]`, so between steps the left column is mostly empty. | Reduce to about 55vh, or add a progress rail (1 · 2 · 3) beside the sticky visual so the empty scroll feels intentional. |
| V-4 | P3 | **The header glass looks muddy over Night sections in light theme.** Once scrolled, the light frosted header sits over navy as a grey band (top of `v2/globe.png`). | Make the header tint follow the section beneath it (`data-mood` on sections + IntersectionObserver), or keep dark glass while over Night sections. |
| V-5 | P3 | **The mobile wordmark is oversized.** "Universal Bridge Ltd" takes about 70 % of the header width and competes with the H1. | Show the monogram only below 400 px, or set the wordmark at about 15 px. |

### 3.2 Graphics & imagery — 82

- **Pipeline: 10/10.** AVIF at 40–60 KB, `fetchpriority=high` on the first hero, one source per breakpoint, alt text on every image, 0 broken images in 84 loads.
- **Art direction: the weakest part of the site.** Every photograph is an AI render with a "Concept" badge, and 7+ badges are visible across the main templates. The badge is honest, but it reads as "placeholder" to a buyer. There are **no human faces** (team, students, clients), **no real product UI** and **no real office**. Every benchmark site relies on real people and real product.
- **Recommendation (I-1, P1, UB-owned):** a one-day shoot (team at work, academy session, demo day, office exterior) plus real product screenshots. The CMS can swap them without code. This one change moves the most points.

### 3.3 Layout & alignment — 90

- The 12-column container, spacing scale and section rhythm are consistent on every template. Both v1 alignment bugs are fixed.
- **L-1 (P3):** The academy programs grid has 4 cards in a 3-column grid, which leaves one orphan card on its own row (`v2/academy.png`). Use `lg:grid-cols-2` for an even count, or make the 4th card span two columns as "coming next".

### 3.4 Responsiveness — 93

- **0 horizontal overflows** across 28 routes × 3 viewports, plus the team's new 360 px test.
- The services rail on phones, the sticky "Apply now" bar on programs, the native-dialog drawer and 44 px footer links all meet Apple HIG and Fluent guidance.
- **R-1 (P2):** The mobile home page is still **11,005 px** (about 16 screens), and services and Academy are about 7,000 px. Apple's iPhone home page is about 8 screens. Collapse "Labs" into a rail and merge "Built in Kigali" into the footer band on phones.
- **R-2 (P3):** On first visit, the mobile cookie sheet covers about 40 % of the screen, including the hero CTAs (`v2/mobile-home.png`). Use a compact bar with one line of text and three buttons, about 120 px tall.

### 3.5 Performance — 92

Pixel 7 profile, Slow 4G (150 ms RTT, 1.6 Mbps) and 4× CPU throttle, production build:

| Page | FCP | LCP | CLS | TBT | Transferred | JS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 1.44 s | **2.10 s** | 0 | 34 ms | 498 KB | 158 KB |
| `/services` | 1.25 s | **2.01 s** | 0 | 33 ms | 496 KB | 165 KB |
| `/academy` | 1.25 s | **2.36 s** | 0 | 27 ms | 509 KB | 165 KB |
| `/labs` | 1.25 s | **2.10 s** | 0.001 | 31 ms | 601 KB | 165 KB |
| `/company/about` | 1.38 s | **1.78 s** | 0 | 30 ms | 492 KB | 165 KB |
| `/contact` | 1.16 s | 1.16 s | 0 | 85 ms | 468 KB | 176 KB |
| `/book` | 1.19 s | 1.19 s | 0.052 | 25 ms | 438 KB | 161 KB |

**All pages are in the Core Web Vitals "good" range.** Remaining items: about 500 KB per cold page view, mostly 4 preloaded fonts plus the hero image, so consider subsetting the display font. Also the circuit canvas cost on desktop (M-1).

### 3.6 UX & workflows — 85

| Flow | Result |
|---|---|
| Cookie consent → skip link → mega-menu (keyboard, Esc) | ✅ |
| ⌘K search (opens in 38 ms, grouped results) | ✅ |
| Language switch, plus English deep links that keep your saved language | ✅ |
| Contact form: error summary takes focus, inline errors, optional fields marked | ✅ |
| Academy apply: step validation | ✅ |
| Certificate verification: unknown code | ✅ Clear, helpful state |
| Book a call | ✅ Graceful fallback (`v2/book-fallback.png`). ⏳ UB still needs to create the Cal.com event |
| Mobile drawer (focus trap, Esc) | ✅ |

**New findings:**

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| **U-1** | **P1** | **"Work" is in the main navigation but the page is empty.** The page promises **"Proof, not promises."**, then shows nothing and goes straight to the footer (`v2/work-empty.png`). This is the page a buyer opens to judge credibility, and the headline makes the gap more obvious. | Until case studies are approved, either (a) remove "Work" from the navigation and sitemap, or (b) show a designed empty state: the Nyambika product, Labs prototypes, Academy demo-day projects and "Request a reference call". Never ship an empty page under a proof headline. |
| U-2 | P2 | **There is almost no social proof anywhere.** No client logos, testimonials or case studies. The stats band has only "7 years" and "3 languages", which aren't proof points for a buyer. | Bring in approved logos, 2–3 testimonials and outcome numbers as soon as possible. Meanwhile, use proof UB already has: certificates issued, academy graduates and the product's user count. |
| U-3 | P3 | **The contact form has 12 visible fields** (plus 8 service chips). It is well built, but Stripe's and Linear's contact forms have 4–6. | Show name, email, topic and message first, and put company, country, phone, budget, timeline and source under "Add details (optional)". |
| U-4 | P3 | **No `/book` link in the success state.** After the contact form is sent, the user isn't offered the next step. | Add "Want to talk sooner? Book a call / WhatsApp us" to the success panel. |

### 3.7 Accessibility — 96

- axe WCAG 2.2 AA: **0 serious or critical** on every template, in both themes, on desktop and mobile. The only flags are the logo wordmark (exempt under WCAG 1.4.3).
- Skip link, focus management, native dialogs, `aria-pressed` toggle, error summaries and a reduced-motion path for every animation.
- Remaining: 11–11.2 px text inside the decorative story and product mockups (aria-hidden, so it's acceptable) and inline text links under 24 px (WCAG 2.5.8 inline exception).

### 3.8 Light / dark theming — 95

| Check | v1 | v2 |
|---|:-:|:-:|
| Follows OS setting, stored choice overrides it, no flash before paint, persists | ✅ | ✅ |
| Circular reveal without wash-out | ❌ | ✅ |
| Toggle exposes state (`aria-pressed`) and icon is correct before hydration | ❌ | ✅ |
| Dark mode keeps section hierarchy | ❌ | ✅ |
| Reduced motion means an instant swap | ✅ | ✅ |
| axe clean in both themes (7 templates) | ✅ | ✅ |

The remaining 5 points are for V-4 (the header tint over Night sections in light theme).

---

## 4. Benchmark comparison (v2)

| Habit of Apple / Microsoft / Stripe / Linear | Status |
|---|---|
| One primary-action colour | ✅ (fixed) |
| Hero media loads first; LCP < 2.5 s on mobile | ✅ (fixed) |
| No dead-end journeys | ⚠️ `/book` fixed. `/work` is empty (U-1) |
| Real people, real product, real place | ❌ AI renders only (I-1) |
| Differentiated hero message | ⚠️ Generic (V-1) |
| Social proof above the fold or near it | ❌ (U-2) |
| A signature motion moment | ✅ Present (story, globe). ⚠️ The hero circuit is faint and costly (M-1) |
| Smooth page-to-page continuity | ❌ No cross-page View Transitions (M-3) |
| Motion respects user settings | ✅ Better than most |
| Command palette, keyboard-first UX | ✅ |
| Accessible forms | ✅ GOV.UK level |
| Considered dark mode | ✅ |

---

## 5. Road to 95 %+

| Order | Item | Owner | Effort | Score impact |
|---:|---|---|---|---:|
| 1 | **U-1** Hide "Work" or design its empty state | Eng + content | 2 h | +1.5 |
| 2 | **M-1** Cache circuit traces, cap at 30 fps, raise visibility | Eng | 3 h | +1.0 |
| 3 | **V-1** Rewrite the hero message and use a composite of real work | UB + design | 1 day | +1.0 |
| 4 | **I-1** Photo shoot and real product screenshots | UB | 1–2 days | +1.5 |
| 5 | **U-2** Logos, testimonials, outcome stats | UB | Ongoing | +1.0 |
| 6 | **M-2 / M-3** Globe centred on Kigali; cross-page View Transitions | Eng | 3 h | +0.5 |
| 7 | **V-2, V-3, L-1, R-1, R-2, U-3, U-4** Polish | Eng + design | 1–2 days | +1.0 |

**Engineering-only items (1, 2, 6, 7) give about 92 %.** With UB's content (3–5) the site reaches **about 96 %**, alongside the benchmark brands.

---

## 6. Resolution — 2026-10-10

Every engineering item is fixed. Each one has a test in [`tests/e2e/ux-audit.spec.ts`](../tests/e2e/ux-audit.spec.ts), or in `marketing.spec.ts` for U-1, which needs a fixed order around case-study data. Numbers below are re-measured on a fresh production build: Pixel 7, Slow 4G, 4× CPU. Verified on that build: 245 E2E tests pass (desktop and phone), 62 unit tests pass, and typecheck, lint, i18n, content, contrast and CSP checks are clean.

| # | Status | What changed |
|---|---|---|
| U-1 | ✅ | Until a case study is published, `/work` shows proof a buyer can check: the live product with an animated phone, Labs prototypes, verifiable certificates, demo days, and a "Request a reference call" CTA. "Proof, not promises" only appears once real case studies exist. |
| M-1 | ✅ | The circuit field draws its traces and idle nodes once, to an offscreen layer. Each frame copies that layer and draws only the live parts. It runs at 30 fps with DPR capped at 1.5. It is more visible: brighter traces, large hollow ring nodes (brand motif), a pointer glow that lights nearby traces, and ambient comet pulses. |
| M-2 | ✅ | The globe is centred on Kigali and swings ±50° around Africa. The Kigali marker pulses in spark orange and the arcs are brighter. Hovering pauses it, and it can be dragged; it springs back to Kigali when released. |
| M-3 | ✅ | Cross-page View Transitions (`@view-transition`, `page` type). The header stays in place, the new page rises in, and case-study and Labs cards morph into their detail covers. Off under reduced motion. The dead `NEXT_PUBLIC_VIEW_TRANSITIONS` flag was removed. |
| M-4 | ✅ | The product phone runs a CSS-only screen loop (home screen + one screen per CMS feature) with progress dots. Reduced motion and Lite mode show the home screen only. |
| V-1 | ✅ code · ⏳ real screens | The new headline is "Software, AI and devices — *engineered* in Kigali." The sign render is replaced by an interactive showcase (dashboard, the live product's app, a Labs sensor) with pointer parallax. The H1 is now the LCP element. Real product screenshots can replace the illustrations later. |
| V-2 | ✅ | The home services grid is a bento: a 2×2 feature tile, a wide tile and six singles. All icon tiles are larger and move on hover. |
| V-3 | ✅ | Story steps are 55vh (were 70vh), with a 1·2·3 progress rail lit by the same scroll timelines. |
| V-4 | ✅ | Over a Night section, the header switches to Night tokens (dark glass, white logo). In light theme over Day content it uses the master-blue logo. |
| V-5 | ✅ | The wordmark is 15 px on phones, and "Ltd" is hidden below 400 px. |
| L-1 | ✅ | Program grids choose a balanced column count (4 cards → 2×2). |
| R-1 | ✅ | On phones, Labs is a swipe rail, the "Built in Kigali" points show titles only, and the inactive globe no longer takes up space. Mobile home is about 9,300 px (was 11,005, and 13,413 at v1). |
| R-2 | ✅ | The cookie consent is a compact bar on phones: one line and three equal buttons. |
| U-3 | ✅ | The contact form shows topic, name, email and message. Everything else is under "More details (optional)", a native `<details>` that opens itself when it holds a value or an error. |
| U-4 | ✅ | The success panel offers "Want to talk sooner? Book a call". |
| §3.5 fonts | ✅ | Only the Latin subset is preloaded (2 fonts, was 4). Extended characters still load on demand through `unicode-range` (verified in the built CSS). |
| Copy | ✅ | About 70 strings were shortened across en/fr/rw: page leads, card and summary text, FAQ answers, cookie text and UI leads. Legal pages and articles keep their full length. |
| JS budget | ✅ | Interactive islands (circuit, globe, parallax, count-up, spotlight) are now server markup with `data-fx` hooks. One small loader fetches each behaviour only when an element on the page uses it. All 23 pages are within 150 KB; the form pages are at 149.3 KB, so this stays tight. |
| I-1, U-2 | ⏳ UB | Real photography, product screenshots, approved client logos and testimonials. |

**Performance (LCP):** `/` 2.10 → **1.69 s**, `/services` 2.01 → **1.72 s**, `/academy` 2.36 → **1.95 s**, `/labs` 2.10 → **1.64 s**, `/work` and `/contact` **1.17 s**.
