# Software Requirements Specification (SRS)

## Universal Bridge Ltd — Corporate Website & Digital Platform

| Field | Value |
|---|---|
| Document ID | UB-WEB-SRS-001 |
| Version | 1.0 (Draft for review) |
| Date | 2026-10-08 |
| Owner | Universal Bridge Ltd — Office of the Managing Director |
| Technical lead | Senior Full-Stack Engineer (Next.js) |
| Status | Draft — open items listed in §16 must be resolved before build sign-off |
| Supersedes | Current site at `universalbridge.rw` (Bootstrap template, est. 2019) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Company & Market Analysis](#2-company--market-analysis)
3. [Overall Description](#3-overall-description)
4. [Brand & Design System Requirements](#4-brand--design-system-requirements)
5. [Information Architecture & Sitemap](#5-information-architecture--sitemap)
6. [Functional Requirements — Public Website](#6-functional-requirements--public-website)
7. [Functional Requirements — Forms, Portals & Integrations](#7-functional-requirements--forms-portals--integrations)
8. [Functional Requirements — CMS & Admin](#8-functional-requirements--cms--admin)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Technical Architecture](#10-technical-architecture)
11. [Data Model](#11-data-model)
12. [SEO, Content & Internationalisation](#12-seo-content--internationalisation)
13. [Security, Privacy & Compliance](#13-security-privacy--compliance)
14. [Quality Assurance & Acceptance](#14-quality-assurance--acceptance)
15. [Delivery Plan & Milestones](#15-delivery-plan--milestones)
16. [Open Issues & Assumptions](#16-open-issues--assumptions)
17. [Appendices](#17-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for designing, building, and operating the new Universal Bridge Ltd website. It is the single reference for engineering, design, content, and QA throughout the project. Any feature not described here is out of scope unless added through change control (§15.3).

### 1.2 Product Vision

Reposition Universal Bridge Ltd from a local Kigali IT service shop into a **modern, international technology company** — a credible partner for enterprise clients, governments, NGOs, and international buyers — while keeping its strengths in training and community-led innovation.

The site must feel at home next to international software consultancies and product companies: fast, confident, content-rich, and clearly showing proof of delivery (case studies, products, people).

### 1.3 Business Objectives

| ID | Objective | Success metric (12 months after launch) |
|---|---|---|
| BO-1 | Generate qualified B2B leads locally and internationally | ≥ 40 qualified project inquiries / quarter; ≥ 25 % from outside Rwanda |
| BO-2 | Establish international credibility | ≥ 8 published case studies; Lighthouse ≥ 95 on all categories |
| BO-3 | Grow the Academy (training & internships) | ≥ 300 applications / intake cycle submitted online |
| BO-4 | Attract talent | Careers pages produce ≥ 50 % of hires |
| BO-5 | Showcase products (Nyambika Design, AI products) | Product pages drive measurable click-through to product sites |
| BO-6 | Reduce manual admin | 100 % of applications/inquiries captured in one system; no Gmail-only intake |

### 1.4 Scope

**In scope**
- Public marketing website (multilingual, responsive)
- Headless CMS for all editable content
- Lead capture, training/internship applications, careers, agent/partner applications, newsletter
- Certificate verification portal (for internship and training certificates)
- Admin dashboard for submissions
- SEO, analytics, performance, accessibility, privacy compliance
- Hosting, CI/CD, monitoring

**Out of scope (v1)** — candidates for later phases
- Full Learning Management System (course delivery, video hosting, grading)
- E-commerce / online payments for products (training fee payment is Phase 2, see FR-ACA-09)
- Client project portal (ticketing, invoices)
- Native mobile apps

### 1.5 Definitions

| Term | Meaning |
|---|---|
| UB | Universal Bridge Ltd |
| Academy | UB's training and internship division (branded "Universal Bridge Academy"/"UB Academy") |
| Hub | An internal practice area: Coding Hub, AI Innovations Hub, Embedded Systems Hub |
| CMS | Content Management System (headless) |
| RSC | React Server Components |
| NCSA | National Cyber Security Authority (Rwanda), supervisory authority for data protection |
| CWV | Core Web Vitals (LCP, INP, CLS) |
| MoSCoW | Priority levels: **M**ust, **S**hould, **C**ould, **W**on't (this release) |

### 1.6 References

- Current website: `https://universalbridge.rw` (and `/team`, `/agents`, `/application`, `/online_trainings`, `/physical_trainings`)
- Product site: `https://nyambika.com`
- Brand assets supplied by UB (32 images: logos, mockups, signage, uniforms, business cards, certificates, interiors, academy posters, product poster, website hero concept)
- Rwanda Law No. 058/2021 on the Protection of Personal Data and Privacy
- WCAG 2.2 (W3C)
- Next.js 16 documentation (Cache Components, `proxy.ts`, Turbopack)

---

## 2. Company & Market Analysis

### 2.1 Company Profile (from current website)

| Attribute | Detail |
|---|---|
| Legal name | Universal Bridge Ltd |
| Founded | 2019 |
| HQ | 1st floor, Maison Voisin Building, 11 KN 89 St, Nyabugogo–Muhima Road, Nyarugenge, Kigali, Rwanda (opposite King Sports Ltd) |
| Mission (current wording) | "Striving to identify society problems and come up with ICT solutions." |
| Current services | Software development; software publishing (web, desktop, mobile); system analysis & design; IT project consultation & planning; computer maintenance (hardware & software); graphic design; training (programming, web design, graphic design, computer maintenance — online and in person); internships |
| Products | **Nyambika Design** — Rwandan clothing marketplace connecting customers with tailors, cooperatives and producers (bulk orders, custom sewing orders, business advertising, agent network) |
| Programs | Agent program (commission-based business development: 10 % / 35 % / 75 % tiers) |
| Claimed stats (current site) | 274 clients · 421 projects · 1,364 support hours · 18 staff |
| Leadership (current site) | Emmanuel Niyongabo — Managing Director · Aristide Tuyisenge — Product Manager · Joseph Shyirambere — CTO · Jeanne Beula Nzabihimana — Marketing Officer · Patrick Ishimwe — HR Manager |
| Contact | universalbridgeltd@gmail.com · +250 782 634 364 · +250 781 299 528 · +250 783 619 502 |
| Social | Facebook `RwandaUniversalBridgeLtd` · Instagram `universal_bridge_ltd` · LinkedIn `universal-bridge-ltd-2333ba1aa` · X/Twitter `UniversalBridg2` |

### 2.2 Gap Analysis of the Current Website

| # | Problem found | Impact | Requirement addressing it |
|---|---|---|---|
| G-1 | Empty `<title>` on home; generic "Software company in Rwanda 2026" titles | Poor SEO and sharing | §12 |
| G-2 | Lorem-ipsum placeholder content and template testimonials ("Saul Goodman", "Sara Wilsson"…) still live | Severe credibility damage for international buyers | FR-HOME-07, CNT-02 |
| G-3 | Spam link in contact section ("aliexpress free shipping coupon code" via embedded map widget) | Credibility and SEO penalty risk | NFR-SEC-08 |
| G-4 | Typos ("echnology", "gmial.com", "Resurces", "satsfaction", "equipements") | Unprofessional | Content QA gate (§14.4) |
| G-5 | `/internship` returns a 404 page | Lost applicants | FR-ACA-* |
| G-6 | `/application` stuck on "Loading…" | Lost applicants | FR-ACA-05 |
| G-7 | Gmail address as main contact | Weak trust signal | OI-03 |
| G-8 | Personal emails/phones of staff exposed publicly | Privacy risk, spam | FR-TEAM-03 |
| G-9 | No case studies; gallery labelled "App 1", "Card 2" | No proof of delivery | FR-WORK-* |
| G-10 | Bootstrap 3-era template, jQuery, Owl Carousel | Slow, dated, hard to maintain | §10 |
| G-11 | TLS certificate on the HTTPS host does not match the domain for some clients | Browser warnings, bots fail | NFR-SEC-01 |
| G-12 | English only | Limits Rwandan and francophone African reach | §12.3 |

### 2.3 Brand Direction from Supplied Assets

The supplied visual material shows a much larger ambition than the current site. The new website must reflect it:

| Observed in assets | Website implication |
|---|---|
| **UB monogram**: "U" + "B" joined by a diagonal "bridge" cut, orange wedge, three circuit-trace terminals | Logo motif; circuit traces and nodes as a recurring decorative system (dividers, background patterns, loaders) |
| Palette: royal blue, vivid orange, deep navy, white | Design tokens (§4.2) |
| Taglines: *"Building Smart Solutions. Connecting the Future."*, *"Code. Connect. Create Impact."*, *"Ideas → Code → Impact"*, *"Innovate · Collaborate · Develop · Deliver"*, *"Building Bridges in Technology"*, *"Technology Connecting People & Opportunities"* | Primary tagline + message hierarchy (§4.6, OI-01) |
| Hubs: **Coding Hub**, **AI Innovations Hub**, **Embedded Systems Hub** (sensors, drones, robots) | "Labs" section and dedicated pages |
| AI product names: **ChatBridge AI** (assistant), **VisionBridge** (computer vision), **InsightBridge** (data analytics), **PredictBridge** (forecasting) | Products section (confirm status, OI-05) |
| **Universal Bridge Academy** — "Learn. Innovate. Lead." Smart classrooms, AI & robotics lab, coding & software development, drones & IoT, science & innovation labs, digital library, innovation studio, career & leadership development; domain `universalbridge.academy` | Academy section / sub-brand (OI-04) |
| **UB Hackathon** (#UBHackathon, "BridgeMart" demo) | Events & community section |
| Internship certificates with seal and signature | Certificate verification portal (FR-CERT-*) |
| **UB Smart** phone concept poster | Treat as concept; publish only if real (OI-05) |
| Corporate pillars on signage: *Engineering · Technology · Innovation · Consulting* | Top-level service grouping |
| Website hero concept: "Building Digital Solutions for a Better Tomorrow"; services: Custom Software, Web & Mobile Apps, Cloud Solutions, IT Consulting, Ongoing Support; stats row (50+ projects, 30+ clients, 5+ years, 99 % satisfaction) | Starting point for home layout; stats must be reconciled (OI-02) |
| People in branded tees/hoodies, office interiors | Photography direction: real staff, real spaces — replace AI-generated renders with photos (OI-06) |

### 2.4 Market Context

- Rwanda positions itself as an African ICT hub: Kigali Innovation City (special economic zone for universities, tech companies and startups), Smart Africa headquartered in Kigali, very fast business registration, and strong fibre infrastructure. The site should use this as a selling point: **"Built in Kigali, delivering worldwide."**
- International buyers compare UB with nearshore/offshore vendors in Eastern Europe, India and other African hubs (Nairobi, Lagos, Cape Town). They expect: case studies with outcomes, a clear engagement model, tech-stack transparency, security/compliance statements, time-zone overlap (Kigali is UTC+2 — full overlap with Europe, partial with US East), and a fast way to book a call.
- 2026 B2B site patterns to adopt: clean, bold typography; subtle motion and micro-interactions; performance-first builds; structured content for search engines and AI answer engines; accessibility as standard.

### 2.5 Target Audiences & Personas

| ID | Persona | Goal on site | Primary CTA |
|---|---|---|---|
| P-1 | **International CTO / Product lead** (EU, US, Gulf) | Judge whether UB can build and scale their product | Book a discovery call |
| P-2 | **Rwandan / East African enterprise or public institution** IT manager | Find a reliable local partner for systems, maintenance, consulting | Request a proposal |
| P-3 | **NGO / development programme manager** | Partner for digital, data, and education projects | Partnership inquiry |
| P-4 | **Student / young professional** | Join training or internship | Apply to Academy |
| P-5 | **Job seeker / engineer** | Find openings and understand culture | Apply to role |
| P-6 | **Employer / third party** | Verify a UB certificate | Verify certificate |
| P-7 | **Business agent / partner** | Join agent/referral programme | Apply as partner |
| P-8 | **Media / investor** | Company facts, press kit | Download press kit |

---

## 3. Overall Description

### 3.1 Product Perspective

A new, standalone web platform replacing the current PHP/Bootstrap site. It is a **Next.js application** with a **headless CMS**, a **PostgreSQL** database for submissions and certificates, and third-party services for email, analytics and file storage. Nyambika Design and any AI products keep their own domains; the website links to them.

### 3.2 User Classes

| Class | Access | Description |
|---|---|---|
| Visitor | Public | All personas above |
| Applicant | Public + magic link | Can see the status of their own application (Phase 1.5) |
| Content Editor | CMS | Marketing team: edits pages, blog, case studies |
| Academy Admin | Admin dashboard | Manages programs, intakes, applications, certificates |
| HR Admin | Admin dashboard | Manages jobs and job applications |
| Sales Admin | Admin dashboard | Manages leads and partner/agent applications |
| Super Admin | All | Settings, roles, audit log |

### 3.3 Operating Environment

- Browsers: last 2 versions of Chrome, Edge, Firefox, Safari (macOS/iOS); Samsung Internet; Chrome on Android 10+
- Devices: 320 px to 2560 px wide; must work well on low-end Android on 3G/4G (common in the region)
- Hosting: Vercel (recommended) or containerised Node 22 LTS (see §13.3 on data residency)

### 3.4 Constraints

- C-1 Must comply with Rwanda Law No. 058/2021 (personal data) — §13.2
- C-2 Brand must follow the supplied UB identity — §4
- C-3 Content editable by non-developers — §8
- C-4 Budget-aware: prefer managed services with free/low tiers at launch
- C-5 Must not depend on Gmail for business intake

---

## 4. Brand & Design System Requirements

### 4.1 Design Principles

1. **Confident & international** — big type, generous whitespace, few elements per screen.
2. **Proof over promises** — numbers, outcomes, logos, real people.
3. **The bridge** — visual story of connecting ideas → code → impact, Africa ↔ world.
4. **Fast everywhere** — design decisions must hold up on a mid-range Android phone.
5. **Accessible by default** — WCAG 2.2 AA.

### 4.2 Colour Tokens

> Values are estimated from the supplied artwork. **Confirm against master vector files (OI-07)** before build.

| Token | Hex (est.) | Usage |
|---|---|---|
| `--ub-blue-600` (Primary) | `#0B47C1` | Logo, primary buttons, links, key headings |
| `--ub-blue-700` | `#0036A3` | Hover/pressed, solid brand backgrounds |
| `--ub-navy-900` | `#0A1633` | Dark sections, footer, dark-mode base |
| `--ub-navy-800` | `#10224D` | Cards on dark |
| `--ub-orange-500` (Accent) | `#FF7A00` | Accent words ("Ltd", highlighted words), CTA buttons, dividers |
| `--ub-orange-600` | `#E56A00` | Accent hover |
| `--ub-white` | `#FFFFFF` | Backgrounds, logo on dark |
| `--ub-gray-50…900` | neutral scale | Text and surfaces |
| `--ub-glow` | `#3B82F6` @ 40 % | Glow / circuit-light effects on dark sections only |

Rules:
- Orange is an **accent** — roughly 10 % of a screen at most. Orange text on white must pass contrast at its size (use for ≥ 24 px bold, or a darker orange for smaller text).
- Body text on white: `--ub-navy-900` or gray-700; never pure black.
- Support **light and dark themes**; dark theme mirrors the night-time signage/office renders (navy + blue glow + orange).

### 4.3 Typography

The logotype uses a geometric, rounded sans-serif.

| Role | Font | Weights |
|---|---|---|
| Display / headings | **Plus Jakarta Sans** (or brand font if UB owns one — OI-07) | 600, 700, 800 |
| Body / UI | **Inter** | 400, 500, 600 |
| Code / technical accents | **JetBrains Mono** | 400, 500 |

- Load via `next/font` (self-hosted, `display: swap`, Latin + Latin Extended subsets for Kinyarwanda/French).
- Fluid type scale with `clamp()`; H1 desktop 56–72 px, mobile 36–40 px.

### 4.4 Logo Usage

| Variant | Use |
|---|---|
| Full horizontal (mark + divider + "Universal Bridge **Ltd**") — blue on white | Header (light), documents |
| Full horizontal — white + orange on blue/navy | Header (dark), footer, hero overlays |
| Monogram "UB" only | Favicon, app icon, social avatar, loaders, small spaces |
| Stacked (mark above wordmark) | Splash, signage-style hero, OG images |

- Deliver as optimised **SVG** (inline React components), plus PNG fallbacks for OG/email.
- Minimum clear space: height of the orange wedge on all sides. Minimum width: 24 px (mark), 120 px (horizontal).
- Favicons: SVG favicon + `apple-touch-icon` 180 px + PWA icons 192/512 px + maskable.

### 4.5 Visual Language

- **Circuit-trace motif**: lines ending in ringed nodes (from the "B"). Use as section dividers, hero background (animated, subtle), card hover accents, 404 illustration.
- **Diagonal cut**: the "bridge" diagonal → angled section edges and image masks (as in the hero concept).
- **Photography**: real team, real offices, workshops, hackathons; warm natural light; branded apparel. Avoid generic stock. AI renders only as clearly-labelled concepts (OI-06).
- **Iconography**: Lucide (outline, 1.5 px stroke) to match the line icons in supplied material.
- **Motion**: Motion (Framer Motion); entrances ≤ 400 ms; count-up stats; hover lifts; all disabled under `prefers-reduced-motion`.
- **Depth**: soft shadows on light; glows on dark. Glass effect only on the scrolled header.

### 4.6 Voice & Messaging

- Tone: confident, clear, human, optimistic. Plain English, short sentences, jargon explained.
- Primary tagline (proposed): **"Building Smart Solutions. Connecting the Future."**
- Supporting line: **"Code. Connect. Create Impact."**
- Academy: **"Learn. Innovate. Lead."**
- Proof line: **"Built in Kigali. Delivering worldwide."**
- Final set needs sign-off (OI-01).

### 4.7 Component Library (must build)

Button (primary, secondary, ghost, link; sizes; icon slots) · Badge/Tag · Card (service, case study, product, person, job, post, program) · Section header (eyebrow + title + lead) · Stat counter · Logo cloud (marquee) · Testimonial slider · Tabs · Accordion (FAQ) · Timeline · Stepper (process) · Modal/Sheet · Toast · Form fields (text, textarea, select, combobox, file upload, phone with country code, checkbox, radio, date) · Breadcrumbs · Pagination · Table · Mega-menu · Mobile drawer · Language switcher · Theme toggle · Cookie banner · Video embed (privacy-enhanced) · Code block · CTA band · Map (static image + link, no third-party widget).

All components documented in **Storybook** with light/dark variants and a11y checks.

---

## 5. Information Architecture & Sitemap

### 5.1 Primary Navigation

```
[Logo]  Services ▾   Solutions ▾   Work   Academy ▾   Company ▾   Insights      [Lang] [Theme] [Let's talk →]
```

### 5.2 Sitemap

```
/                                   Home
/services                           Services overview
  /services/custom-software         Custom Software Development
  /services/web-mobile              Web & Mobile Applications
  /services/cloud-devops            Cloud & DevOps
  /services/ai-data                 AI, Machine Learning & Data
  /services/embedded-iot            Embedded Systems, IoT, Drones & Robotics
  /services/ui-ux-design            UI/UX & Graphic Design
  /services/it-consulting           IT Consulting, System Analysis & Project Planning
  /services/managed-it              Managed IT, Support & Maintenance
/solutions                          Industry solutions overview
  /solutions/[industry]             Government · Education · Finance · Health · Agriculture · Retail & Commerce · NGOs
/products                           Products overview
  /products/nyambika-design         Nyambika Design (links to nyambika.com)
  /products/[slug]                  ChatBridge AI · VisionBridge · InsightBridge · PredictBridge (if confirmed)
/work                               Case studies (filterable)
  /work/[slug]                      Case study detail
/labs                               Innovation hubs overview
  /labs/coding-hub
  /labs/ai-innovations-hub
  /labs/embedded-systems-hub
/academy                            Universal Bridge Academy
  /academy/programs                 Programs list
  /academy/programs/[slug]          Program detail (online / in-person)
  /academy/internships              Internship programme
  /academy/apply                    Application form (program or internship)
  /academy/verify                   Certificate verification
  /academy/verify/[code]            Verification result
/company/about                      About, story, mission, vision, values
/company/leadership                 Leadership team
/company/careers                    Careers
  /company/careers/[slug]           Job detail + apply
/company/partners                   Partner & agent programme (+ apply)
/company/events                     Events & hackathons
  /company/events/[slug]
/company/press                      Newsroom & press kit
/insights                           Blog / insights
  /insights/[slug]
  /insights/category/[slug]
/contact                            Contact + project inquiry
/book                               Book a discovery call
/legal/privacy                      Privacy policy
/legal/cookies                      Cookie policy
/legal/terms                        Terms of use
/legal/accessibility                Accessibility statement
/sitemap.xml, /robots.txt, /llms.txt, /feed.xml
/admin/*                            Admin dashboard (auth required)
```

### 5.3 Legacy URL Redirects (301)

| Old | New |
|---|---|
| `/#about` | `/company/about` (client-side hash handling on `/`) |
| `/#services` | `/services` (client-side hash handling on `/`) |
| `/team` | `/company/leadership` |
| `/agents` | `/company/partners` |
| `/application` | `/academy/apply` |
| `/internship` | `/academy/internships` |
| `/online_trainings`, `/physical_trainings` | `/academy/programs?mode=online` / `?mode=in-person` |

### 5.4 Footer

Four columns + bottom bar: **Services** · **Company** · **Academy** · **Contact** (address, phone, email, office hours, "Kigali · UTC+2"); newsletter sign-up; social icons; language switcher; legal links; © year; company registration number (OI-09).

---

## 6. Functional Requirements — Public Website

Priority: **M** Must · **S** Should · **C** Could.

### 6.1 Global

| ID | Requirement | Pri |
|---|---|---|
| FR-GL-01 | Sticky header; transparent over hero, solid with backdrop blur after 24 px scroll | M |
| FR-GL-02 | Desktop mega-menu for Services/Solutions/Academy with icon, title, one-line description | M |
| FR-GL-03 | Mobile drawer navigation with full keyboard and screen-reader support, focus trap | M |
| FR-GL-04 | Persistent primary CTA "Let's talk" → `/contact` (or `/book`) | M |
| FR-GL-05 | Language switcher (EN, FR, RW) keeping the user on the same page | M |
| FR-GL-06 | Light/dark theme toggle; default follows system preference; choice persisted | S |
| FR-GL-07 | Breadcrumbs on all pages deeper than level 1 (+ BreadcrumbList JSON-LD) | M |
| FR-GL-08 | Site search (Cmd/Ctrl-K) over services, case studies, posts, programs, jobs | C |
| FR-GL-09 | Custom 404 and 500 pages with brand illustration and helpful links | M |
| FR-GL-10 | Cookie consent banner; analytics loads only after consent (§13.2) | M |
| FR-GL-11 | WhatsApp click-to-chat button — configurable in CMS, hidden on application forms | S |
| FR-GL-12 | Announcement bar (CMS-controlled, dismissible) for intakes, hackathons, launches | S |
| FR-GL-13 | Back-to-top control on long pages | C |

### 6.2 Home Page

| ID | Section | Requirement | Pri |
|---|---|---|---|
| FR-HOME-01 | Hero | Eyebrow "IDEAS → CODE → IMPACT"; H1 (e.g. "Building digital solutions for a better tomorrow" with orange accent words); lead text; primary CTA "Start a project", secondary "View our work"; hero visual with diagonal mask (real team photo) + subtle animated circuit lines; LCP image priority-loaded | M |
| FR-HOME-02 | Trust bar | Client/partner logo marquee (grayscale, colour on hover); pauses on hover/reduced motion | M |
| FR-HOME-03 | Services grid | 6–8 service cards with icon, title, one-liner, link | M |
| FR-HOME-04 | Stats | 4 animated counters from CMS (e.g. projects delivered, clients, years, countries served) | M |
| FR-HOME-05 | Featured work | 3 featured case studies (image, client, industry, headline result) | M |
| FR-HOME-06 | Labs | Coding / AI Innovations / Embedded Systems hubs — dark section with glow | S |
| FR-HOME-07 | Testimonials | Real, approved client quotes only (name, role, company, photo/logo); section hidden if none | M |
| FR-HOME-08 | Process | "How we work": Discover → Design → Develop → Deliver → Support | M |
| FR-HOME-09 | Products | Nyambika Design + other confirmed products | S |
| FR-HOME-10 | Academy teaser | "Learn. Innovate. Lead." with next intake date and Apply CTA | M |
| FR-HOME-11 | Insights | 3 latest posts | S |
| FR-HOME-12 | Global reach | "Built in Kigali, delivering worldwide" — countries served, time-zone overlap note | S |
| FR-HOME-13 | Final CTA band | "Let's build something great together" + call booking | M |

### 6.3 Services

| ID | Requirement | Pri |
|---|---|---|
| FR-SRV-01 | Overview page grouped by pillar: **Engineering**, **Technology**, **Innovation**, **Consulting** | M |
| FR-SRV-02 | Detail template: hero, problem/outcome statement, deliverables, tech stack logos, process, engagement models, related case studies, FAQ (FAQPage JSON-LD), CTA | M |
| FR-SRV-03 | Engagement models: Fixed-scope project · Dedicated team · Staff augmentation · Retainer/Support | M |
| FR-SRV-04 | Tech stack from CMS taxonomy (e.g. Next.js, React, React Native, Flutter, Node.js, Python, Laravel, PostgreSQL, AWS, Azure, GCP, Docker, TensorFlow/PyTorch, Arduino/ESP32, Raspberry Pi) | S |
| FR-SRV-05 | Each service page has its own SEO metadata and OG image | M |

### 6.4 Solutions (Industries)

| ID | Requirement | Pri |
|---|---|---|
| FR-SOL-01 | Industry template: challenges, UB solutions, relevant services, case studies, CTA | S |
| FR-SOL-02 | Initial industries: Government & Public Sector, Education, Finance & Fintech, Health, Agriculture, Retail & E-commerce, NGOs & Development | S |

### 6.5 Work / Case Studies

| ID | Requirement | Pri |
|---|---|---|
| FR-WORK-01 | Listing with filters (industry, service, technology, region) via URL search params (shareable) | M |
| FR-WORK-02 | Template: hero, client & context, challenge, solution, tech stack, results (numeric metrics), gallery, testimonial, team, next/previous | M |
| FR-WORK-03 | Support anonymised case studies ("Leading East African bank") under NDA | M |
| FR-WORK-04 | Downloadable PDF one-pager per case study | C |

### 6.6 Products

| ID | Requirement | Pri |
|---|---|---|
| FR-PRD-01 | Product cards with status badge (Live, Beta, Coming soon) | M |
| FR-PRD-02 | Product page: value proposition, features, screenshots, audience, external link, "Request demo" form | M |
| FR-PRD-03 | Nyambika Design page with link to `nyambika.com` and producer/customer CTAs | M |
| FR-PRD-04 | "Coming soon" products collect waitlist emails | C |

### 6.7 Labs / Innovation Hubs

| ID | Requirement | Pri |
|---|---|---|
| FR-LAB-01 | Hub page: focus areas, equipment/capabilities, projects, people, collaboration CTA | S |
| FR-LAB-02 | Embedded Systems Hub: sensors, drones, robotics, IoT prototyping | S |
| FR-LAB-03 | AI Innovations Hub: AI projects (ChatBridge AI, VisionBridge, InsightBridge, PredictBridge if confirmed) | S |

### 6.8 Academy

| ID | Requirement | Pri |
|---|---|---|
| FR-ACA-01 | Landing: mission, learning areas (Coding & Software Development, AI & Robotics, Drones & IoT, Graphic/UI Design, Computer Maintenance & Networking, Science & Innovation, Leadership & Career), outcomes, upcoming intakes, alumni testimonials, partners | M |
| FR-ACA-02 | Program listing with filters: mode (online, in-person, hybrid), level, duration, category | M |
| FR-ACA-03 | Program detail: overview, curriculum (modules accordion), duration, schedule, mode, location, fee (or free/sponsored), prerequisites, instructors, next intake & deadline, FAQ, Apply CTA; Course JSON-LD | M |
| FR-ACA-04 | Internship page: tracks (Software, Marketing, Design, Hardware…), duration, eligibility, process, certificate, Apply CTA | M |
| FR-ACA-05 | Application form (§7.2) — no "Loading…" dead ends; server-rendered fallback | M |
| FR-ACA-06 | When intake capacity is reached, form switches to waitlist | S |
| FR-ACA-07 | Alumni stories (CMS) | S |
| FR-ACA-08 | Optional sub-brand domain `universalbridge.academy` → `/academy` (OI-04) | S |
| FR-ACA-09 | Online fee payment (MTN MoMo, Airtel Money, card via a regional gateway) | Phase 2 |

### 6.9 Company

| ID | Requirement | Pri |
|---|---|---|
| FR-ABT-01 | About: story since 2019, mission, vision, values, milestone timeline, numbers, office photos, "Why Rwanda" | M |
| FR-TEAM-01 | Leadership page: photo, name, title, short bio, LinkedIn | M |
| FR-TEAM-02 | Optional wider team grid (CMS toggle) | C |
| FR-TEAM-03 | **No personal emails or phone numbers** published; all contact goes through company channels | M |
| FR-CAR-01 | Careers: culture, benefits, hiring process, open roles (department, location, type, remote policy) | M |
| FR-CAR-02 | Job detail with JobPosting JSON-LD; Apply form with CV upload | M |
| FR-CAR-03 | Open application ("Don't see a role?") | S |
| FR-PRT-01 | Partners: technology partners, client logos, and the **Agent/Referral programme** (current tiers 10 % / 35 % / 75 % — OI-10) with application form | M |
| FR-EVT-01 | Events & hackathons: upcoming/past, detail page with agenda, registration, gallery; Event JSON-LD | S |
| FR-PRS-01 | Press: news, media mentions, downloadable press kit (logo ZIP, boilerplate, leadership photos, fact sheet) | S |

### 6.10 Insights (Blog)

| ID | Requirement | Pri |
|---|---|---|
| FR-BLOG-01 | Listing with categories, tags, pagination, featured post | M |
| FR-BLOG-02 | Post: title, author (bio), date, reading time, cover, rich text (headings, images, code with syntax highlighting, embeds, callouts), table of contents, share links, related posts; Article JSON-LD | M |
| FR-BLOG-03 | RSS feed `/feed.xml` | S |
| FR-BLOG-04 | Per-locale posts; untranslated posts show in English with a notice | S |

### 6.11 Contact & Booking

| ID | Requirement | Pri |
|---|---|---|
| FR-CON-01 | Contact page: inquiry form, office address, static map image linking to Google Maps (no embedded third-party widget), phone(s), email, WhatsApp, office hours, time zone | M |
| FR-CON-02 | Department routing: Sales/Projects, Academy, Careers, Partnerships, Press, Support | M |
| FR-BOOK-01 | Book a call: embedded scheduler (Cal.com recommended) in the visitor's time zone | S |

### 6.12 Certificate Verification

| ID | Requirement | Pri |
|---|---|---|
| FR-CERT-01 | Public page to enter a certificate ID, or scan the QR code printed on the certificate | M |
| FR-CERT-02 | Result shows only: holder name, programme/internship title, role, start/end dates, issue date, status (Valid / Revoked), signatory | M |
| FR-CERT-03 | IDs are unguessable (e.g. `UB-2026-` + 10-char random base32); lookups rate-limited | M |
| FR-CERT-04 | Admin can issue, bulk-import (CSV), revoke certificates and download a print-ready PDF with QR code matching the supplied certificate design | S |

---

## 7. Functional Requirements — Forms, Portals & Integrations

### 7.1 Common Form Behaviour

| ID | Requirement |
|---|---|
| FR-FORM-01 | React Hook Form + Zod on the client; the same Zod schema validated on the server (Server Actions) |
| FR-FORM-02 | Inline, accessible error messages (`aria-describedby`) and an error summary on submit |
| FR-FORM-03 | Spam protection: Cloudflare Turnstile + honeypot + server-side rate limiting (per IP and per email) |
| FR-FORM-04 | Explicit, unticked consent checkbox linking to the privacy policy; consent text, version and timestamp stored |
| FR-FORM-05 | On success: confirmation screen, confirmation email to submitter, notification to the right internal inbox |
| FR-FORM-06 | Every submission stored in the DB with status workflow and audit trail |
| FR-FORM-07 | Phone input with country selector, default +250, stored in E.164 |
| FR-FORM-08 | File uploads (CV, portfolio): PDF/DOC/DOCX ≤ 5 MB, virus-scanned, stored privately with signed URLs |
| FR-FORM-09 | UTM parameters and referrer captured with leads |
| FR-FORM-10 | Progressive enhancement: forms still submit if client JS fails |

### 7.2 Form Catalogue

| Form | Fields (minimum) | Routed to |
|---|---|---|
| **Project inquiry** | Name, work email, company, country, phone (opt.), service(s), budget range (USD), timeline, description, how did you hear, attachment (opt.) | Sales |
| **Academy application** | Program/intake, full name, email, phone, gender (opt.), date of birth, district/country, education level, current status, motivation, preferred mode, how did you hear, guardian consent if under 18 | Academy |
| **Internship application** | Track, name, email, phone, institution, field of study, year, availability, CV, portfolio link, motivation | Academy/HR |
| **Job application** | Role, name, email, phone, location, LinkedIn, portfolio/GitHub, CV, cover note, earliest start | HR |
| **Partner / agent application** | Name, email, phone, gender (opt.), location, profession, tier of interest, network/sector description, accepts programme conditions | Sales |
| **Product demo request** | Product, name, email, company, country, use case | Sales |
| **Newsletter** | Email, locale, interests (opt.) — double opt-in | Marketing |
| **Event registration** | Event, name, email, phone, organisation, team name (hackathon) | Events |

### 7.3 Integrations

| ID | Integration | Purpose | Pri |
|---|---|---|---|
| INT-01 | **Resend** (or Postmark) + React Email | Branded transactional emails | M |
| INT-02 | Google Workspace / Microsoft 365 on company domain | Staff and role mailboxes (`hello@`, `academy@`, `careers@`) | M |
| INT-03 | Cloudflare Turnstile | Bot protection | M |
| INT-04 | **Plausible** or **Umami** (cookieless); GA4 optional behind consent | Traffic and conversions | M |
| INT-05 | Cal.com | Discovery-call booking | S |
| INT-06 | CRM (HubSpot Free or Zoho) via webhook | Lead pipeline | S |
| INT-07 | Newsletter (Resend Audiences / Brevo / Mailchimp) | Newsletter | S |
| INT-08 | Slack/Teams/Telegram webhook | Instant internal alert on new lead | C |
| INT-09 | Payment gateway (MoMo/Airtel/card) | Academy fees | Phase 2 |
| INT-10 | "Ask UB" AI assistant answering from CMS content (RAG) | Showcase AI capability | Phase 2 |

---

## 8. Functional Requirements — CMS & Admin

### 8.1 CMS

**Recommended: Payload CMS 3** (runs inside the same Next.js app, TypeScript, PostgreSQL, open source, self-hostable). Alternative: Sanity (hosted).

| ID | Requirement | Pri |
|---|---|---|
| CMS-01 | Editors manage all page content — no hard-coded marketing copy | M |
| CMS-02 | Collections: Pages, Services, Industries, Case Studies, Products, Hubs, Programs, Intakes, Posts, Authors, Categories, Team Members, Jobs, Events, Testimonials, Clients, Partners, FAQs, Press Items, Media | M |
| CMS-03 | Globals: site settings, navigation, footer, contact info, social links, stats, announcement bar, SEO defaults | M |
| CMS-04 | Block-based page builder (Hero, Rich text, Cards grid, Stats, Logo cloud, CTA band, Testimonials, FAQ, Media+Text, Timeline) | S |
| CMS-05 | Per-field localisation (EN/FR/RW) with fallback to EN | M |
| CMS-06 | Draft/publish, scheduled publishing, version history & restore | M |
| CMS-07 | Live preview of drafts (Next.js draft mode) | S |
| CMS-08 | On publish, revalidate affected pages by cache tag — changes live in < 60 s | M |
| CMS-09 | Media library: alt text required, focal point, responsive sizes, AVIF/WebP | M |
| CMS-10 | Per-document SEO fields (title, description, OG image, canonical, noindex) | M |

### 8.2 Admin Dashboard (submissions)

| ID | Requirement | Pri |
|---|---|---|
| ADM-01 | Role-based access (§3.2); SSO with Google/Microsoft for staff; MFA required | M |
| ADM-02 | Inbox per form type: list, search, filters (status, date, program, country), detail view | M |
| ADM-03 | Status workflows — Leads: New → Contacted → Qualified → Proposal → Won/Lost. Applications: Received → Under review → Shortlisted → Accepted/Rejected/Waitlisted | M |
| ADM-04 | Internal notes and assignment to staff | S |
| ADM-05 | Templated status emails to applicants | S |
| ADM-06 | CSV export (role-restricted, logged) | M |
| ADM-07 | Certificate management (FR-CERT-04) | S |
| ADM-08 | Audit log for all admin actions and personal-data exports | M |
| ADM-09 | Data subject request tools: find, export, delete a person's data | M |
| ADM-10 | KPI dashboard: submissions per week by type, conversion by source | C |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Core Web Vitals at p75 (field): **LCP ≤ 2.0 s**, **INP ≤ 200 ms**, **CLS ≤ 0.05** |
| NFR-PERF-02 | Lighthouse (mobile, throttled) ≥ **95** Performance and **100** Accessibility, Best Practices, SEO on key templates |
| NFR-PERF-03 | First-load JS ≤ **120 KB gzip** on marketing pages; heavy components (sliders, scheduler) lazy-loaded |
| NFR-PERF-04 | Images via `next/image`, AVIF/WebP, correct `sizes`, hero `priority`; no image > 200 KB on mobile |
| NFR-PERF-05 | Marketing pages prerendered and cached (Cache Components, `"use cache"`), served from CDN; TTFB ≤ 200 ms in Europe and East Africa |
| NFR-PERF-06 | Fonts self-hosted, subset, preloaded; no layout shift from font swap |
| NFR-PERF-07 | Performance budget enforced in CI (Lighthouse CI + bundle analyser) — PR fails if exceeded |

### 9.2 Accessibility

| ID | Requirement |
|---|---|
| NFR-A11Y-01 | Conform to **WCAG 2.2 Level AA** |
| NFR-A11Y-02 | Full keyboard navigation, visible focus rings, skip-to-content link |
| NFR-A11Y-03 | Semantic landmarks, one H1 per page, logical heading order |
| NFR-A11Y-04 | Contrast ≥ 4.5:1 for text, 3:1 for large text and UI components |
| NFR-A11Y-05 | All motion respects `prefers-reduced-motion`; auto-moving content > 5 s has pause control |
| NFR-A11Y-06 | Alt text mandatory in CMS; decorative images use `alt=""` |
| NFR-A11Y-07 | Tested with axe (automated) and NVDA + VoiceOver (manual) before launch |
| NFR-A11Y-08 | Touch targets ≥ 44 × 44 px |

### 9.3 Availability & Reliability

| ID | Requirement |
|---|---|
| NFR-REL-01 | 99.9 % monthly uptime for the public site |
| NFR-REL-02 | Forms never lose data: submission saved first; failed emails retried (outbox pattern) |
| NFR-REL-03 | Daily DB backups, 30-day retention, restore tested quarterly; RPO ≤ 24 h, RTO ≤ 4 h |
| NFR-REL-04 | Uptime monitoring (Better Stack / UptimeRobot) with alerts |
| NFR-REL-05 | Error tracking with Sentry (PII scrubbing on) |

### 9.4 Maintainability

| ID | Requirement |
|---|---|
| NFR-MNT-01 | TypeScript `strict`; no `any` without justification |
| NFR-MNT-02 | ESLint + Prettier (or Biome); Husky + lint-staged; Conventional Commits |
| NFR-MNT-03 | Feature-based folder structure (§10.4); shared UI in `components/ui` |
| NFR-MNT-04 | Unit test coverage ≥ 70 % for `lib/` and server actions |
| NFR-MNT-05 | Dependencies updated monthly (Renovate/Dependabot) |
| NFR-MNT-06 | README, ADRs in `docs/adr`, complete `.env.example` |

### 9.5 Usability & Compatibility

| ID | Requirement |
|---|---|
| NFR-USE-01 | Mobile-first; tested at 360, 390, 768, 1024, 1280, 1440, 1920 px |
| NFR-USE-02 | Contact and Apply reachable within 2 taps from any page |
| NFR-USE-03 | Page usable within 5 s on "Slow 4G" |
| NFR-USE-04 | Print stylesheet for case studies and program pages |

---

## 10. Technical Architecture

### 10.1 Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19.2, Turbopack) | Server Components by default; Cache Components (`"use cache"`, `cacheTag`, `cacheLife`); `proxy.ts` for locale detection and redirects |
| Language | TypeScript 5.x (strict) | |
| Styling | **Tailwind CSS v4** with CSS-variable design tokens | `@theme` tokens from §4.2 |
| UI primitives | **shadcn/ui** (Radix UI) | Accessible base components, themed to UB |
| Icons | Lucide React | |
| Animation | Motion (Framer Motion) | Respects reduced motion |
| CMS | **Payload CMS 3** (embedded in Next.js) | Alternative: Sanity |
| Database | **PostgreSQL 16+** | Location per §13.3 |
| ORM | Payload Postgres adapter (Drizzle); Drizzle for custom tables | |
| Admin auth | Payload auth + SSO (Google/Microsoft) | MFA |
| Forms | React Hook Form + Zod + Server Actions | |
| i18n | **next-intl** | `/[locale]/…` routing |
| Email | Resend + React Email | |
| File storage | S3-compatible (Cloudflare R2 / AWS S3 / in-country provider) | Private bucket for CVs |
| Search | Pagefind or Payload search plugin | FR-GL-08 |
| Analytics | Plausible/Umami; Vercel Speed Insights | |
| Monitoring | Sentry, Better Stack | |
| Testing | Vitest, Testing Library, Playwright, axe-core, Lighthouse CI | |
| Component docs | Storybook | |
| Hosting | **Vercel** + managed Postgres; Cloudflare DNS/WAF | See §13.3 |
| CI/CD | GitHub Actions + Vercel preview deployments per PR | |
| Package manager | pnpm | |
| Runtime | Node.js 22 LTS | |

### 10.2 Rendering Strategy

| Page type | Strategy |
|---|---|
| Home, services, solutions, about, labs, products | Prerendered + cached components, revalidated by CMS tag on publish |
| Case studies, posts, programs, jobs, events | `generateStaticParams` for published slugs; on-demand revalidation by tag |
| Listing pages with filters | Static shell + streamed filtered results (search params) |
| Certificate verification result | Dynamic (uncached), rate-limited |
| Forms | Server Actions on a static page shell |
| Admin | Dynamic, authenticated, `noindex` |

### 10.3 High-Level Architecture

```
            ┌──────────────── Cloudflare (DNS, WAF, Turnstile) ───────────────┐
Visitors ──▶│                                                                  │
            └──────────────────────────────┬───────────────────────────────────┘
                                           ▼
                          ┌──────── Vercel Edge / CDN ────────┐
                          │  proxy.ts (locale, redirects)      │
                          └───────────────┬────────────────────┘
                                          ▼
                 ┌────────────── Next.js 16 App ─────────────────┐
                 │  RSC pages (cached)  │  Server Actions (forms)│
                 │  Payload CMS (/admin)│  Route handlers (API)  │
                 └───────┬──────────────┴──────────┬─────────────┘
                         ▼                         ▼
                 PostgreSQL (content,       Object storage (media;
                 submissions, certs)        CVs in private bucket)
                         │
       ┌─────────────────┼──────────────────────┬──────────────────┐
       ▼                 ▼                      ▼                  ▼
    Resend           CRM webhook           Sentry/Logs        Analytics
```

### 10.4 Project Structure

```
universal-bridge/
├─ docs/                     # SRS, ADRs, runbooks
├─ public/                   # static files, favicons
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/[locale]/       # public routes per §5.2
│  │  │  ├─ page.tsx
│  │  │  ├─ services/[slug]/page.tsx
│  │  │  ├─ work/[slug]/page.tsx
│  │  │  ├─ academy/…
│  │  │  └─ …
│  │  ├─ (payload)/admin/…          # Payload admin
│  │  ├─ api/…                      # webhooks, health
│  │  ├─ sitemap.ts  robots.ts  manifest.ts
│  │  └─ opengraph-image.tsx        # dynamic OG images
│  ├─ components/
│  │  ├─ ui/                        # shadcn primitives
│  │  ├─ brand/                     # Logo, Monogram, CircuitLines
│  │  ├─ blocks/                    # CMS page-builder blocks
│  │  └─ layout/                    # Header, Footer, MegaMenu
│  ├─ features/                     # contact, academy, careers, certificates…
│  │  └─ <feature>/{actions.ts, schema.ts, components/, emails/}
│  ├─ collections/                  # Payload collections
│  ├─ globals/                      # Payload globals
│  ├─ i18n/                         # next-intl config + messages/{en,fr,rw}.json
│  ├─ lib/                          # db, email, rate-limit, seo, utils
│  ├─ styles/globals.css            # Tailwind v4 + tokens
│  └─ proxy.ts
├─ tests/{unit,e2e}/
├─ .github/workflows/
├─ payload.config.ts
└─ .env.example
```

### 10.5 Environments

| Env | URL | Data | Deploy trigger |
|---|---|---|---|
| Local | `localhost:3000` | Seed data | — |
| Preview | `*.vercel.app` per PR | Staging DB branch | PR opened/updated |
| Staging | `staging.universalbridge.rw` (password-protected, `noindex`) | Staging DB | Merge to `develop` |
| Production | `universalbridge.rw` (`www` → apex 301) | Prod DB | Merge to `main` + manual approval |

### 10.6 Environment Variables (indicative)

`DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `SENTRY_DSN`, `PLAUSIBLE_DOMAIN`, `CAL_LINK`, `CRM_WEBHOOK_URL`, `REVALIDATE_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## 11. Data Model

Core entities (CMS collections + custom tables). All have `id`, `createdAt`, `updatedAt`; (L) = localised.

| Entity | Key fields |
|---|---|
| **Service** | slug, title (L), pillar (Engineering/Technology/Innovation/Consulting), icon, summary (L), body blocks (L), deliverables (L), technologies → Technology[], faqs → FAQ[], caseStudies → CaseStudy[], seo |
| **Industry** | slug, title (L), challenges (L), services → Service[], caseStudies → CaseStudy[], seo |
| **CaseStudy** | slug, title (L), client (name or anonymised label), clientLogo, industry, services[], technologies[], region, challenge (L), solution (L), results [{value, label (L)}], gallery, testimonial, featured, publishedAt, seo |
| **Product** | slug, name, status (live/beta/soon), tagline (L), features (L), screenshots, externalUrl, seo |
| **Hub** | slug, name, focusAreas (L), equipment, projects, people → TeamMember[] |
| **Program** | slug, title (L), category, mode (online/in-person/hybrid), level, durationWeeks, fee {amount, currency, isFree}, curriculum [{module, topics}] (L), prerequisites (L), instructors[], location, seo |
| **Intake** | program, startDate, endDate, applicationDeadline, capacity, status (open/full/closed) |
| **TeamMember** | name, title (L), bio (L), photo, linkedinUrl, isLeadership, order |
| **Job** | slug, title, department, location, employmentType, remotePolicy, description (L), requirements (L), salaryRange (opt.), validThrough, status |
| **Event** | slug, title (L), type (hackathon/workshop/meetup/webinar), startAt, endAt, venue or online, registration, agenda, gallery |
| **Post** | slug, title (L), excerpt (L), cover, body (L), author, categories, tags, publishedAt, seo |
| **Testimonial** | quote (L), personName, role, company, photo/logo, approved, consentDate |
| **Client** | name, logo, url, showOnSite |
| **Lead** (custom) | name, email, company, country, phone, services[], budgetRange, timeline, message, attachments, utm{}, referrer, locale, status, assignee, notes[], consent{text, version, at} |
| **Application** (custom) | type (academy/internship/job/partner), refId, applicant data (schema-validated JSON), files[], status, notes[], consent{} |
| **Certificate** (custom) | code (unique), holderName, programTitle, role, startDate, endDate, issuedAt, signatoryName, signatoryTitle, status (valid/revoked), revokedReason |
| **Subscriber** | email, locale, interests[], confirmedAt, unsubscribedAt |
| **AuditLog** | actor, action, entity, entityId, at, meta |

**Retention:** leads 24 months after last contact; unsuccessful applications and CVs 12 months; certificates kept permanently (stated in the privacy policy). A scheduled job purges expired records monthly.

---

## 12. SEO, Content & Internationalisation

### 12.1 Technical SEO

| ID | Requirement |
|---|---|
| SEO-01 | Unique `<title>` (≤ 60 chars) and meta description (≤ 155) per page via `generateMetadata`; template `%s · Universal Bridge Ltd` |
| SEO-02 | Canonical URLs; `hreflang` alternates for EN/FR/RW + `x-default` |
| SEO-03 | `sitemap.xml` (all locales) and `robots.txt` generated from CMS data |
| SEO-04 | JSON-LD: Organization (logo, sameAs, address, contactPoint), LocalBusiness, WebSite, BreadcrumbList, Service, Article, FAQPage, JobPosting, Course, Event, Product |
| SEO-05 | Dynamic Open Graph / Twitter images per page from a brand template |
| SEO-06 | Lowercase, hyphenated slugs; 301 map for legacy URLs (§5.3) |
| SEO-07 | `llms.txt` and factual content blocks (company facts, services, FAQs) for AI-driven search |
| SEO-08 | Google Search Console and Bing Webmaster verified; Google Business Profile updated |
| SEO-09 | Staging fully `noindex` + password; CI check that production has no stray `noindex` |

### 12.2 Content Requirements

| ID | Requirement |
|---|---|
| CNT-01 | All copy rewritten in international business English and reviewed by a strong editor |
| CNT-02 | Zero placeholder text at launch (automated scan for "lorem", "ipsum", "TODO", "placeholder") |
| CNT-03 | Launch minimum: 8 service pages, 4 industry pages, **≥ 4 case studies**, Nyambika product page, 3 hub pages, ≥ 3 programs, internship page, leadership, about, careers, partners, contact, 4 blog posts, all legal pages |
| CNT-04 | Every stat on the site is verifiable and dated (OI-02) |
| CNT-05 | Testimonials only with written client approval |
| CNT-06 | Professional photo shoot of team and offices (OI-06) |

### 12.3 Internationalisation

| ID | Requirement |
|---|---|
| I18N-01 | Locales: **English (default)**, **French**, **Kinyarwanda** (`en`, `fr`, `rw`) |
| I18N-02 | URL pattern `/{locale}/…`; English served without prefix (`as-needed`) |
| I18N-03 | First visit: locale negotiated from `Accept-Language`, overridable and remembered (cookie) |
| I18N-04 | Dates, numbers, currencies formatted per locale (`Intl`); prices can show RWF and USD |
| I18N-05 | UI strings in `messages/*.json`; content in the CMS |
| I18N-06 | Launch with full EN; FR and RW for core pages (home, services overview, academy, contact, legal); other pages fall back to EN until Phase 1.5 |
| I18N-07 | Layouts tolerate ~30 % longer strings (French) |

---

## 13. Security, Privacy & Compliance

### 13.1 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | HTTPS everywhere with valid certificates for apex and `www`; HSTS (preload-ready) |
| NFR-SEC-02 | Security headers: nonce-based CSP, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'` (except CMS preview) |
| NFR-SEC-03 | All input validated server-side with Zod; rich text sanitised |
| NFR-SEC-04 | Rate limiting on forms, auth and certificate lookups |
| NFR-SEC-05 | Admin: SSO/MFA, least-privilege roles, 8 h session timeout, lockout after repeated failures |
| NFR-SEC-06 | Uploads: type checked by magic bytes, size limits, antivirus scan, private bucket, short-lived signed URLs |
| NFR-SEC-07 | Secrets only in environment variables / secret manager; `gitleaks` in CI |
| NFR-SEC-08 | No third-party widgets that inject links or ads (see G-3); every third-party script approved and listed in CSP |
| NFR-SEC-09 | Dependency and code scanning (`pnpm audit`, Renovate/Dependabot, CodeQL) |
| NFR-SEC-10 | OWASP Top 10 review before launch; external penetration test before Phase 2 payments |
| NFR-SEC-11 | `/.well-known/security.txt` published |

### 13.2 Privacy — Rwanda Law No. 058/2021 (aligned with GDPR for EU visitors)

| ID | Requirement |
|---|---|
| PRV-01 | UB registers as a data controller with the **NCSA** (OI-08) |
| PRV-02 | Privacy policy states: controller identity, purposes, legal basis, data categories, retention (§11), processors (e.g. Vercel, Resend, Sentry), cross-border transfers and safeguards, data subject rights, privacy contact |
| PRV-03 | Consent captured and stored per form (FR-FORM-04); separate opt-in for marketing |
| PRV-04 | Cookie banner where **Reject all** is as easy as **Accept all**; non-essential scripts blocked until consent; preferences changeable from the footer |
| PRV-05 | Data subject requests (access, correction, deletion, objection) handled within the legal deadline using ADM-09 |
| PRV-06 | Breach runbook: notify NCSA within **48 hours** of becoming aware; notify affected people where required |
| PRV-07 | Data minimisation: only fields in §7.2; date of birth / gender optional unless a sponsor requires them |
| PRV-08 | Applicants under 18 need parent/guardian consent |

### 13.3 Data Residency

Rwandan law requires personal data to be stored in Rwanda **unless** the NCSA authorises cross-border storage. Decision required (OI-08):

| Option | Description | Trade-off |
|---|---|---|
| **A (recommended)** | Frontend on Vercel (global CDN); PostgreSQL and private file storage with a provider in Rwanda — personal data stays in-country | More ops work; strongest compliance position |
| **B** | Everything on an international cloud (e.g. EU region) **after** NCSA cross-border authorisation | Simplest ops; depends on authorisation |

Public, non-personal content may be served globally from the CDN in either option.

### 13.4 Legal Pages

Privacy Policy, Cookie Policy, Terms of Use, Accessibility Statement, Academy Terms (fees, refunds, conduct) — reviewed by a Rwandan legal adviser before launch.

---

## 14. Quality Assurance & Acceptance

### 14.1 Test Strategy

| Level | Tooling | Scope |
|---|---|---|
| Static | TypeScript, ESLint, Prettier | Every commit |
| Unit | Vitest + Testing Library | Utils, schemas, components with logic |
| Integration | Vitest + test DB | Server actions, CMS hooks, revalidation |
| E2E | Playwright (Chromium, WebKit, Firefox; mobile viewports) | Critical journeys (§14.2) |
| Accessibility | axe-core in Playwright + manual screen-reader pass | All templates |
| Performance | Lighthouse CI on preview deployments | Home, service, case study, program, contact |
| Visual regression | Playwright screenshots or Chromatic | Core components and templates |
| Content | Link checker, spell-check (EN/FR), placeholder scan | Each release |
| Security | OWASP ZAP baseline scan, header check | Before launch |

### 14.2 Critical User Journeys (must pass E2E)

1. International visitor → Home → Service → Case study → Contact form → success + emails sent.
2. Visitor → Book a call → slot booked.
3. Student → Academy → Program → Apply → success; admin sees the application.
4. Intern applicant → Internship → Apply with CV → success; file stored privately.
5. Employer → Verify certificate (valid, revoked, not found, rate-limited).
6. Job seeker → Careers → Job → Apply.
7. Editor edits a service page in the CMS → publishes → change visible in < 60 s.
8. Switch to FR/RW on 5 core pages; hreflang correct.
9. Keyboard-only user completes the contact form.
10. Visitor rejects cookies → no analytics requests fired.

### 14.3 Definition of Done (per feature)

- Meets the acceptance criteria in this SRS
- Typed, linted, tested; all CI checks green
- Responsive at listed breakpoints; light and dark themes
- axe reports zero serious/critical issues
- SEO metadata present; content editable in the CMS
- Reviewed by at least one other engineer
- Deployed to preview and approved by the product owner

### 14.4 Launch Acceptance Checklist

- [ ] All **Must** requirements implemented and verified
- [ ] Lighthouse targets met on production (NFR-PERF-02)
- [ ] Zero placeholder content; spell-check passed; all links valid
- [ ] All legacy URLs redirect correctly
- [ ] Forms tested end-to-end in production with real inboxes
- [ ] Privacy policy, cookie banner and NCSA registration complete
- [ ] Backups configured and a restore tested
- [ ] Monitoring and alerting live
- [ ] Search Console verified; sitemap submitted
- [ ] Editors trained (2 sessions) and CMS handbook delivered

---

## 15. Delivery Plan & Milestones

### 15.1 Phases

| Phase | Duration (est.) | Deliverables |
|---|---|---|
| **0. Discovery** | 1 week | Resolve open issues (§16), content inventory, stakeholder interviews, analytics baseline |
| **1. Design** | 2–3 weeks | Tokens, wireframes, high-fidelity Figma designs for all templates (light/dark, mobile/desktop); sign-off |
| **2. Foundation** | 1 week | Repo, CI/CD, Next.js 16 + Tailwind v4 + shadcn/ui + Payload + next-intl scaffolding, tokens, Storybook, environments |
| **3. Core build** | 4–5 weeks | Layout, components, all public templates, CMS collections, forms + emails, admin inbox, SEO |
| **4. Academy & certificates** | 1–2 weeks | Programs, intakes, applications, certificate verification and issuing |
| **5. Content & localisation** | 2 weeks (parallel from Phase 3) | Copywriting, case studies, photography, FR/RW for core pages |
| **6. QA & hardening** | 1–2 weeks | Full test pass, accessibility audit, performance tuning, security review |
| **7. Launch** | 1 week | DNS cutover, redirects, monitoring, Search Console, editor training |
| **8. Post-launch** | Ongoing | Phase 1.5 (remaining translations, applicant status page, search); Phase 2 (payments, AI assistant, client portal) |

**Estimated time to launch: 12–15 weeks.**

### 15.2 Milestones

| M | Milestone | Exit criteria |
|---|---|---|
| M1 | SRS approved | Open issues resolved or accepted as assumptions |
| M2 | Design approved | All templates signed off |
| M3 | Beta on staging | All Must features on staging with real content |
| M4 | Launch | §14.4 checklist complete |
| M5 | 30-day review | Analytics, CWV field data and lead volume reviewed; backlog reprioritised |

### 15.3 Change Control

Scope changes are requested in writing, estimated (effort, timeline, cost), and approved by the Managing Director before work starts. This SRS is versioned in Git (`docs/SRS.md`); each approved change bumps the version and adds a row to §17.4.

---

## 16. Open Issues & Assumptions

### 16.1 Open Issues (decisions needed from UB)

| ID | Issue | Why it matters | Owner |
|---|---|---|---|
| OI-01 | Final primary tagline — several are in use across assets | Consistent messaging | MD + Marketing |
| OI-02 | **Stats conflict**: current site says 274 clients / 421 projects / 18 staff; website concept says 50+ projects / 30+ clients / 5+ years / 99 % satisfaction. Which figures are accurate and verifiable? | International buyers check claims; inconsistent numbers hurt trust | MD |
| OI-03 | **Domains & email**: live site is `universalbridge.rw`; business-card mockups show `universalbridge.co.rw` / `info@universalbridge.co.rw`; academy posters show `universalbridge.academy`. Confirm owned domains; set up company-domain email | Contact details must be correct and consistent | MD + CTO |
| OI-04 | Academy as a section (`/academy`) or a separate site on `universalbridge.academy`? | Architecture and SEO | MD |
| OI-05 | Which products are real and public? Nyambika Design is live; ChatBridge AI, VisionBridge, InsightBridge, PredictBridge, BridgeMart and the **UB Smart** phone appear only in concept art | Showing concepts as shipped products would mislead clients | Product Manager |
| OI-06 | Many supplied images are AI-generated renders (offices, HQ building, vehicle fleet, academy campus). Use real photos of real offices and people, or clearly label renders as concepts/vision | Credibility; avoid misrepresenting facilities | Marketing |
| OI-07 | Master logo files (SVG/AI), exact brand colours, any licensed brand font | Accurate tokens | Marketing |
| OI-08 | NCSA data-controller registration status; hosting option A or B (§13.3) | Legal compliance | MD + CTO |
| OI-09 | RDB company registration number and TIN for footer/legal pages | Trust and legal | MD |
| OI-10 | Keep agent commission tiers (10/35/75 %) publicly visible? | Commercial terms | MD |
| OI-11 | **Leadership names conflict**: mockups show "Alex Ngarambe — CTO" and "John Karangwa — Managing Director"; current site lists Joseph Shyirambere (CTO) and Emmanuel Niyongabo (MD). Confirm current leadership | Accurate leadership page | MD |
| OI-12 | Mockup phone `+250 788 123 456` looks like a placeholder; confirm official numbers and which is the WhatsApp line | Contact accuracy | MD |
| OI-13 | Past clients/projects that may be named publicly (with permission) | Case studies and logo cloud | Sales |
| OI-14 | Budget for paid services (Vercel Pro, hosting, email, Cal.com, in-country DB) | Stack choices | MD |

### 16.2 Assumptions

- A-1 UB returns copy approvals within 3 business days per round.
- A-2 UB staff are available for a photo shoot during Phase 1.
- A-3 One Content Editor and one Academy Admin are named for training.
- A-4 French and Kinyarwanda translations are provided or approved by UB native speakers.
- A-5 Nyambika Design stays a separate application; the website links to it.
- A-6 Next.js 16.x is the current stable major at build start; minor upgrades are applied during the project.

---

## 17. Appendices

### 17.1 Traceability (Objectives → Requirements)

| Objective | Key requirements |
|---|---|
| BO-1 Leads | FR-HOME-01/13, FR-SRV-*, FR-WORK-*, FR-CON-*, FR-BOOK-01, project inquiry form, INT-05/06, SEO-* |
| BO-2 Credibility | FR-WORK-*, FR-HOME-02/07, FR-TEAM-01, NFR-PERF-*, NFR-A11Y-*, CNT-*, OI-02/05/06 |
| BO-3 Academy | FR-ACA-*, Academy/Internship forms, FR-CERT-* |
| BO-4 Talent | FR-CAR-*, JobPosting schema |
| BO-5 Products | FR-PRD-*, FR-LAB-* |
| BO-6 Admin efficiency | ADM-*, CMS-*, INT-01/06 |

### 17.2 Supplied Brand Asset Inventory

| Asset | Use on website |
|---|---|
| Monogram on blue / on white | Favicon, loader, social avatar |
| Horizontal logo — white on blue, blue on white, blue on black | Header, footer, OG images |
| Office signage renders (blue glow, warm backlit, lobby, white reception) | Backgrounds — concept only until real photos exist (OI-06) |
| Staff in branded tees (blue, white, orange) | Careers/about — replace with real staff photos |
| Coding Hub, AI Innovations Hub, Embedded Systems Hub interiors | Labs pages — concept only until real photos exist |
| Academy interior and posters | Academy landing (messaging and learning areas) |
| Hackathon 2024 scene | Events page reference |
| Internship certificate | Template for certificate PDF and verification (FR-CERT-04) |
| Business cards (2 designs) | Contact details reference (OI-03, OI-12) |
| Website hero concept | Home layout reference (FR-HOME-01…04) |
| HQ building and vehicle fleet renders | Not shown as current facilities (OI-06) |
| UB Smart phone poster | Not published until product confirmed (OI-05) |

### 17.3 Home Page Wireframe (desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [UB | Universal Bridge Ltd]  Services▾ Solutions▾ Work Academy▾ Company▾ │
│                                           Insights  EN▾ ◐  [Let's talk →]│
├──────────────────────────────────────────────────────────────────────────┤
│ IDEAS → CODE → IMPACT                          ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲   │
│ Building Digital                              ╱   team photo, diagonal   │
│ Solutions for a                              ╱    mask + circuit lines   │
│ Better Tomorrow  (orange)                    ▕                           │
│ Lead paragraph…                               ╲  "Technology connecting  │
│ [Start a project →] [View our work]            ╲  people & opportunities"│
├──────────────────────────────────────────────────────────────────────────┤
│  logo  logo  logo  logo  logo  logo  logo  (marquee)                     │
├──────────────────────────────────────────────────────────────────────────┤
│ </> Custom SW │ Web & Mobile │ Cloud │ AI & Data │ IoT │ IT Consulting    │
├──────────────────────────────────────────────────────────────────────────┤
│ WHY CHOOSE US            │  ##+ Projects │ ##+ Clients │ #+ Yrs │ ##      │
├──────────────────────────────────────────────────────────────────────────┤
│ Featured work:  [Case 1]  [Case 2]  [Case 3]                             │
├────────────────────── dark navy + glow ──────────────────────────────────┤
│ Our Labs: Coding Hub · AI Innovations Hub · Embedded Systems Hub         │
├──────────────────────────────────────────────────────────────────────────┤
│ How we work: Discover → Design → Develop → Deliver → Support             │
├──────────────────────────────────────────────────────────────────────────┤
│ Testimonials slider   │   Products: Nyambika Design …                    │
├──────────────────────────────────────────────────────────────────────────┤
│ UB Academy — Learn. Innovate. Lead.  Next intake: … [Apply →]            │
├──────────────────────────────────────────────────────────────────────────┤
│ Insights: [Post] [Post] [Post]                                           │
├────────────────────────────── blue band ─────────────────────────────────┤
│ Let's build something great together.          [Book a call →]           │
├──────────────────────────────────────────────────────────────────────────┤
│ Footer: Services │ Company │ Academy │ Contact │ Newsletter │ Social     │
└──────────────────────────────────────────────────────────────────────────┘
```

### 17.4 Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-10-08 | Senior Full-Stack Engineer | Initial draft from brand assets, review of the current website, and market research |
