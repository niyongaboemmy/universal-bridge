# UI/UX audit v3 — Universal Bridge website

| | |
|---|---|
| **Date** | 2026-10-10 |
| **Build tested** | Fresh production build of the current working tree (`next build` → `next start`) |
| **Previous audits** | [v1](UI-UX-AUDIT.md) 83 % · [v2](UI-UX-AUDIT-v2.md) 89 % |
| **Overall grade** | **90.5 %** (A−) |
| **Evidence** | [`docs/ui-ux-audit/v3/`](ui-ux-audit/v3/) |

> **Summary.** Every v2 engineering item was delivered, and most were delivered well. The new hero, the Work page and the performance gains are real wins. v3 also found **two regressions** (an intermittent horizontal overflow on mobile and a layout shift on the Academy application) and a few **design side effects** of the new motion layer. Fixing the regressions and collisions (about one day of engineering) gives about **92.5 %**. UB's own content (photos, client proof) is what lifts the site to about **96 %**.

---

## 1. Scorecard

| # | Area | Weight | v1 | v2 | **v3** | Δ v2 | One-line judgement |
|---|---|---:|---:|---:|---:|---:|---|
| 1 | Visual design & modernity | 15 % | 86 | 89 | **90** | +1 | A much stronger hero and Work page. Light theme lost its Night/Day rhythm, and the circuit traces collide with the navigation. |
| 2 | Motion & animated tech elements | 10 % | — | 84 | **86** | +2 | Every v2 motion item is done. The home page now runs 98 animations at once, and transitions apply to some navigations but not others. |
| 3 | Graphics & imagery | 10 % | 82 | 82 | **85** | +3 | The hero is now a product showcase instead of a sign render. Other heroes still use AI renders, and there are still no people. |
| 4 | Layout & alignment | 10 % | 82 | 90 | **89** | −1 | Balanced grids now. New overlaps: traces behind the nav, and a chip covering the product's name. |
| 5 | Responsiveness | 10 % | 72 | 93 | **90** | −3 | **Regression:** the rotating product orbit makes the mobile home page scroll sideways now and then. |
| 6 | Performance | 15 % | 85 | 92 | **94** | +2 | LCP is 1.0–1.9 s on Slow 4G, pages are 20 % lighter and only 2 fonts are preloaded. Home-page TBT has risen to about 165 ms. |
| 7 | UX & workflows | 15 % | 83 | 85 | **90** | +5 | The Work page is now an honest proof page, and the contact form is short. **Regression:** the Academy application shifts by 0.121 CLS on desktop. |
| 8 | Accessibility | 10 % | 93 | 96 | **96** | 0 | axe is clean in both themes on all 30 templates, and reduced motion is respected everywhere. |
| 9 | Light / dark theming | 5 % | 86 | 95 | **96** | +1 | The mechanics are excellent. The header follows the section mood. |
| | **Weighted total** | 100 % | **83** | **89** | **90.5** | **+1.5** | |

---

## 2. Verification of the v2 fixes

All checks ran on a fresh production build: 30 routes × 3 viewports (90 page loads) plus targeted scripts.

