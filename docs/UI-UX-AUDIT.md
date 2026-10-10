# UI/UX audit — Universal Bridge website

| | |
|---|---|
| **Date** | 2026-10-09 |
| **Build tested** | Production build of the current `main` (`next build` → `next start`), plus the running dev server for cross-checks |
| **Content** | Local seed data (PostgreSQL), en / fr / rw |
| **Overall grade** | **83 %** (B) — projected **≈ 92 %** once the five P0/P1 items below are fixed |

Screenshots referenced in this report are in [`docs/ui-ux-audit/`](ui-ux-audit/).

---

## 1. Scorecard

| # | Area | Weight | Score | Verdict |
|---|---|---:|---:|---|
| 1 | Visual design & modernity | 15 % | **86** | Confident, current, on-brand. Some inconsistent CTA colours and a few sections with little content. |
| 2 | Graphics & image handling | 10 % | **82** | Image pipeline is excellent (AVIF, 40–60 KB, alt text everywhere). Imagery is AI concept art, and the hero image is lazy-loaded even though it is the LCP element. |
| 3 | Layout & alignment | 10 % | **82** | Clean grid and spacing on every template. One overflow bug on mobile and truncated contact details. |
| 4 | Responsiveness | 15 % | **72** | 27 of 28 routes work well at 390 / 820 / 1440 px. **The mobile home page is broken**, and it is the most-visited page. |
| 5 | Performance | 15 % | **85** | Very fast on a good connection, with near-zero CLS and low TBT. LCP is 2.8–3.3 s on Slow 4G for pages with an image hero, and home-page JS is just over budget. |
| 6 | UX & workflows | 15 % | **83** | Forms, search, certificate check and navigation are excellent. **"Book a call" leads to a dead end** (Cal.com 404). |
| 7 | Accessibility | 10 % | **93** | axe is clean (WCAG 2.2 AA) on every template in light and dark mode. There are skip links, focus management and full keyboard paths. Only minor issues. |
| 8 | Light / dark theming | 10 % | **86** | Follows the system setting, persists, has no flash on load, respects reduced motion and passes axe in both themes. The circular transition washes out mid-animation. |
| | **Weighted total** | 100 % | **83** | |

### How the site compares to Apple, Microsoft and Stripe

| Benchmark habit | Apple / Microsoft / Stripe | Universal Bridge |
|---|---|---|
| One clear primary-action colour per page | Apple uses one blue for links and CTAs. Microsoft Fluent uses one accent. | ⚠️ The primary CTA is orange in heroes, blue on forms and pale blue in the dark header. |
| Real photography of real people and places | Always | ⚠️ AI renders labelled "Concept". This is honest, but it weakens trust. |
| Hero media loads first | Apple preloads hero media, and Microsoft uses `fetchpriority=high` on hero images | ❌ The hero image has `loading="lazy"` but is the LCP element on 6 templates. |
| Never-broken primary journey | Every "Contact sales" or "Book" link works | ❌ The booking page embeds a missing Cal.com event. |
| Theme switch | macOS / Windows: instant or a clean cross-fade | ⚠️ A circular reveal is used, but the old snapshot fades out underneath it. |
| Command palette search | Microsoft Learn, Stripe Docs (⌘K) | ✅ ⌘K opens in about 40 ms, results are grouped, and Esc closes it. |
| Accessible forms | GOV.UK-level error summaries | ✅ Error summary, inline messages and focus moved to the summary. Matches best practice. |
| Motion respects user settings | Yes | ✅ `prefers-reduced-motion` is honoured for the theme switch, view transitions and scroll stories. |

---

## 2. Method

