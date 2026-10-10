# UI/UX Design & Implementation Plan

## Universal Bridge Ltd — Website

| Field | Value |
|---|---|
| Document ID | UB-WEB-UX-001 |
| Version | 1.0 (Draft) |
| Date | 2026-10-08 |
| Companion to | [SRS.md](SRS.md) (requirements) · [README.md](../README.md) (developer handbook) |
| Audience | Product designers, frontend engineers, content team |

This plan explains **how the site should look, move and feel**, and **how to build it**. The SRS says *what* to build; this says *how it should be experienced*. If they conflict on scope, the SRS wins. On visual and interaction detail, this document wins.

---

## Contents

1. [The quality bar](#1-the-quality-bar)
2. [What the brand assets tell us](#2-what-the-brand-assets-tell-us)
3. [Inspiration board](#3-inspiration-board)
4. [Design concept: "The Bridge"](#4-design-concept-the-bridge)
5. [Design tokens](#5-design-tokens)
6. [Materials, depth and light](#6-materials-depth-and-light)
7. [Typography](#7-typography)
8. [Layout and grid](#8-layout-and-grid)
9. [Motion system](#9-motion-system)
10. [Signature interactions](#10-signature-interactions)
11. [Micro-interactions catalogue](#11-micro-interactions-catalogue)
12. [Page-by-page design](#12-page-by-page-design)
13. [Component specifications](#13-component-specifications)
14. [Imagery, illustration and 3D](#14-imagery-illustration-and-3d)
15. [Accessibility in an interactive site](#15-accessibility-in-an-interactive-site)
16. [Performance budget for design](#16-performance-budget-for-design)
17. [Frontend implementation](#17-frontend-implementation)
18. [Design process and handoff](#18-design-process-and-handoff)
19. [Roadmap](#19-roadmap)
20. [UI quality checklist](#20-ui-quality-checklist)
21. [Risks](#21-risks)
22. [Sources](#22-sources)

---

## 1. The quality bar

The goal is a site whose **craft** stands next to apple.com, Google's product pages and microsoft.com — not a copy of them. Those sites win on a few things we can match regardless of company size:

| What the best sites do | What it means for us |
|---|---|
| **One idea per screen.** Huge headline, one image, one action. | Cut copy hard. Every section has one job. |
| **Motion explains, never decorates.** Things move to show how they work. | Each animation must answer "what does this teach the visitor?" |
| **Obsessive consistency.** Same radius, spacing, timing everywhere. | A strict token system (§5) and a motion system (§9). No one-off values. |
| **Instant.** Pages appear immediately, even on slow phones. | Hard performance budgets (§16). Heavy effects are optional extras. |
| **Inclusive.** Keyboard, screen reader and reduced motion all work. | Accessibility is built in from the first component (§15). |
| **Real proof.** Real products, people and numbers. | Real photos and case studies; AI renders labelled as concepts. |

**Design pillars** (use these to settle debates):

1. **Clarity first** — if it looks amazing but is harder to understand, it loses.
2. **Alive, not busy** — the page reacts to you (cursor, scroll, focus), but calmly.
3. **Built in Kigali, made for the world** — confident, global, with a clear African identity.
4. **Fast is a feature** — every effect has a cheap fallback.

---

## 2. What the brand assets tell us

### 2.1 The mark

The UB monogram is the strongest asset. It contains three ideas we can turn into interface patterns:

| Element of the mark | Meaning | Interface pattern |
|---|---|---|
| **Diagonal cut** between U and B | The bridge / connection | Angled image masks, diagonal section edges, the slash in "Ideas / Code / Impact" |
| **Three circuit traces ending in rings** | Technology, connection points | Lines-and-nodes motif: dividers, loaders, hover states, hero animation, progress indicators |
| **Orange wedge** | Spark, energy, the human idea | The single accent: active states, key words, focus moments |

### 2.2 Two moods already exist

The images fall into two clear moods. The site should use **both on purpose**:

| Mood | Seen in | Use on site |
|---|---|---|
| **Daylight** — white, royal blue, orange accents, clean | Business cards, website hero concept, white reception, white tees, certificate | Default light theme. Services, Academy, Careers, forms, legal. Feels trustworthy, clear. |
| **Night** — deep navy, blue glow, orange sparks, circuit art | Illuminated signage, coding/AI/embedded hubs, hackathon, phone poster | Dark theme and "dramatic" sections: hero, Labs, Products, case-study openings, final CTA. Feels innovative, premium. |

A page can move from Daylight to Night as you scroll (e.g. the home page darkens as you enter "Our Labs"). This is our version of Apple switching between white and black sections.

### 2.3 What to keep and what to fix

| Keep | Refine |
|---|---|
| Strong royal blue + orange contrast | Mockups overuse glow. On screen, glow is for **one** focal element per view. |
| Geometric rounded sans type | Some mockups mix fonts; we use one heading family and one body family. |
| Circuit-line motif | Use thin and sparse lines. Dense circuit boards behind text hurt readability. |
| Line icons (Lucide-style) | Use one icon set and one stroke width. |
| Taglines ("Code. Connect. Create Impact.") | Use one main tagline per page; don't stack three. |
| People in branded clothing | Replace AI people and spaces with a real photo shoot (SRS OI-06). |

---

## 3. Inspiration board

What we take from each reference — and what we deliberately don't.

### 3.1 Apple

| Take | Don't take |
|---|---|
| **Scroll storytelling**: a sticky visual changes as you scroll (product rotates, screens change). | Scroll-jacking (taking over the scroll wheel). |
| **Typographic confidence**: giant short headlines, lots of space. | Tiny grey legal-style body text with low contrast. |
| **Section rhythm**: alternating light and dark full-width bands. | Video-heavy pages that cost megabytes on mobile. |
| **Liquid Glass** (2025): translucent controls that let content show through. | Glass on body text or large areas — it reduces contrast. |

Where we use it: home "Ideas → Code → Impact" story, case-study openings, product pages, the floating header.

### 3.2 Google — Material 3 Expressive

| Take | Don't take |
|---|---|
| **Spring physics motion** instead of fixed timing — things feel physical. | Material's look (we have our own brand). |
| **Shape morphing**: buttons/chips change shape on press or selection. | Very bouncy springs everywhere — we keep bounce for small elements. |
| **Bold, emotional colour and type** in key moments. | Too many colours at once. |

Where we use it: button press, chip selection, filter changes, the theme toggle, toast arrival.

### 3.3 Microsoft — Fluent 2

| Take | Don't take |
|---|---|
| **Three-tier tokens**: global → alias (semantic) → component. | Windows-specific patterns. |
| **Acrylic material** (blur + subtle noise) for temporary surfaces: menus, popovers, command palette. | Acrylic on permanent surfaces. |
| **Fast, purposeful motion**: most UI transitions 150–250 ms. | — |
| **Light and depth** as hierarchy (elevation tells you what's on top). | — |

Where we use it: token architecture (§5), mega-menu, command palette, tooltips, timing scale.

### 3.4 Stripe

| Take | Don't take |
|---|---|
| Explaining complex services quickly with **small animated diagrams**. | The specific gradient-mesh look. |
| Very high polish on small details (link underlines, code blocks). | — |

Where we use it: "How we work" process, service pages ("what we deliver" diagrams).

### 3.5 Linear and Vercel

| Take | Don't take |
|---|---|
| **Dark, precise, minimal** UI with crisp 1 px borders and subtle gradients. | Developer-only tone — our audience is wider. |
| **Bento grids** to show many capabilities at once. | Grids so dense nothing stands out. |
| **Cursor spotlight** on cards (soft light follows the pointer). | — |
| **Command palette** (⌘K) for fast navigation. | — |

Where we use it: Labs section, services overview, capability bento on home, ⌘K search.

### 3.6 Summary: our blend

```
Apple       → storytelling, rhythm, restraint
Google M3E  → springy, physical motion and shape change
Fluent 2    → token system, acrylic surfaces, timing discipline
Stripe      → explaining with small animated diagrams
Linear/Vercel → dark precision, bento, spotlight, ⌘K
UB brand    → bridge diagonal, circuit nodes, orange spark, Daylight/Night
```

---

## 4. Design concept: "The Bridge"

**One-line concept:** *Every interaction connects two points.*

The site is built around the idea in the logo: a line travels from one node to another and lights it up. That single idea drives:

- **Navigation** — hovering a menu item draws a thin trace to its preview.
- **Scrolling** — a progress trace runs down the page, lighting a node at each section.
- **Feedback** — submitting a form sends a pulse along a line to a "connected" node.
- **Storytelling** — "Ideas → Code → Impact" is literally three nodes joined by a line.
- **Loading** — the loader is the three circuit traces of the B drawing in.

### 4.1 Brand moments (the five things people remember)

| # | Moment | Where |
|---|---|---|
| 1 | **The Monogram assembles** — U and B slide together, the cut forms, orange wedge drops in, traces light up (≤ 1.2 s, once per session) | First visit, hero |
| 2 | **Living circuit hero** — faint traces react to the cursor; nearby nodes glow | Home hero |
| 3 | **Ideas → Code → Impact** — pinned scroll story in three steps | Home |
| 4 | **Kigali → World** — interactive globe/map with arcs from Kigali to client countries | Home "Global reach", About |
| 5 | **Shared-element transitions** — a case-study card expands into the case-study page | Work → Case study |

---

## 5. Design tokens

Three tiers, following Fluent 2's model. **Components only use alias or component tokens, never raw values.**

```
Global (raw values)     →   Alias (meaning)          →   Component
--ub-blue-600: #0B47C1      --color-accent-primary       --button-primary-bg
--ub-orange-500: #FF7A00    --color-accent-spark         --link-underline
--space-4: 16px             --gap-stack-md               --card-padding
```

### 5.1 Colour ramps (global)

> Estimated from artwork; confirm with master files (SRS OI-07). Ramps are generated in OKLCH so steps look even.

| Step | Blue | Navy | Orange | Neutral |
|---|---|---|---|---|
| 50 | `#EEF3FF` | `#E8ECF5` | `#FFF4EA` | `#F7F8FA` |
| 100 | `#D9E4FF` | `#C9D1E3` | `#FFE3C7` | `#EEF0F4` |
| 200 | `#B3C8FF` | `#93A2C4` | `#FFC48F` | `#DDE1E8` |
| 300 | `#7FA3FA` | `#5E709B` | `#FFA257` | `#C2C8D2` |
| 400 | `#4A7BEB` | `#344675` | `#FF8A26` | `#9AA2B1` |
| 500 | `#1F5BD8` | `#1C2C57` | **`#FF7A00`** | `#6E7787` |
| 600 | **`#0B47C1`** | `#142246` | `#E56A00` | `#4F5767` |
| 700 | `#0036A3` | `#0F1B3A` | `#BF5500` | `#363D4B` |
| 800 | `#062B82` | `#0C1630` | `#994300` | `#232937` |
| 900 | `#041F5E` | **`#0A1633`** | `#733200` | `#151A24` |
| 950 | `#02133B` | `#060D20` | `#4D2100` | `#0B0E15` |

### 5.2 Alias colour tokens

| Alias | Light (Daylight) | Dark (Night) |
|---|---|---|
| `--bg-canvas` | neutral-50 | navy-950 |
| `--bg-surface` | white | navy-900 |
| `--bg-surface-raised` | white + shadow-2 | navy-800 |
| `--bg-inverse` | navy-900 | white |
| `--text-primary` | navy-900 | neutral-50 |
| `--text-secondary` | neutral-600 | neutral-300 |
| `--text-muted` | neutral-500 | neutral-400 |
| `--border-subtle` | neutral-200 | white @ 8 % |
| `--border-strong` | neutral-300 | white @ 16 % |
| `--accent-primary` | blue-600 | blue-400 |
| `--accent-primary-hover` | blue-700 | blue-300 |
| `--accent-spark` | orange-600 (text) / orange-500 (fills) | orange-500 |
| `--focus-ring` | blue-600 | orange-400 |
| `--glow` | — (none in light) | blue-500 @ 35 % |
| `--success` / `--warning` / `--danger` | green-600 / amber-600 / red-600 | 400 steps |

Contrast rules: every text/background pair is checked automatically in CI (≥ 4.5:1 body, ≥ 3:1 large text and UI). Orange-500 on white fails for small text — small orange text uses orange-600 or darker.

### 5.3 Spacing (4 px base)

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160`

Section padding: mobile 64–80 px, desktop 120–160 px vertically.

### 5.4 Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 6 px | Tags, small inputs |
| `--radius-sm` | 10 px | Inputs, small buttons |
| `--radius-md` | 14 px | Buttons, menu items |
| `--radius-lg` | 20 px | Cards |
| `--radius-xl` | 28 px | Bento tiles, modals, hero media |
| `--radius-full` | 9999 px | Pills, avatars, chips |

Nested radius rule: inner radius = outer radius − padding (keeps corners concentric, like Apple's hardware-matched corners).

### 5.5 Elevation

| Level | Light | Dark |
|---|---|---|
| 0 | none | none |
| 1 | `0 1px 2px rgb(10 22 51 / .06)` | 1 px border `--border-subtle` |
| 2 | `0 4px 12px rgb(10 22 51 / .08)` | border + `0 0 0 1px` inner highlight |
| 3 | `0 12px 32px rgb(10 22 51 / .12)` | border + soft glow |
| 4 (overlays) | `0 24px 64px rgb(10 22 51 / .18)` | acrylic + border |

In dark mode depth comes from **lighter surfaces and borders**, not shadows (shadows disappear on navy).

---

## 6. Materials, depth and light

| Material | Look | Used for | Fallback |
|---|---|---|---|
| **Solid** | Opaque surface | Most cards, content | — |
| **Glass** (Apple-inspired) | `backdrop-filter: blur(20px) saturate(160%)`, 60–72 % surface colour, 1 px light edge | Floating header, floating CTA pill, video controls | Solid surface at 95 % |
| **Acrylic** (Fluent-inspired) | Glass + 2–3 % noise texture | Mega-menu, command palette, popovers, tooltips | Solid raised surface |
| **Glow** | Radial blue light behind a focal element | One focal element per Night section | None |
| **Spotlight** | Soft radial light following the pointer inside a card | Bento tiles, service cards (desktop) | Static border highlight on hover |

Rules:

- Never put glass or acrylic **behind paragraph text** that must be read.
- At most **one glow** visible per viewport.
- Disable glass when `prefers-reduced-transparency: reduce` or on low-end devices.

---

## 7. Typography

| Role | Family | Notes |
|---|---|---|
| Display & headings | **Plus Jakarta Sans** (variable) | Matches the rounded geometric logotype |
| Body & UI | **Inter** (variable) | Excellent at small sizes; tabular numbers for stats |
| Code & eyebrows | **JetBrains Mono** | Eyebrows like `IDEAS → CODE → IMPACT`, code blocks |

### 7.1 Fluid type scale

| Token | Mobile → Desktop | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-2xl` | 44 → 96 px | 800 | −0.04 em | Home hero only |
| `display-xl` | 40 → 72 px | 800 | −0.035 em | Page heroes |
| `display-lg` | 34 → 56 px | 700 | −0.03 em | Section titles |
| `heading-lg` | 26 → 36 px | 700 | −0.02 em | Sub-sections |
| `heading-md` | 20 → 24 px | 600 | −0.01 em | Card titles |
| `body-lg` | 18 → 20 px | 400 | 0 | Lead paragraphs |
| `body-md` | 16 → 17 px | 400 | 0 | Body |
| `body-sm` | 14 px | 400/500 | 0 | Captions, meta |
| `eyebrow` | 12 → 13 px | 500 mono | +0.2 em, uppercase | Section labels |

Implemented with `clamp()`. Line length 60–75 characters. Line height: 1.05 for display, 1.5–1.6 for body. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.

**Accent words:** one or two words per headline in `--accent-spark` (e.g. "Better **Tomorrow**"). Optional animated gradient sweep on hover for the hero only.

---

## 8. Layout and grid

| Breakpoint | Width | Columns | Gutter | Side margin |
|---|---|---|---|---|
| `xs` | 0–479 | 4 | 16 px | 16 px |
| `sm` | 480–767 | 4 | 16 px | 24 px |
| `md` | 768–1023 | 8 | 24 px | 32 px |
| `lg` | 1024–1279 | 12 | 24 px | 48 px |
| `xl` | 1280–1535 | 12 | 32 px | 64 px |
| `2xl` | ≥ 1536 | 12 | 32 px | auto (max content 1360 px) |

- Content max width: **1360 px**; reading width: **720 px**.
- Use **container queries** for components (a card adapts to its container, not the screen).
- **Bento grid:** 12-column grid with tiles spanning 3, 4, 6 or 8 columns and 1–2 rows; collapses to a single column on mobile with tile order set by priority.

---

## 9. Motion system

Motion follows three rules: **purposeful** (it explains), **physical** (springs, like Material 3 Expressive), **fast** (Fluent's 150–250 ms for UI).

### 9.1 Motion tokens

**Duration** (for CSS transitions and simple effects):

| Token | Value | Use |
|---|---|---|
| `--dur-instant` | 80 ms | Press feedback, colour change |
| `--dur-fast` | 150 ms | Hover, small toggles |
| `--dur-base` | 220 ms | Menus, tooltips, tabs |
| `--dur-slow` | 360 ms | Modals, drawers, section reveals |
| `--dur-story` | 600–900 ms | Hero entrance, brand moments only |

**Easing:**

| Token | Curve | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Most UI |
| `--ease-enter` | `cubic-bezier(0, 0, 0, 1)` | Elements appearing |
| `--ease-exit` | `cubic-bezier(.3, 0, 1, 1)` | Elements leaving (faster) |
| `--ease-emphasized` | `cubic-bezier(.2, 0, 0, 1.2)` | Brand moments |

**Springs** (Motion library, for anything that moves position, size or shape):

| Token | Config | Feel | Use |
|---|---|---|---|
| `spring.spatialFast` | `{ stiffness: 600, damping: 38 }` | Snappy, no bounce | Tabs indicator, toggles |
| `spring.spatial` | `{ stiffness: 380, damping: 32 }` | Smooth | Cards, layout changes, drawers |
| `spring.spatialSlow` | `{ stiffness: 200, damping: 28 }` | Weighty | Hero media, shared elements |
| `spring.playful` | `{ stiffness: 500, damping: 18 }` | Small bounce | Chips, badges, success check, magnetic buttons |
| `spring.effects` | `{ stiffness: 300, damping: 40 }` | No overshoot | Opacity/colour driven by springs |

Bounce is only allowed on **small** elements (< 120 px). Large surfaces never overshoot.

### 9.2 Choreography rules

1. **Enter slower than exit** (exit ≈ 70 % of enter time).
2. **Stagger** lists by 40–60 ms, max 6 items (the rest appear together).
3. **Move short distances**: reveals travel 12–24 px, not 100 px.
4. **One hero motion per view.** Supporting elements just fade.
5. **Direction has meaning**: forward navigation moves left/up, back moves right/down.
6. **Only animate `transform` and `opacity`** (plus `filter` sparingly). Never animate layout properties directly.
7. **Never block input.** Users can click during any animation.

### 9.3 Scroll-driven motion

- Use **native CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`) for reveals, progress bars and parallax. They run off the main thread and are supported across major browsers in 2026. Wrap in `@supports`.
- Use **GSAP ScrollTrigger** only for complex pinned stories (home "Ideas → Code → Impact", case-study openers).
- **No scroll-jacking.** Native scrolling speed is never changed. Optional smooth scrolling (Lenis) is **off by default** and never used on touch devices.

### 9.4 Page transitions

- Enable **View Transitions** for route changes (Next.js `viewTransition` flag + React `<ViewTransition>`). Still experimental in Next.js — ship behind a feature flag with a plain-navigation fallback.
- Default: 220 ms cross-fade of the main area; header and footer stay still.
- Shared elements: case-study card image → case-study hero; program card → program hero; team photo → bio.
- If the browser doesn't support View Transitions, navigation simply happens instantly.

### 9.5 Reduced motion

When `prefers-reduced-motion: reduce`:

- Springs become instant or 120 ms fades.
- No parallax, marquees, auto-playing video, or cursor-reactive effects.
- Pinned scroll stories become normal stacked sections.
- Counters show final numbers immediately.
- The monogram intro shows the finished logo.

---

## 10. Signature interactions

Each one has: **purpose**, **behaviour**, **mobile version**, **reduced-motion version**, **build approach**.

### 10.1 Monogram intro

- **Purpose:** brand recognition on first visit.
- **Behaviour:** U and B slide together (spring.spatialSlow), the diagonal cut appears, orange wedge drops in with spring.playful, three traces draw from left to right and the ring nodes pulse once. Total ≤ 1.2 s. Plays once per session, never blocks the page (content renders underneath).
- **Mobile:** same, 0.8 s.
- **Reduced motion:** static logo.
- **Build:** inline SVG + Motion (`pathLength` for traces). Or a Rive file (< 40 KB) if design wants more nuance.

### 10.2 Living circuit hero

- **Purpose:** show "technology that connects" without a stock photo.
- **Behaviour:** a field of thin traces and nodes behind the hero (opacity 0.15–0.3). Nodes within ~160 px of the cursor brighten and a pulse travels along their trace. Scrolling slowly fades the field.
- **Mobile:** gentle ambient pulse along 2–3 traces; no pointer tracking.
- **Reduced motion:** static traces.
- **Build:** `<canvas>` 2D (not WebGL) with ≤ 120 nodes, `requestAnimationFrame` paused when off-screen (IntersectionObserver) or tab hidden. Lazy-loaded after first paint; the hero renders fully without it.

### 10.3 "Ideas → Code → Impact" pinned story

- **Purpose:** explain how UB works in 10 seconds.
- **Behaviour:** section pins for ~250 vh of scroll. Left: three steps; the active step is bold, others fade. Right: a sticky device frame whose content changes:
  1. **Ideas** — sticky notes and a whiteboard sketch assemble into a wireframe.
  2. **Code** — the wireframe becomes a code editor with lines typing in (syntax-highlighted).
  3. **Impact** — the app appears live on a phone, with a metric counting up ("+38 % faster processing").
  A trace along the left side fills as you scroll, lighting the node of each step.
- **Mobile:** no pinning; three stacked cards, each with a short looping animation when in view.
- **Reduced motion:** three static images with captions.
- **Build:** GSAP ScrollTrigger (pin + scrub) inside a client component; illustrations as SVG/Lottie or lightweight HTML mockups.

### 10.4 Capability bento with spotlight

- **Purpose:** show breadth (software, AI, cloud, IoT, design, consulting) at a glance.
- **Behaviour:** 6–8 tiles of different sizes. Pointer creates a soft spotlight inside the hovered tile and a faint glow on neighbouring borders. Each tile has a tiny live demo: AI tile shows a chat bubble typing; IoT tile shows a sensor graph; Cloud tile shows nodes connecting; Design tile shows a component morphing.
- **Mobile:** single column; demos play once when scrolled into view.
- **Build:** CSS custom properties `--x/--y` updated on `pointermove` (throttled with rAF); demos are small CSS/SVG animations, no video.

### 10.5 Kigali → World

- **Purpose:** international credibility and time-zone story.
- **Behaviour:** dotted globe (or flat dotted map on mobile). Arcs fly from Kigali to client countries. Hovering a country shows a card: client count, sample project, time-zone overlap ("Berlin: +0 h · New York: −6 h"). Live clock shows Kigali time.
- **Mobile:** flat dotted map image with static arcs; tappable list of regions.
- **Reduced motion:** static map.
- **Build:** `react-three-fiber` + `three-globe`-style dotted sphere, **lazy-loaded only on capable desktop devices** (see §14.3). Fallback: pre-rendered SVG map.

### 10.6 Case study card → page (shared element)

- **Purpose:** make browsing work feel seamless and premium.
- **Behaviour:** clicking a card morphs its image into the full-width hero of the case study; title slides into place; the rest fades in.
- **Build:** View Transitions with `view-transition-name` per case-study slug; fallback is normal navigation.

### 10.7 Scroll progress trace

- **Purpose:** orientation on long pages (case studies, posts, program pages).
- **Behaviour:** a 2 px trace at the left (desktop) or top (mobile) fills with scroll; a node lights at each H2. Clicking a node jumps to that section.
- **Build:** CSS `animation-timeline: scroll()`; nodes positioned from heading offsets.

### 10.8 Command palette (⌘K / Ctrl K)

- **Purpose:** power-user navigation, signals a modern product company.
- **Behaviour:** acrylic modal; search across pages, services, case studies, programs, jobs, posts; quick actions ("Book a call", "Copy email", "Switch to dark theme", "Change language").
- **Build:** `cmdk` + static search index (Pagefind) loaded on first open.

### 10.9 "Connected" form success

- **Purpose:** turn a dull confirmation into a brand moment.
- **Behaviour:** on submit, the button shrinks into a node; a pulse travels along a trace to a second node with the UB monogram; a check mark draws in; message: "You're connected. We'll reply within 1 business day."
- **Reduced motion:** check mark and message only.

---

## 11. Micro-interactions catalogue

| Element | Interaction | Timing |
|---|---|---|
| Primary button | Hover: lift 1 px, background brightens, arrow icon slides 4 px right. Press: scale 0.97 + shape tightens radius by 2 px (M3E shape change). | fast / spring.playful |
| Primary CTA (hero, final band) | **Magnetic**: moves up to 6 px toward the cursor within 60 px range. | spring.playful |
| Text link | Underline draws from left on hover; retracts to right on leave. | base |
| Card | Hover: lift 4 px, border brightens, image zooms 1.03 inside its mask. | spring.spatial |
| Nav item | Hover: background pill slides between items (shared layout). | spring.spatialFast |
| Mega-menu | Opens with 8 px drop + fade; hovering an item shows a preview panel on the right with a trace connecting them. | base |
| Header | Transparent over hero → glass after 24 px scroll; hides on fast scroll down, returns on scroll up. | base |
| Theme toggle | Sun morphs into moon (SVG morph); page switches theme with a circular View Transition reveal from the toggle. | slow |
| Language switch | Text swaps with a vertical slide; page content cross-fades. | base |
| Stats | Count up when 50 % visible, tabular numbers, ends with a tiny orange spark on the "+". | 1.2 s once |
| Logo marquee | Constant slow scroll; pauses on hover/focus; logos go from grey to colour on hover. | — |
| Tabs | Indicator slides with spring; content cross-fades with 8 px shift in tab direction. | spring.spatialFast |
| Accordion (FAQ) | Height animates (Motion layout), chevron rotates, content fades in after 60 ms. | spring.spatial |
| Filter chips (Work, Programs) | Selected chip morphs into a pill with check icon; grid re-flows with layout animation (cards slide to new positions). | spring.playful / spring.spatial |
| Inputs | Label floats on focus; focus ring draws in; validation icon pops (spring.playful); error text slides down. | fast |
| File upload | Drag-over: dashed border animates (marching ants); upload: progress trace fills; done: node lights. | — |
| Multi-step form | Step indicator is a trace with nodes; completed nodes fill orange. | spring.spatial |
| Copy email/phone | Click copies; icon swaps to check; toast "Copied". | fast |
| Toast | Slides up from bottom with spring, auto-dismiss 4 s with a draining progress trace; pauses on hover. | spring.spatial |
| Back to top | Appears after 2 screens; its ring shows scroll progress. | — |
| Image loading | Blurred placeholder (blurDataURL) → sharp, 300 ms fade. | — |
| 404 | A broken bridge: two nodes with a gap; dragging the missing piece reconnects them and takes you home. | — |

---

## 12. Page-by-page design

Each page notes its **mood** (Daylight / Night / mixed), **sections**, and **key interaction**.

### 12.1 Home — mixed (Night → Daylight → Night → Daylight → Night)

| # | Section | Mood | Design & interaction |
|---|---|---|---|
| 1 | **Hero** | Night | Eyebrow `IDEAS → CODE → IMPACT` (mono). Headline `display-2xl`: "Building digital solutions for a better **tomorrow**." Lead text. Magnetic primary CTA "Start a project", ghost "See our work". Right: real team photo in a diagonal mask; living circuit field behind. Floating glass chip: "Built in Kigali · Delivering worldwide". Monogram intro on first visit. |
| 2 | **Trust marquee** | Night → fades to Daylight | Client logos, grey → colour on hover. |
| 3 | **Capability bento** | Daylight | 8 tiles with spotlight and mini demos (§10.4). |
| 4 | **Ideas → Code → Impact** | Daylight | Pinned story (§10.3). |
| 5 | **Featured work** | Daylight | Horizontal scroll-snap carousel of 3–5 large case-study cards (drag, arrows, keyboard). Each card: image, client, industry chip, big result number. Shared-element transition into case study. |
| 6 | **Stats band** | Daylight | 4 large counters with fine dividers. |
| 7 | **Our Labs** | **Night** (page darkens as you scroll in — background interpolates via scroll timeline) | Three hub cards (Coding, AI Innovations, Embedded Systems) with real lab photos, glow behind the active one, a short looping clip on hover (muted, < 600 KB, desktop only). |
| 8 | **Products** | Night | Nyambika Design featured: device mockup tilting slightly with pointer; other confirmed products as smaller cards with status badges. |
| 9 | **Kigali → World** | Night | Globe (§10.5). |
| 10 | **Testimonials** | Daylight | One big quote at a time, client photo/logo, auto-advance off by default, swipe on mobile. Hidden if none approved. |
| 11 | **Academy teaser** | Daylight (warmer: more orange) | Students photo, "Learn. Innovate. Lead.", next intake countdown chip, Apply CTA. |
| 12 | **Insights** | Daylight | 3 post cards. |
| 13 | **Final CTA** | Night (blue) | Huge headline "Let's build what's next." Two CTAs. Faint monogram watermark with traces drawing in on view. |

### 12.2 Services overview — Daylight

- Hero with headline and a pillar switcher (**Engineering · Technology · Innovation · Consulting**) as a segmented control with sliding indicator.
- Selecting a pillar filters the service grid with layout animation.
- Each service card: icon in a soft blue tile, title, one line, "Explore →".
- "Engagement models" as 4 comparison cards; hovering one highlights its row in a small comparison table below.

### 12.3 Service detail — Daylight with Night opener

1. Night hero: title, outcome statement, CTA, abstract animated diagram of the service (e.g. Cloud: nodes connecting to a cloud shape).
2. "What we deliver" — checklist with icons, revealed in stagger.
3. "How it works" — horizontal process stepper (trace + nodes); each step expands on click.
4. Tech stack — logo grid with tooltip names; filter by category.
5. Related case studies — 2–3 cards.
6. FAQ accordion.
7. CTA band.

### 12.4 Work (case studies) listing — Daylight

- Large filter bar (industry, service, technology, region) as chips; result count animates.
- Masonry-like grid with mixed card sizes; layout animation on filter.
- Empty state: illustration of two unconnected nodes + "Clear filters".

### 12.5 Case study detail — Night opener → Daylight body

1. Full-bleed hero (shared element from card) with client, industry, year.
2. **Results first**: 3 big metrics in a strip.
3. Challenge / Solution in two columns with a sticky table of contents and progress trace.
4. Product screenshots in device frames; optional scroll-scrubbed sequence for one flagship case.
5. Tech stack chips; team avatars.
6. Testimonial quote.
7. Next case study: large preview; hovering previews its image.

### 12.6 Products — Night

- Apple-style product grid: one hero product per band, big device render, short claim, two CTAs.
- Product page: sticky device with feature list on the side; scrolling through features changes the screen in the device (scrollytelling, mobile = stacked).

### 12.7 Labs (hub pages) — Night

- Video/photo hero of the real lab.
- "Capabilities" bento (equipment, focus areas).
- Projects gallery with hover video previews.
- Embedded Systems hub: an interactive "exploded" diagram of a sensor device; hovering parts shows labels.
- Collaboration CTA (universities, partners).

### 12.8 Academy — Daylight (warmer, more energetic)

Personality shift: slightly larger radius, more orange, more photography of students, friendlier copy. Same system, different dial.

- Hero: students photo, "Learn. Innovate. Lead.", next intake countdown, "Find your program".
- **Program finder**: 3-question quiz chips (Interest → Level → Mode) that filters programs live.
- Learning areas as icon cards.
- Alumni stories carousel with outcome tags ("Now: Junior Developer at …").
- Certificate verification teaser with QR icon.

### 12.9 Program detail — Daylight

- Sticky side panel (desktop) / bottom bar (mobile): fee, dates, mode, seats left, Apply.
- Curriculum as a timeline (week by week), expandable modules.
- Instructors with photos.
- FAQ.

### 12.10 Apply (multi-step form) — Daylight

- 3–4 steps: **You → Background → Program → Review**. Progress trace with nodes.
- One question group per screen on mobile.
- Autosave to `localStorage` (draft only, no sensitive files), "Saved" indicator.
- Review step shows a summary card with edit links.
- Success: "Connected" animation (§10.9) + what happens next (timeline of 3 steps).

### 12.11 Certificate verification — Daylight

- Large single input with format hint `UB-2026-XXXXXXXXXX` and a "Scan QR" button (camera, mobile).
- While verifying: the trace pulses between "certificate" and "UB" nodes.
- **Valid**: card styled like the real certificate (seal, signatory) with a green "Verified" seal stamping in; share/print buttons.
- **Revoked / not found**: clear, calm message; no alarming red full-screen.

### 12.12 About — mixed

- Hero headline about the mission.
- Story timeline from 2019 → today: horizontal scroll on desktop (drag/keyboard), vertical on mobile; each milestone node lights as it enters.
- Values as large typographic cards.
- "Why Rwanda" band (Night) with Kigali skyline photo and facts.
- Leadership preview → link.

### 12.13 Leadership — Daylight

- Large portrait grid; hover reveals role and a LinkedIn icon; click opens a side sheet with bio (shared element photo).

### 12.14 Careers & job detail — Daylight

- Culture photo mosaic, benefits icons, hiring process stepper.
- Jobs list with department filter and a live count; each row expands inline for a summary before opening the page.
- Job page: sticky Apply button, same multi-step form pattern.

### 12.15 Partners & agents — Daylight

- Partner logos; agent programme tiers as three comparison cards with the middle one emphasised; earnings explained with a small calculator slider ("If you refer a project worth X → you earn Y").

### 12.16 Events & hackathons — Night

- Upcoming event hero with countdown; past events gallery with lightbox; hackathon winners cards.

### 12.17 Insights (blog) — Daylight

- Featured post large; category tabs; clean reading layout (720 px), progress trace, table of contents, code blocks with copy button, estimated reading time.

### 12.18 Contact — Daylight

- Split layout: left — "Let's talk" headline, contact options as cards (Email, WhatsApp, Phone, Visit), each with copy/action; office card with static map image, Kigali local time and "Open now / Closed" status.
- Right — inquiry form with service chips and a budget slider; department selector changes the form fields.
- Book a call: embedded calendar in a sheet.

### 12.19 404 / 500

- 404: broken-bridge mini interaction (§11).
- 500: calm message, retry button, status page link.

---

## 13. Component specifications

Every component ships with: **all states** (default, hover, focus-visible, active, disabled, loading, error), **light + dark**, **sizes**, **RTL-safe** layout (logical CSS properties), Storybook stories and an axe check.

| Component | Variants | Key details |
|---|---|---|
| Button | primary, secondary, ghost, link, destructive; sm/md/lg; icon-only | Min height 44 px (md); loading shows a trace spinner; arrow icon slides on hover |
| Header | transparent, glass, solid | Glass after scroll; hides on scroll down; mobile: full-screen sheet menu with staggered links |
| Mega-menu | services, solutions, academy | Acrylic; 2 columns + preview panel; full keyboard support (arrows, Esc) |
| Card | service, case study, product, program, job, post, person, hub | One clickable area (whole card) with an inner link for screen readers |
| Bento tile | 1×1, 2×1, 1×2, 2×2 | Spotlight; mini demo slot; container-query responsive |
| Section header | default, centred, with action | Eyebrow (mono) + title + lead |
| Stat | default, inline | Tabular nums, count-up |
| Chip / Filter | default, selected, removable | Shape morph on select |
| Segmented control | 2–5 options | Sliding indicator |
| Tabs | line, pill | Sliding indicator |
| Accordion | single, multiple | Animated height |
| Stepper / Trace progress | horizontal, vertical | Nodes + filling trace |
| Carousel | cards, testimonials | Scroll-snap based (native), arrows, dots, keyboard, swipe |
| Marquee | logos | Pauses on hover/focus; duplicated list `aria-hidden` |
| Form controls | text, textarea, select, combobox, phone, file, checkbox, radio, switch, slider, date | Floating label; inline validation; error summary |
| Modal / Sheet | centre, side, bottom (mobile) | Focus trap; Esc; scroll lock; spring entrance |
| Toast | info, success, error | Draining progress trace; pause on hover |
| Command palette | — | Acrylic; groups; recent items |
| Device frame | phone, laptop, browser | For screenshots and scroll stories |
| Globe / Map | 3D, SVG | Lazy; fallback image |
| Code block | — | Syntax highlight (Shiki at build time), copy button |
| Video | inline loop, player | Muted autoplay loops only on desktop and not under reduced motion; poster image |

---

## 14. Imagery, illustration and 3D

### 14.1 Photography

- **Commission a real shoot** (SRS OI-06): team at work, labs, academy classes, hackathon, Kigali skyline, portraits on a consistent blue-grey backdrop.
- Style: natural light, shallow depth of field, people mid-action (not posing at camera), brand colours present but not forced.
- Treatment: slight cool grade for Night sections, neutral for Daylight; diagonal masks echo the logo cut.
- Every photo exported as AVIF + WebP at 640/960/1280/1920 widths.

### 14.2 Illustration & icons

- **Lucide** icons, 1.5 px stroke, 20/24 px.
- Custom **circuit-line illustrations** (SVG) for empty states, 404, process diagrams — same stroke weight, nodes as rings.
- Device mockups built in HTML/CSS where possible (sharp at any size, light to load).

### 14.3 3D & WebGL (progressive enhancement only)

- Used only for the globe and optionally the hero monogram in 3D (extruded UB with glass material) on the Labs page.
- Load only if all are true: desktop width ≥ 1024 px, no reduced motion, `navigator.hardwareConcurrency ≥ 4`, WebGL2 available, not on Save-Data.
- Lazy-load with `next/dynamic({ ssr: false })` when the section is near the viewport.
- Budget: ≤ 250 KB JS gzip for the 3D chunk, ≤ 60 fps target with frame-time monitoring; pause rendering when off-screen.
- Always have a static image fallback that looks finished on its own.

### 14.4 AI-generated renders

The supplied renders (HQ building, fleet, academy campus, phone) can appear **only** in clearly labelled "Our vision" contexts — never as current facilities or shipping products.

---

## 15. Accessibility in an interactive site

| Area | Rule |
|---|---|
| Standard | WCAG 2.2 AA |
| Keyboard | Every interactive effect has a keyboard equivalent (carousels: arrows; bento: Tab; globe: list of regions; 404 game: "Take me home" button) |
| Focus | Visible ring (`--focus-ring`, 2 px + 2 px offset) on every focusable element; never removed |
| Motion | Full reduced-motion mode (§9.5); no flashing > 3 times/second; pause controls for anything moving > 5 s |
| Transparency | Respect `prefers-reduced-transparency` (solid surfaces) and `prefers-contrast: more` (stronger borders, no glass) |
| Cursor effects | Purely decorative; nothing important is only visible on hover |
| Pinned stories | Content is real HTML text in order, readable by screen readers without scrolling effects |
| Canvas/WebGL | `aria-hidden` with an equivalent text list next to it |
| Colour | Status never shown by colour alone (icon + text) |
| Forms | Labels, hints, errors linked with `aria-describedby`; error summary focuses on submit |
| Language | `lang` attribute per locale; Kinyarwanda and French screens tested with real users |
| Targets | ≥ 44 × 44 px touch targets |

---

## 16. Performance budget for design

| Metric | Budget |
|---|---|
| LCP (mobile, p75) | ≤ 2.0 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| First-load JS (marketing page) | ≤ 120 KB gzip |
| Motion library on initial load | Motion `LazyMotion` + `domAnimation` features (~15 KB) |
| GSAP | Only on pages with pinned stories, loaded when the section approaches |
| 3D chunk | ≤ 250 KB gzip, desktop only, lazy |
| Hero image | ≤ 120 KB mobile, ≤ 220 KB desktop (AVIF) |
| Fonts | ≤ 2 variable families preloaded (heading + body); mono loaded on demand |
| Video | No autoplay on mobile; desktop loops ≤ 600 KB, with poster |
| Animation cost | 60 fps on a mid-range Android (e.g. Samsung A-series); test with 4× CPU throttle |

Rules: the **hero must be complete without JavaScript** (text, CTA, image); effects are layered on after hydration. Every heavy effect is behind `IntersectionObserver` and paused when off-screen.

---

## 17. Frontend implementation

### 17.1 Libraries

| Need | Library | Why |
|---|---|---|
| Component motion, layout & shared animations, gestures | **Motion** (`motion/react`) | Springs, layout animations, `AnimatePresence`, small with `LazyMotion` |
| Scroll reveals, progress, parallax | **Native CSS scroll-driven animations** | Off main thread, zero JS |
| Complex pinned scroll stories | **GSAP + ScrollTrigger** | Most reliable pin/scrub; loaded per page |
| Page & shared-element transitions | **View Transitions** (Next.js `viewTransition` flag + React `ViewTransition`) | Native, behind a feature flag |
| Accessible primitives | **Radix UI** via shadcn/ui | Keyboard and ARIA handled |
| Command palette | **cmdk** + **Pagefind** | Fast, accessible |
| 3D globe / logo | **react-three-fiber** + **drei** | Lazy, desktop-only |
| Vector animations | **Rive** (monogram, illustrations) or Lottie | Small files, interactive states |
| Carousels | Native CSS scroll-snap + small hook | No heavy carousel library |
| Syntax highlighting | **Shiki** (build time) | Zero runtime cost |
| Theme | `next-themes` | No flash of wrong theme |
| Icons | `lucide-react` | Tree-shakable |

### 17.2 Folder structure for the design system

```
src/
├─ styles/
│  ├─ tokens/
│  │  ├─ global.css        # raw ramps, spacing, radius
│  │  ├─ alias.light.css   # semantic tokens (Daylight)
│  │  ├─ alias.dark.css    # semantic tokens (Night)
│  │  └─ motion.css        # durations, easings
│  └─ globals.css          # Tailwind @theme mapping + base styles
├─ components/
│  ├─ ui/                  # Button, Input, Dialog… (shadcn, themed)
│  ├─ brand/               # Logo, Monogram, MonogramIntro, CircuitField, Trace, Node
│  ├─ motion/              # Reveal, Stagger, Magnetic, Spotlight, CountUp, PinnedStory
│  └─ patterns/            # Bento, DeviceFrame, Marquee, Globe, CommandPalette
└─ lib/motion/
   ├─ springs.ts           # spring tokens (§9.1)
   └─ use-reduced-motion.ts
```

### 17.3 Token example (Tailwind v4)

```css
/* src/styles/globals.css */
@import "tailwindcss";
@import "./tokens/global.css";
@import "./tokens/alias.light.css";  /* :root { … } */
@import "./tokens/alias.dark.css";   /* [data-theme="dark"] { … } */
@import "./tokens/motion.css";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-fg: var(--text-primary);
  --color-fg-muted: var(--text-secondary);
  --color-accent: var(--accent-primary);
  --color-spark: var(--accent-spark);
  --radius-card: var(--radius-lg);
  --font-display: var(--font-jakarta);
  --font-sans: var(--font-inter);
}
```

### 17.4 Spring tokens

```ts
// src/lib/motion/springs.ts
export const springs = {
  spatialFast: { type: "spring", stiffness: 600, damping: 38 },
  spatial:     { type: "spring", stiffness: 380, damping: 32 },
  spatialSlow: { type: "spring", stiffness: 200, damping: 28 },
  playful:     { type: "spring", stiffness: 500, damping: 18 },
  effects:     { type: "spring", stiffness: 300, damping: 40 },
} as const;
```

### 17.5 Scroll reveal with native CSS

```css
/* Elements fade/slide in as they enter the viewport — no JS. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }
  }
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
```

### 17.6 Spotlight card

```tsx
"use client";
import { useRef } from "react";

export function SpotlightCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className="spotlight-card">
      {children}
    </div>
  );
}
```

```css
.spotlight-card {
  position: relative;
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  isolation: isolate;
}
.spotlight-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(400px circle at var(--x, 50%) var(--y, 50%),
              color-mix(in oklch, var(--accent-primary) 14%, transparent), transparent 60%);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
  z-index: -1;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .spotlight-card:hover::before { opacity: 1; }
}
```

### 17.7 Magnetic button

```tsx
"use client";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { springs } from "@/lib/motion/springs";

export function Magnetic({ children, strength = 6 }: { children: React.ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), springs.playful);
  const y = useSpring(useMotionValue(0), springs.playful);

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      style={{ x, y, display: "inline-block" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2);
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
```

### 17.8 View Transitions (feature-flagged)

```ts
// next.config.ts
const nextConfig = {
  experimental: { viewTransition: process.env.NEXT_PUBLIC_VIEW_TRANSITIONS === "1" },
};
export default nextConfig;
```

```tsx
// Case-study card and hero share the same name → the image morphs between pages.
import { ViewTransition } from "react";

<ViewTransition name={`case-${slug}`}>
  <Image src={cover} alt="" fill className="object-cover" />
</ViewTransition>
```

```css
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: var(--ease-standard);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### 17.9 Capability detection for heavy effects

```ts
// src/lib/motion/can-use-rich-effects.ts
export function canUseRichEffects() {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const cores = navigator.hardwareConcurrency ?? 2;
  const saveData = (navigator as any).connection?.saveData === true;
  const webgl2 = !!document.createElement("canvas").getContext("webgl2");
  return !reduce && wide && cores >= 4 && !saveData && webgl2;
}
```

### 17.10 Server/client split

- Pages and sections are **Server Components** that render all text and images.
- Interactive layers are small **client islands** (`Magnetic`, `SpotlightCard`, `CircuitField`, `PinnedStory`, `Globe`) wrapped around server-rendered content.
- Heavy islands use `next/dynamic` and mount when near the viewport.

---

## 18. Design process and handoff

| Step | Output | Tool |
|---|---|---|
| 1. Moodboard & concept | "The Bridge" board, Daylight/Night samples | Figma |
| 2. Tokens | Figma Variables (colour, spacing, radius, type) with light/dark modes, exported to CSS via Tokens Studio or Figma's variable export | Figma → JSON → CSS |
| 3. Components | Figma library mirroring §13 with all states | Figma |
| 4. Wireframes | Low-fi for every template in §12, mobile first | Figma |
| 5. Hi-fi + prototypes | Desktop and mobile; motion prototypes for the 5 brand moments | Figma + Rive / After Effects for motion specs |
| 6. Motion specs | Each animation: trigger, properties, token, reduced-motion behaviour | Spec table in Figma + short screen recordings |
| 7. Usability tests | 5 users per persona group (international buyer, local IT manager, student) on prototypes | Maze / moderated calls |
| 8. Build | Components in Storybook first, then pages | Storybook + Chromatic |
| 9. Design QA | Designer reviews every PR preview against Figma | Vercel previews |

Handoff rule: **no screen goes to development without mobile design, dark mode, empty/error/loading states, and a motion note.**

---

## 19. Roadmap

Aligned with the delivery plan in [SRS §15](SRS.md#15-delivery-plan--milestones).

| Phase | Weeks | Design work | Frontend work |
|---|---|---|---|
| **A. Concept** | 1–2 | Moodboard, concept, 3 home hero directions, pick one | Spike: circuit field canvas, pinned story, View Transitions — measure performance |
| **B. Foundations** | 2–3 | Tokens, type, grid, motion tokens, icon set | Token CSS, Tailwind theme, fonts, `springs.ts`, theme switcher, Storybook |
| **C. Components** | 3–5 | Component library with states | Build §13 components with tests and a11y checks |
| **D. Key templates** | 4–7 | Home, Service, Case study, Academy, Program, Contact (desktop + mobile) | Build templates with real CMS data |
| **E. Signature moments** | 6–9 | Motion specs for §10 | Monogram intro, circuit hero, pinned story, bento demos, globe, shared transitions, ⌘K |
| **F. Remaining pages** | 8–10 | Labs, Products, About, Careers, Partners, Events, Insights, Verify, 404 | Build remaining templates |
| **G. Polish** | 10–12 | Design QA, micro-interaction pass, copy fit | Performance tuning, reduced-motion pass, cross-browser, low-end device testing |
| **H. Validate** | 12–13 | Usability test on staging; fixes | Lighthouse, axe, visual regression green |

---

## 20. UI quality checklist

Run on every page before it ships:

**Visual**
- [ ] Uses only tokens (no raw hex, px spacing or ms values in components)
- [ ] Correct mood (Daylight/Night) and at most one glow per viewport
- [ ] Headline ≤ 2 lines on mobile; one accent word at most
- [ ] Images sharp, correctly cropped on all breakpoints, alt text set
- [ ] Light and dark themes both checked

**Interaction**
- [ ] Every interactive element has hover, focus-visible, active, disabled states
- [ ] Animations use motion tokens; only transform/opacity animated
- [ ] Works fully with keyboard; focus order logical
- [ ] Reduced-motion mode checked
- [ ] Touch: no hover-only content; targets ≥ 44 px

**Performance**
- [ ] Lighthouse mobile ≥ 95 performance
- [ ] Heavy effects lazy and paused off-screen
- [ ] No layout shift from fonts, images or late-loading effects

**Content**
- [ ] No placeholder text; real photos or labelled concepts
- [ ] Copy fits in French (longest) without breaking layout

---

## 21. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Effects hurt speed on low-end phones common in the region | Lost visitors, bad SEO | Mobile-first budgets, capability detection, static fallbacks, test on real mid-range Android |
| "Wow" effects distract from the message | Lower conversion | Pillar "Clarity first"; usability tests; one hero motion per view |
| View Transitions still experimental in Next.js | Broken navigation | Feature flag; plain navigation fallback; remove flag if unstable |
| Glass/glow reduce readability | Accessibility failures | No glass behind body text; contrast checks in CI; reduced-transparency support |
| AI imagery seen as fake | Trust loss with international buyers | Real photo shoot; label concept renders |
| Scope creep from many signature moments | Delays | Five brand moments max for v1; others go to backlog |
| Inconsistent implementation across developers | Looks "assembled", not designed | Tokens only, Storybook-first, designer review on every PR |

---

## 22. Sources

**Design systems and platform guidance**
- Material 3 Expressive motion physics — [material-components-android Motion docs](https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Motion.md)
- Microsoft Fluent 2 — [SD Times: Microsoft releases Fluent 2](https://sdtimes.com/msft/microsoft-releases-fluent-2-to-enable-more-creativity-in-design/), [Fluent Design System (Wikipedia)](https://en.wikipedia.org/wiki/Fluent_Design_System)
- Apple Liquid Glass — [LogRocket: Adopting Liquid Glass](https://blog.logrocket.com/ux-design/adopting-liquid-glass-examples-best-practices/), [80.lv: Liquid Glass recreated with CSS + SVG](https://80.lv/articles/accurate-apple-s-liquid-glass-effect-recreated-with-css-svg)

**Web platform**
- [Can I use: View Transitions (single-document)](https://caniuse.com/view-transitions) · [Cross-document](https://caniuse.com/cross-document-view-transitions)
- [Chrome for Developers: cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)
- [CSS view transitions & scroll animations in 2026](https://blog.codercops.com/blog/css-view-transitions-scroll-animations-2026)
- [CSS scroll-driven animations go cross-browser](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026)
- [Next.js `viewTransition` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)

**Inspiration**
- [Best technology company websites 2026 (Alphonso Labs)](https://www.alphonsolabs.com/best-website-design-technology-companies-2026/amp/)
- [Awwwards: Stripe](https://www.awwwards.com/inspiration/stripe-2) · [Awwwards: Bento layouts](https://www.awwwards.com/inspiration/bento-euveka)
- [Scroll storytelling techniques (StudioMeyer)](https://studiomeyer.io/en/blog/scroll-storytelling)
- [CSS-Tricks: Apple-style scroll image sequences](https://css-tricks.com/?p=308477)