| v2 item | Claimed | Verified result |
|---|---|---|
| **U-1** Empty Work page | ✅ | ✅ **Excellent.** "Work you can see today." A bento with the live product, labs, verifiable certificates, events and an orange "Request a reference call" panel (`v3/work.png`). |
| **M-1** Circuit cost and visibility | ✅ | ✅ The traces are now clearly visible (hollow-ring nodes, pointer glow). An offscreen layer, a 30 fps cap and a DPR 1.5 cap are in the code. Off under reduced motion, Lite mode and on phones (0 canvases running). ⚠️ The traces now run behind the navigation (see V3-3). |
| **M-2** Globe centred on Kigali | ✅ | ✅ Centred on Africa with a pulsing orange Kigali marker (`v3/globe-kigali.png`). A static WebP is shown until the WebGL globe is ready. |
| **M-3** Cross-page View Transitions | ✅ | ⚠️ **Partly.** Works for full-page navigations (cards, CTAs). Header and footer links use client-side navigation and get **no transition** (see M3-1). |
| **M-4** Product screen loop | ✅ | ✅ A CSS loop with progress dots. Static under reduced motion and Lite mode. |
| **V-1** Hero message + showcase | ✅ | ✅ **Big improvement.** "Software, AI and devices — *engineered* in Kigali." A dashboard, the live app and a soil-moisture sensor card. The H1 is the LCP element (`v3/hero-light.png`). |
| **V-2** Services bento | ✅ | ✅ On the home page. ⚠️ Academy "What you can learn" is still 8 identical cards (`v3/academy.png`). |
| **V-3** Story rhythm | ✅ | ✅ 55vh steps with a 1·2·3 progress rail driven by scroll timelines. |
| **V-4** Header over Night sections | ✅ | ✅ The header uses Night tokens over Night sections. |
| **V-5** Mobile wordmark | ✅ | ✅ "Universal Bridge" without "Ltd" on narrow phones (`v3/mobile-home-first.png`). |
| **L-1** Orphan program card | ✅ | ✅ 2×2. |
| **R-1** Mobile page length | ✅ | ✅ Home is **9,747 px** on mobile (v2 11,005, v1 13,413). |
| **R-2** Compact cookie bar | ✅ | ⚠️ The bar is 145 px tall. It still covers the secondary hero button on the first visit. |
| **U-3** Short contact form | ✅ | ✅ Topic, name, email and message, with the rest under "More details (optional)" in a native `<details>`. The error summary still takes focus. |
| **U-4** Next step after sending | ✅ | ✅ "Want to talk sooner? Book a call" in the success panel ([ContactForm.tsx:200](../src/features/contact/ContactForm.tsx#L200)). |
| Fonts | ✅ | ✅ 105 KB of fonts per cold page view, with 2 preloads. |
| JS budget | ✅ | ✅ 164–180 KB transferred (gzip, localhost) per first load. Interactive effects load through `data-fx` hooks. |

---

## 3. New findings in v3

### 3.1 Regressions — fix first

#### R3-1 (P1) The mobile home page scrolls sideways now and then
- **Where:** `/`, `/fr` and `/products` on phones. The product stage in [ProductSpotlight.tsx:26-27](../src/blocks/ProductSpotlight.tsx#L26-L27).
- **Measured:** On an iPhone 13 viewport, `scrollWidth` cycled **390 → 403 → 418 → 413 → 390 px** every few seconds over 30 s.
- **Cause:** The two `.product-orbit` rings rotate forever (`@keyframes orbit { to { rotate: 360deg } }`). The ring is round, but its **box** is square. A rotated square's bounding box grows by up to √2 (about 41 %) at 45°, and that larger box counts towards page overflow. The phone stage is close to full width on mobile, so at some angles the page becomes wider than the screen.
- **Why the team's test passes:** It measures once, and whether the page overflows depends on the ring's angle at that moment, so the test passes or fails by chance.
- **Fix:** Add `overflow: clip` (or `contain: paint`) to `.product-stage`, or animate the dashed border with `background: conic-gradient` / an SVG `<circle>` rotated inside an `overflow:hidden` wrapper. Make the E2E overflow check sample several times over about 10 s, or pause animations (`document.getAnimations().forEach(a => a.pause())`) at the angle where the box is largest before measuring.

#### R3-2 (P1) The Academy application shifts after hydration (CLS 0.121, desktop)
- **Where:** `/academy/apply` at 1440 px. Reproduced 3 out of 3 times. v2 measured 0.004 here.
- **Measured:** About 170 ms after load, the field grid moves down 25 px and a progress bar is inserted (`DIV.grid gap-5 sm:grid-cols-2 477→502`).
- **Cause:** `stepMode = Boolean(steps) && hydrated` ([FormEngine.tsx:282](../src/components/forms/FormEngine.tsx#L282)). The server renders the no-JS layout (all steps as one form). On hydration the component switches to step mode and inserts the step header and progress bar above the fields.
- **Fix:** Render the step header and progress bar on the server too, and reserve their height. Then hide steps 2–4 with CSS until JS is ready, keyed off a `data-js` attribute set by an inline script in `<head>`. The no-JS layout stays unchanged because `data-js` is never set. Add a CLS assertion (< 0.05) for the form pages.

### 3.2 Visual design

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| **V3-1** | P2 | **Light theme lost its rhythm.** "Night" sections are now "accent paper" (off-white with a dot grid) with soft fades ([globals.css:946-970](../src/styles/globals.css#L946-L970)). The home page reads as one long pale surface. The navy and orange contrast that made v1 and v2 look distinctive now only appears in dark mode (`v3/home-light-full.png` vs `v3/home-dark-full.png`). The look is cleaner, in the Stripe/Linear style, but sections are harder to tell apart, and the final "Let's build what's next" band no longer stands out. | Keep the paper hero, but bring back **one or two** solid navy anchor bands in light theme: the final CTA band and "Built in Kigali" (where the globe looks best on navy). Apple's product pages use the same pattern: mostly light, with a few dark moments. |
| **V3-2** | P2 | **The product stage has a collision.** The floating "Custom sewing orders" chip covers the app title, which reads "…mbika Design". The lower half of the phone screen is empty (`v3/product-chip-collision.png`). | Anchor the chips outside the phone frame (left edge −16 px, top 55 %), and fill the screen with 4 rows or a hero card. |
| **V3-3** | P2 | **Circuit traces run behind the navigation.** On every circuit hero, traces and ring nodes pass behind "Insights", the search icon and "Let's talk" (`v3/hero-light.png`, `v3/labs-traces-under-nav.png`). This makes the busiest part of the screen look cluttered. | Mask the canvas under the header (`mask-image: linear-gradient(to bottom, transparent 0 88px, #000 140px)`), or keep nodes out of the top 120 px. |
| **V3-4** | P3 | **The same hero art on every page.** Home, Labs, About and other heroes share the same circuit field, so the signature loses impact on the second page. | Vary the composition per section: a sparser layout for Academy, a denser one for Labs, or a different seed and accent colour per pillar. |
| **V3-5** | P3 | **A third button style.** The Work page's "Request a reference call" is a near-black button on orange. Elsewhere there are only orange-filled and outline buttons. | Use the outline style in white on the orange panel, or make the panel navy with an orange button. |
| **V3-6** | P3 | **"Built in Kigali" lost its explanations.** The four points are now titles only on desktop as well ("Privacy by design", "Kigali Innovation City"), so a buyer can't tell what they mean. | Show titles only on mobile and keep the one-line descriptions on ≥ 768 px. |
| **V3-7** | P3 | **The bento stopped at the home page.** Academy "What you can learn" and Services "Engagement models" are still uniform card grids. | Apply the same bento pattern there. |

### 3.3 Motion

| # | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| **M3-1** | P2 | **Two navigation models.** Header and footer links use client-side navigation and get **no** transition. In-page cards and CTAs do a **full reload** and do get the cross-document View Transition. So the same site hard-cuts on some clicks and animates on others, and the full reloads give up client-side speed and state. | Header "Work" → no transition, client-side. Labs card, service card, hero CTA → full reload, transition. Footer "About" → no transition, client-side. | Pick one model. Either make every internal link a Next `<Link>` and run the transition through React's `<ViewTransition>` / `experimental.viewTransition`, or deliberately keep MPA navigation for content links and document that choice. |
| **M3-2** | P2 | **Motion density.** The desktop home page runs **98 animations at once, 58 of them infinite**, with up to 20 looping in view (product stage). On mobile it runs 57. The 2020s benchmark (Apple, Linear, Vercel) is *one* moving thing per viewport. This many loops competes with the copy and costs battery. | `document.getAnimations()` on `/` | Make looping animations play only while in view (`animation-play-state: paused` by default, toggled by IntersectionObserver, or with `animation-timeline: view()`). Limit each section to one ambient loop and run the rest once on enter. |
| **M3-3** | P2 | **Main-thread cost on the home page.** Throttled TBT on `/` is **139–229 ms** (median about 165 ms) against 25–46 ms on every other page and 34 ms in v2. With the story section in view, the idle page performs about **90 style and layout passes per second** (270 in 3 s). Several loops animate paint-bound properties (`fill`, `background`, `offset-distance`, transforms on SVG children), which the compositor cannot take over. | Throttled runs; CDP `LayoutCount` | Profile `/` in Chrome DevTools on a real mid-range Android. Move loops to `transform` and `opacity` on HTML wrappers, swap `fill` and `background` loops for `opacity` cross-fades of two layers, and pause loops that are off-screen (M3-2). |

### 3.4 Other

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| U3-1 | P3 | The mobile cookie bar (145 px) still covers the "Explore our services" button on the first visit. | Make it 1-line text with smaller buttons, about 96 px tall. Or move it above the fold line only after the first scroll. |
| A3-1 | P3 | "Lab 01" (10.56 px) and the "Web platforms · Mobile apps" tags (11.2 px) on the home page are not `aria-hidden` and are below 12 px. | Use at least 12 px, or mark them decorative. |
| I3-1 | ⏳ UB | 4 "Concept" badges on the home page and Labs, plus 1 on most other hero pages. No people. | Unchanged from v2: photo shoot and real screenshots. |
| U3-2 | ⏳ UB | Social proof (logos, testimonials, case studies) is still missing. The Work page now handles this honestly. | Unchanged from v2. |

---

## 4. Animated elements: v3 inventory

| Element | v2 | v3 | Note |
|---|:-:|:-:|---|
| Living circuit field (canvas) | ⚠️ faint | ✅ visible, cheaper | Traces cross the nav (V3-3). Same composition on every page (V3-4). |
| Globe (WebGL) | ⚠️ off-Kigali | ✅ Kigali-centred, swing, drag | A static WebP is shown while it loads. |
| Hero showcase (dashboard, phone, sensor) with parallax | — | ✅ new | Bars grow and the gauge draws in. Tilt on pointer. |
| Scroll story with progress rail | ✅ | ✅ | |
| Service bento micro-animations (`svc-*`) | — | ✅ new | Many infinite loops (M3-2). |
| Product phone loop + orbits | ❌ | ✅ new | The orbits cause R3-1. |
| Cross-page View Transitions | ❌ | ⚠️ partial | M3-1. |
| Cursor spotlight, hover lift, CTA nudge | ✅ | ✅ | |
| Count-up, header glass/hide, theme circular reveal | ✅ | ✅ | |
| Form "connected" success + next step | ✅ | ✅ | |
| 404 bridge game | ✅ | ✅ | |
| Reduced motion | ✅ | ✅ **0 running animations** and no canvases | Best in class. |
| Lite mode / Save-Data | ✅ | ✅ 18 animations (scroll reveals only), no canvases | |

**Verdict:** the motion layer now covers everything a modern tech brand needs, and the accessibility guards are exemplary. The next step is **editing**: fewer simultaneous loops, loops that only play in view, and one consistent navigation model.

---

## 5. Measurements

### 5.1 Core Web Vitals: Pixel 7, Slow 4G (150 ms RTT, 1.6 Mbps), 4× CPU

| Page | FCP | LCP (element) | CLS | TBT | Total | JS | Fonts | Images |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 1.21–1.36 s | **1.21–1.36 s** (H1) | 0 | **139–229 ms** | 389 KB | 171 KB | 105 KB | 0 |
| `/services` | 1.19 s | 1.59 s (IMG) | 0 | 37 ms | 415 KB | 168 KB | 105 KB | 48 KB |
| `/work` | 1.04 s | 1.04 s (H1) | 0 | 24 ms | 356 KB | 165 KB | 105 KB | 0 |
| `/academy` | 1.15 s | 1.91 s (IMG) | 0 | 25 ms | 419 KB | 164 KB | 105 KB | 62 KB |
| `/academy/apply` | 1.02 s | 1.02 s (H1) | 0.012 (mobile) / **0.121 (desktop)** | 46 ms | 377 KB | 177 KB | 105 KB | 0 |
| `/labs` | 1.14 s | 1.67 s (IMG) | 0.018 | 27 ms | 514 KB | 167 KB | 105 KB | 157 KB |
| `/company/about` | 1.22 s | 1.55 s (IMG) | 0 | 26 ms | 412 KB | 175 KB | 105 KB | 46 KB |
| `/contact` | 1.05 s | 1.05 s | 0 | 42 ms | 378 KB | 176 KB | 105 KB | 0 |
| `/products/nyambika-design` | 1.04 s | 1.04 s | 0 | 28 ms | 382 KB | 180 KB | 105 KB | 0 |

v1 → v3 LCP on `/`: **3.27 s → 1.27 s**.

### 5.2 Site-wide checks (90 page loads)

| Check | Result |
|---|---|
| HTTP status | ✅ All 200 (404 page returns 404) |
| One H1 per page | ✅ 30/30 |
| Broken images / missing `alt` | ✅ 0 / 0 |
| axe WCAG 2.2 AA (desktop + mobile; light + dark on 7 key templates) | ✅ 0 serious/critical outside the exempt logo wordmark |
| Horizontal overflow | ❌ `/`, `/fr`, `/products` on mobile (R3-1, intermittent) |
| Max CLS (unthrottled) | ❌ 0.121 on `/academy/apply` desktop (R3-2). Every other page ≤ 0.02 |
| Mobile page height | `/` 9,747 px · `/services` 7,548 · `/academy` 7,359 · `/contact` 4,605 |
| Theme: OS default, stored override, no flash, persistence, `aria-pressed`, clean circular reveal, reduced-motion instant swap | ✅ All pass |
| Flows: skip link, mega-menu, ⌘K search, language switch, contact errors, apply validation, verify, drawer, booking fallback | ✅ All pass |

---

## 6. Benchmark comparison (Apple · Microsoft · Stripe · Linear)

| Habit | v1 | v2 | v3 |
|---|:-:|:-:|:-:|
| One primary-action colour | ❌ | ✅ | ✅ (one stray near-black button, V3-5) |
| Differentiated hero, showing product | ❌ | ❌ | ✅ |
| Mobile LCP < 2.5 s | ❌ | ✅ | ✅ (≤ 1.9 s) |
| No dead ends | ❌ | ⚠️ | ✅ |
| Real people and photography | ❌ | ❌ | ❌ (UB) |
| Social proof | ❌ | ❌ | ⚠️ honest substitute (Work page) |
| Signature motion moment | ⚠️ | ⚠️ | ✅ |
| Motion restraint (one thing moving per view) | ✅ | ✅ | ❌ (M3-2) |
| Consistent page-to-page continuity | ❌ | ❌ | ⚠️ (M3-1) |
| Clear section rhythm | ✅ | ✅ | ⚠️ light theme (V3-1) |
| Zero layout shift, zero overflow | ❌ | ✅ | ❌ (R3-1, R3-2) |
| Accessibility and reduced motion | ✅ | ✅ | ✅ |

---

## 7. Road to 95 %+

| Order | Item | Owner | Effort | Impact |
|---:|---|---|---|---:|
| 1 | **R3-1** Clip the product orbits; make the overflow test sample over time | Eng | 30 min | +0.8 |
| 2 | **R3-2** Render the step header on the server, CLS assertion on forms | Eng | 2 h | +0.6 |
| 3 | **V3-2 / V3-3** Fix the product chip collision; mask the circuit under the header | Eng | 1 h | +0.5 |
| 4 | **M3-2 / M3-3** Play loops only in view, one ambient loop per section, compositor-only properties | Eng | 4 h | +0.6 |
| 5 | **M3-1** One navigation model with transitions | Eng | 3 h | +0.3 |
| 6 | **V3-1** Two navy anchor bands in light theme | Design + Eng | 2 h | +0.4 |
| 7 | **V3-4 – V3-7, U3-1, A3-1** Polish | Eng | 0.5 day | +0.3 |
| 8 | **I3-1 / U3-2** Photography, real screenshots, logos, testimonials | UB | — | +2.0 |

**Engineering items 1–7 give about 94 %. With UB's content (item 8), about 96 %.**