- **Routes:** 28 (all marketing, academy, company, legal, localised `/fr` and `/rw`, and the 404 page) at **desktop 1440×900**, **tablet 820×1180 (touch)** and **mobile iPhone 13 (390×844)**, checked with Playwright on Chromium.
- **Per page:** HTTP status, console errors, failed requests, horizontal overflow, broken or oversized images, missing `alt`, text under 12 px, tap targets under 24 px, heading outline, DOM size, TTFB, FCP, LCP (and its element), CLS, and transferred bytes.
- **Accessibility:** axe-core with `wcag2a/aa`, `wcag21aa` and `wcag22aa` tags, on desktop and mobile, in both light and dark themes.
- **Performance under realistic conditions:** Pixel 7 profile, **Slow 4G (150 ms RTT, 1.6 Mbps) and 4× CPU throttle**.
- **Workflows:** cookie consent, skip link, mega-menu (open and Esc), mobile drawer (focus trap and Esc), ⌘K search (results and empty state), language switch, contact form with empty submit, academy application step 1, certificate verification with an unknown code, and booking a call.
- **Themes:** system-preference detection (light and dark), stored preference overriding the OS, flash-of-wrong-theme check, the toggle's View Transition frame by frame, persistence after reload, and reduced-motion behaviour.

> Note: localhost timings without throttling are optimistic. The throttled numbers in §6 are the ones to compare against Core Web Vitals.

---

## 3. Findings by priority

### P0 — fix before launch

#### P0-1 Mobile home page overflows horizontally, so the header controls and cookie banner are off-screen
- **Where:** `/` and `/fr` on every phone width tested (320–414 px). The layout viewport grows to **~464 px**.
- **Effect:** On a 390 px phone the menu button, language switcher and theme toggle sit outside the screen. The cookie banner is clipped, the page pans sideways, and iOS zooms the page out. This is the first thing most mobile visitors see.
- **Cause:** [StoryPin.tsx:12](../src/components/motion/StoryPin.tsx#L12) uses a bare `grid`. The implicit `auto` column sizes to the min-content of the mobile visuals in [StoryVisuals.tsx](../src/blocks/StoryVisuals.tsx): `IdeasVisual` has a 3-column note grid with `p-8`, and `ImpactVisual` has a fixed `w-44` phone, `gap-8`, the metric and `p-8`. Together they need about 448 px.
- **Fix:** Use `grid-cols-1 lg:grid-cols-2` (or `grid-cols-[minmax(0,1fr)]`) on `.story`, add `min-w-0` to the `<ol>`, and reduce the mobile padding of the visuals to `p-4 sm:p-8`. Add an E2E assertion that `scrollWidth === clientWidth` at 360 px for every template.
- **Evidence:** `ui-ux-audit/mobile-home-overflow.png`

#### P0-2 "Book a discovery call" dead end
- **Where:** `/book`, which is linked from the Services CTA band, the contact form footer and the home page.
- **Effect:** The Cal.com iframe shows Cal's own **"Error 404 — This page does not exist"**, with links to Cal's documentation and blog. This is the strongest-intent action on the site. The page also takes 3–7 s to settle because of the iframe.
- **Cause:** `NEXT_PUBLIC_CAL_LINK` points to `universal-bridge/discovery`, which does not exist on Cal.com.
- **Fix:** Create the event, or fix the link. The page should also detect a failed embed and show the "Email us" fallback prominently, since the 404 loads inside the iframe and the current hint is easy to miss. Load the iframe only after a click ("Show available times") so the page stays fast.
- **Evidence:** `ui-ux-audit/book-cal-404.png`

### P1 — high impact, low effort

#### P1-1 Hero images are lazy-loaded but are the LCP element
- **Where:** Home, Solutions, Labs, Academy, About, Careers and Internships. On those pages the LCP element is `IMG.object-cover`.
- **Measured (Slow 4G, 4× CPU):** LCP is **3.27 s** on home, **3.01 s** on Academy and **2.80 s** on Labs and Services. Pages where the H1 is the LCP element finish in about **1.2 s**.
- **Fix:** Give the hero `<Media>` `priority` (`fetchpriority="high"`, no `loading="lazy"`), or keep it lazy and make it smaller than the H1 on mobile so the H1 stays the LCP element, as [PROGRESS.md](PROGRESS.md) intends. Either change should bring these pages under the 2.5 s "good" threshold.

#### P1-2 Theme transition washes out halfway
- **Where:** [ThemeToggle.tsx](../src/components/layout/ThemeToggle.tsx) together with [globals.css:379-383](../src/styles/globals.css#L379-L383)
- **Effect:** For about 200 ms the area outside the reveal circle turns flat grey (see `ui-ux-audit/theme-transition-washout.png`). The default `::view-transition-old/new(root)` cross-fade (220 ms) still runs underneath the 450 ms circular `clip-path`, so the old snapshot fades out before the circle covers it.
- **Fix:**
  ```css
  ::view-transition-old(root),
  ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  ```
  Keep the 220 ms default only for page-to-page transitions by giving those a named transition, or apply the rule above only when `html` has a `[data-theme-switching]` class that the toggle sets.

#### P1-3 Contact details are truncated
- **Where:** `/contact`, in the email, phone and WhatsApp cards at desktop width ("hello@univ…", "+250 782 6…").
- **Effect:** The most important information on the page is cut off. Users have to copy it without seeing it.
- **Fix:** Use a single-column stack or `grid-cols-1 xl:grid-cols-2` for these cards, allow wrapping (`break-all` for the email), or remove the label line.

#### P1-4 Inconsistent primary-action colour
- Hero and section CTAs are **orange** ("Start a project", "Book a call"). Form submits are **blue** ("Send"). The header CTA "Let's talk" is **pale blue on navy** and is the weakest button on the screen.
- Apple, Microsoft and Stripe all keep one primary-action colour. Pick one: orange "spark" fits the brand and already passes contrast on navy and white. Use blue for links and secondary actions, and make the header CTA match.

### P2 — polish

| # | Issue | Where | Suggestion |
|---|---|---|---|
| P2-1 | The theme toggle label is always "Switch theme". It doesn't say which theme is active, and there is no `aria-pressed`. The Sun icon renders before hydration even in dark mode, so the icon flickers. | `ThemeToggle.tsx` | Use the label "Switch to light/dark theme" or `aria-pressed={isDark}`. Render both icons and let CSS `[data-theme=dark]` choose, so there is no hydration flicker. |
| P2-2 | In dark mode, the hero, content sections and footer are all the same navy, so the Night/Day section rhythm disappears. | All pages, dark theme | Use a slightly lifted surface (`--bg-raised`) for "Day" sections in dark mode, as Apple and Microsoft do with layered greys. |
| P2-3 | The mobile home page is **13,400 px** tall (about 16 screens). The services grid, story, process, labs, product, "built in Kigali" and academy sections all stack. | `/` mobile | Collapse the 8 service cards into a horizontal scroll-snap rail on mobile, and drop one of "Story" or "Process" because they tell the same story twice. |
| P2-4 | Mockup text in the story and product visuals is 11.2 px. | `StoryVisuals.tsx`, `ProductCard` | Acceptable as decoration, but mark the mobile copies `aria-hidden`. Right now screen readers read "Farmers need prices before market day…" as content. |
| P2-5 | The `CodeVisual` card is about 70 % empty (4 code lines in a 4:3 card). | Home story, desktop | Add a terminal or "deploy ✓" strip, or use `aspect-[16/9]`. |
| P2-6 | The stats band shows only two stats in a full-width card, which looks unfinished. | Home, "Numbers we can stand behind" | Render 2 stats as inline highlights instead of a grid until more are verified. |
| P2-7 | Footer legal links and breadcrumbs are 17–21 px tall. They pass WCAG 2.5.8 through the spacing exception but fall short of the Apple HIG / Fluent 44 px guidance. | Footer, breadcrumbs (mobile) | Add `py-2` to these links on mobile. |
| P2-8 | 404 mini-game: an SVG with `role="img"` contains interactive children. axe reports `nested-interactive`, serious. | [BridgeGame.tsx:32](../src/features/not-found/BridgeGame.tsx#L32) | Use `role="application"` or `group` with instructions, or move the handles out of the `img` role. |
| P2-9 | Locale "stickiness": after one visit to `/rw/...`, unprefixed URLs such as `/legal/privacy` serve Kinyarwanda. This is by design (cookie), but surprising when someone shares an English link. | next-intl cookie | Consider a one-time "View this page in English?" banner when the URL has no prefix but the cookie locale is not English. |
| P2-10 | Home page JS is **155–192 KB** transferred (gzip). The budget in ADR-007 is 150 KB Brotli. | `/` | Measure with Brotli in the deploy environment. If it is still over, lazy-load the globe (`cobe`) only when it enters the viewport. |
| P2-11 | Imagery is AI concept renders, honestly labelled "Concept". | Heroes, Labs, Academy | This is the biggest gap against the benchmark brands. Plan a real photo shoot (team, office, academy students) and swap the images through the CMS. |

---

## 4. What already works well

These match or exceed the benchmark sites and should be protected with tests:

- **Typography and hierarchy.** The large display headings with tight tracking, the orange accent word in each H1 and the monospace eyebrows look current, close to Apple's product pages. Every template has exactly one H1.
- **Night → Day section rhythm** on light theme gives a premium, Stripe-like feel (see `ui-ux-audit/desktop-home.png`).
- **Image pipeline.** `next/image` serves AVIF/WebP. Hero renders went from 2 MB PNG to **40–60 KB AVIF**. Every image has alt text, and none were broken or oversized in 84 page loads.
- **Layout stability.** CLS is **0–0.007** on every page and viewport, and at most 0.06 under throttling.
- **Interactivity cost.** Total blocking time is **34–79 ms** under 4× CPU throttling. Most interior pages ship under 25 KB of page-specific JS.
- **Forms.** The contact form (see `ui-ux-audit/contact-validation.png`) has an error summary that receives focus, linked inline errors, "optional" labels, correct `autocomplete`, a phone country picker, and works without JavaScript. The multi-step academy application validates each step.
- **Search.** The ⌘K palette opens in about 40 ms, results are grouped (Services / Pages), and it has keyboard selection and Esc to close.
- **Navigation.** The mega-menu supports arrow keys and Esc. The mobile drawer is a native `<dialog>` with a focus trap. The skip link is the first Tab stop. Breadcrumbs have JSON-LD.
- **Certificate verification.** A clear "We couldn't find this certificate" state that explains the code format.
- **Academy program page (mobile).** A sticky "Starts Dec 8 · 12 seats left · Apply now" bar, which is a good conversion pattern.
- **Theming.** Follows the OS setting by default, a stored choice overrides the OS, the theme is applied before first paint (no flash), it persists after reload, reduced-motion skips the animation, and axe is clean on 7 templates in both themes.
- **Accessibility.** No serious or critical axe violations on any content template in either theme. The only flags are the logo wordmark, which is exempt under WCAG 1.4.3, and the 404 game (P2-8).
- **i18n.** en / fr / rw with localised titles, `lang` attribute and URLs. The language switcher keeps the current page.

---

## 5. Responsiveness matrix

| Template | 390 px (iPhone 13) | 820 px (iPad Air) | 1440 px |
|---|:-:|:-:|:-:|
| Home (`/`, `/fr`) | ❌ overflow (P0-1) | ✅ | ✅ |
| Services / service detail | ✅ | ✅ | ✅ |
| Solutions / industry detail | ✅ | ✅ | ✅ |
| Work, Products, Product detail | ✅ | ✅ | ✅ |
| Labs, Insights | ✅ | ✅ | ✅ |
| Academy, Programs, Program detail | ✅ | ✅ | ✅ |
| Apply, Internships, Verify | ✅ | ✅ | ✅ |
| About, Leadership, Careers, Partners, Events, Press | ✅ | ✅ | ✅ |
| Contact | ✅ | ✅ (decorative map SVG 5 px over, clipped) | ⚠️ truncated cards (P1-3) |
| Book | ⚠️ (P0-2) | ⚠️ | ⚠️ |
| Legal, 404 | ✅ | ✅ | ✅ |

---

## 6. Performance data

### Simulated mid-range phone (Pixel 7, Slow 4G, 4× CPU), production build

| Page | FCP | LCP | CLS | TBT | Transferred | JS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 1.63 s | **3.27 s** | 0 | 57 ms | 497 KB | 159 KB |
| `/services` | 1.26 s | **2.79 s** | 0.062 | 45 ms | 496 KB | 168 KB |
| `/academy` | 1.23 s | **3.01 s** | 0 | 64 ms | 510 KB | 168 KB |
| `/labs` | 1.19 s | **2.80 s** | 0 | 34 ms | 602 KB | 168 KB |
| `/academy/apply` | 1.18 s | 1.18 s | 0.012 | 62 ms | 467 KB | 178 KB |
| `/contact` | 1.17 s | 1.17 s | 0 | 79 ms | 467 KB | 177 KB |

Core Web Vitals targets: LCP ≤ 2.5 s (4 of 6 pages fail, all because of P1-1), CLS ≤ 0.1 (all pass), INP/TBT (all pass).

### Fast connection (localhost, no throttling)

- TTFB is 6–46 ms, FCP is 80–190 ms, and LCP is under 530 ms on every page except `/book`.
- `/book` takes 2.7–7.0 s to fire `load` because of the third-party iframe.

---

## 7. Light / dark theme test results

| Check | Result |
|---|---|
| OS set to light → site light; OS set to dark → site dark | ✅ (`data-theme`, `color-scheme` and body background all switch) |
| Stored "dark" overrides OS "light" | ✅ |
| Correct theme before first paint (no flash) | ✅ (theme already applied at the first `readystatechange`) |
| Choice persists after reload | ✅ |
| Circular View Transition from the toggle | ⚠️ It runs, but the default cross-fade stacks on top of it and washes out the screen (P1-2) |
| `prefers-reduced-motion: reduce` | ✅ Instant swap, no animations |
| axe WCAG 2.2 AA, light: `/`, services, academy, contact, program, about, insights | ✅ 0 serious/critical |
| axe WCAG 2.2 AA, dark: same 7 pages | ✅ 0 serious/critical |
| Toggle exposes its current state to screen readers | ❌ Static label, no `aria-pressed` (P2-1) |
| Toggle icon matches theme before hydration | ⚠️ Sun shows briefly in dark mode (P2-1) |
| Visual hierarchy preserved in dark mode | ⚠️ Sections merge into one navy surface (P2-2) |

---

## 8. Recommended order of work

1. **P0-1** Fix the story-grid overflow and add an overflow assertion to the E2E suite (about 1 hour).
2. **P0-2** Fix the Cal.com link, add a fallback when the embed fails, and load the iframe on click (about 2 hours).
3. **P1-1** Prioritise hero images (about 30 minutes). LCP should drop below 2.5 s on Slow 4G.
4. **P1-2** Fix the View Transition CSS for the theme switch (about 15 minutes).
5. **P1-3 / P1-4** Fix the contact card layout and unify the primary CTA colour (about 2 hours).
6. Then the P2 polish, and plan the real photography (P2-11) with UB.

Fixing items 1–5 should raise the grade to about **92 %**. Real photography and the P2 polish should bring it to about 95 %.

---

## 9. Note on stale builds

During testing, a production build made at 21:00 served **404s for `/labs`, `/insights`, `/company/*` and `/legal/*`**, because those pages were seeded at 21:44, after the build ran. A fresh build fixed it. In production, content is published through Payload, which triggers revalidation, so this should not happen. However, `pnpm db:seed` (or any write outside Payload hooks) after a build leaves those pages as cached 404s until the next build or a call to `/api/revalidate`. Add a revalidate call at the end of the seed script, or document this in the README deploy steps.

---

## 10. Resolution — 2026-10-09

All findings that code can fix are fixed. Each one is covered by a test in [`tests/e2e/ux-audit.spec.ts`](../tests/e2e/ux-audit.spec.ts), unless noted otherwise. Verified on the production build: 237 E2E tests pass (desktop and phone), 62 unit tests pass, and all 23 measured pages are within the 150 KB JS budget.

| # | Status | What changed |
|---|---|---|
| P0-1 | ✅ Fixed | The story grid uses `minmax(0,1fr)` columns, and its visuals have tighter mobile padding. A test checks for horizontal overflow at 360 px on 26 templates. |
| P0-2 | ✅ Fixed in code · ⏳ UB | The server checks that the Cal.com event exists (cached for 1 h). If it doesn't, `/book` shows "Request a call", email and WhatsApp instead of Cal's 404. When it does, the calendar only loads after "Show available times", so the page stays fast. **UB still needs to create the `universal-bridge/discovery` event on Cal.com, or set `NEXT_PUBLIC_CAL_LINK` to the right one.** |
| P1-1 | ✅ Fixed | Each hero now uses one image for every breakpoint (phones no longer download a second copy). The first hero loads it with `loading="eager"` and `fetchpriority="high"`, using Next 16's replacement for `priority`. Re-measured on the same profile (Pixel 7, Slow 4G, 4× CPU): `/` 3.27 → **2.04 s**, `/academy` 3.01 → **2.28 s**, `/labs` 2.80 → **2.04 s**, `/services` 2.79 → **1.92 s**. About, Careers and Internships are 1.80–1.88 s. CLS is 0 everywhere. |
| P1-2 | ✅ Fixed | While the theme switches, `html[data-theme-switching]` turns off the default cross-fade, so only the circular reveal runs. |
| P1-3 | ✅ Fixed | The contact cards are single-column on desktop and wrap long values instead of truncating them. Tested at 1440, 1024 and 390 px. |
| P1-4 | ✅ Fixed | Every primary button, including "Let's talk" in the header and form submits, uses the orange spark. Blue is kept for links, focus, selection and secondary actions. |
| P2-1 | ✅ Fixed | The toggle is now a "Dark theme" toggle button with `aria-pressed`. The icon is chosen by CSS from `data-theme`, so it is right before hydration. |
| P2-2 | ✅ Fixed | In dark theme, Day sections use a lifted navy (`#0b1631`, surfaces `#112043`) and Night sections keep `navy-950`. axe still passes in dark theme. |
| P2-3 | ✅ Fixed | Outside the Services overview, the services grid becomes a swipeable rail on phones. The Process section was removed from the home page because the Ideas → Code → Impact story covers it. |
| P2-4 | ✅ Fixed | The phone copies of the story mockups are `aria-hidden`. |
| P2-5 | ✅ Fixed | The code card has a build → tests → staging pipeline strip. |
| P2-6 | ✅ Fixed | One or two stats now appear as highlights beside the heading. The grid returns at three or more. |
| P2-7 | ✅ Fixed | Footer legal links are 44 px tall on phones, and breadcrumb links have `py-2.5`. |
| P2-8 | ✅ Fixed | The game's SVG is a labelled `role="group"`. The 404 test now runs axe. |
| P2-9 | ✅ Fixed | Unprefixed deep links always serve English and leave the saved language unchanged. `/` still opens in the saved language. English pages offer "Soma mu Kinyarwanda" / "Voir en français" in the visitor's language, and the offer can be dismissed. The ⌘K language action now saves the choice, as the switcher does. |
| P2-10 | ✅ Within budget | Measured with Brotli on the production build: home is 133.8 KB. The globe and living-circuit drawing code load with `import()` only on capable devices. **Watch:** careers, partners and internships are at 149.7 KB, 0.3 KB under the budget. |
| P2-11 | ⏳ UB | Real photography can only come from a photo shoot (OI-06). The CMS swaps images without code changes. |
| §9 | ✅ Documented | The README's deployment section explains when and how to revalidate after writing content outside the CMS editor. `pnpm db:seed` already revalidates the site at `NEXT_PUBLIC_SITE_URL`. |

**Grade.** Using this audit's weights and re-measured numbers, every finding the code can fix is closed. Two items are still open, and both need UB rather than engineering: the Cal.com event (P0-2) and real photography (P2-11). Until they are done, the site sits just below a perfect score in "UX & workflows" and "Graphics", although no journey dead-ends any more.
