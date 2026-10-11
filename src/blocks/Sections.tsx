import { ArrowRight, CalendarDays, MessagesSquare, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { clientLabel, CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { PostCard } from "@/components/cards/PostCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Marquee } from "@/components/patterns/Marquee";
import { Accordion } from "@/components/ui/Accordion";
import { AccentText } from "@/components/ui/AccentText";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { localizePath } from "@/i18n/routing";
import {
  getApprovedTestimonials,
  getCaseStudies,
  getPosts,
  getIndustries,
  getProducts,
  getServices,
  getVisibleClients,
} from "@/lib/cms/content";
import { mediaSrc } from "@/lib/cms/media-src";
import { child, editable } from "@/lib/live-edit/attrs";
import { cn } from "@/lib/utils";
import type { Faq, Industry } from "@/payload-types";
import { PillarFilter } from "./PillarFilter";
import { StoryPin } from "@/components/motion/StoryPin";
import { CodeVisual, IdeasVisual, ImpactVisual } from "./StoryVisuals";
import { Section } from "./Section";
import { ServicePairs } from "./ServicePairs";
import { ProductSpotlight } from "./ProductSpotlight";
import { RAIL, RAIL_ITEM } from "@/lib/grid";
import type { BlockProps } from "./types";
import { buttonVariants } from "@/components/ui/button-variants";

const href = (path: string | null | undefined, locale: BlockProps<"hero">["locale"]) =>
  path ? localizePath(path, locale) : undefined;

// FR-HOME-02 — hidden until clients give permission (OI-13).
export async function LogoCloudBlock({ block, locale, edit }: BlockProps<"logoCloud">) {
  const clients = (await getVisibleClients(locale)).filter(
    (c) => c.logo && typeof c.logo === "object",
  );
  if (!clients.length) return null;
  return (
    <section className="border-y border-subtle py-10">
      <div className="container-page">
        {block.title && (
          <p
            className="mb-6 text-center text-body-sm text-fg-secondary"
            {...editable(edit, "title", "text", block.title)}
          >
            {block.title}
          </p>
        )}
        <Marquee
          label={block.title ?? "Clients"}
          items={clients.map((c) => ({
            key: String(c.id),
            node: (
              <span className="block h-10 w-32 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
                {typeof c.logo === "object" && c.logo?.url && (
                  <Image
                    src={mediaSrc(c.logo.url)}
                    alt={c.name}
                    width={128}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                )}
              </span>
            ),
          }))}
        />
      </div>
    </section>
  );
}

// FR-HOME-03 / FR-SRV-01
export async function ServicesGridBlock({ block, locale, edit }: BlockProps<"servicesGrid">) {
  const [services, t, c] = await Promise.all([
    getServices(locale),
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  if (!services.length) return null;
  // Home: a pillar carousel, services in pairs (one slide per pillar). The Services overview (showFilter) keeps the filterable card grid.
  const explorer = <ServicePairs services={services} locale={locale} />;
  // Overview (with filter): a grid at every size. Elsewhere, phones get a swipeable
  // rail instead of eight stacked cards (UI/UX audit P2-3).
  const rail = !block.showFilter;
  const bento = !block.showFilter && services.length === 8;
  const grid = (
    <ul
      className={cn("mt-14 gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4", rail ? RAIL : "grid")}
      data-filter-target
    >
      {services.map((s, i) => (
        <li
          key={s.id}
          data-pillar={s.pillar}
          className={cn(
            "reveal",
            rail && RAIL_ITEM,
            // Bento on desktop: 2×2 feature + wide tile + six singles = a full 4×3 grid.
            bento && i === 0 && "lg:col-span-2 lg:row-span-2",
            bento && i === 1 && "lg:col-span-2",
          )}
        >
          <ServiceCard
            variant={bento && i === 0 ? "feature" : bento && i === 1 ? "wide" : "default"}
            index={i + 1}
            title={s.title}
            summary={s.summary}
            icon={s.icon}
            href={localizePath(`/services/${s.slug}`, locale)}
            cta={c("explore")}
          />
        </li>
      ))}
    </ul>
  );
  const ask = await getTranslations({ locale, namespace: "servicesCta" });
  // Turn interest into a request: one fully clickable card under the grid. The
  // action is the site's one primary colour (spark); booking a call is the quieter
  // second option beside it, not a caption under it.
  const request = (
    <div className="mt-12 flex flex-col items-center gap-5">
      {/* Animated gradient ring: draws the eye without shouting. */}
      <div className="cta-ring w-full max-w-3xl rounded-[calc(var(--radius-3xl)+1px)] p-px sm:rounded-full">
        <a
          href={localizePath("/contact?topic=sales", locale)}
          className="cta-pill group relative isolate flex w-full max-w-3xl items-center gap-4 overflow-hidden rounded-3xl border border-transparent bg-[linear-gradient(110deg,var(--bg-surface)_55%,color-mix(in_oklab,var(--accent-spark)_7%,var(--bg-surface)))] p-3 pl-4 shadow-2 transition-[border-color,box-shadow,translate] duration-300 ease-standard hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:rounded-full sm:py-2.5 sm:pr-2.5 sm:pl-3"
        >
          <span
            aria-hidden
            className="cta-pill__shine pointer-events-none absolute inset-y-0 -left-1/3 -z-10 w-1/3"
          />
          <span
            aria-hidden
            className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-hover:-rotate-6 sm:flex"
          >
            <MessagesSquare className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-semibold text-balance text-fg sm:truncate sm:text-body-lg">
              {ask("title")}
            </span>
            <span className="mt-1 flex items-center gap-2 text-body-sm text-fg-secondary">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              <span className="truncate">{ask("body")}</span>
            </span>
          </span>
          {/* Desktop: the action written out on a spark button. Phones: the arrow alone. */}
          <span
            className={cn(
              buttonVariants({ size: "lg" }),
              "hidden group-hover:bg-spark-hover group-hover:shadow-2 sm:inline-flex",
            )}
          >
            {ask("start")}
            <ArrowRight
              aria-hidden
              className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-spark text-on-spark shadow-1 sm:hidden"
          >
            <ArrowRight className="size-5" />
          </span>
          <span className="sr-only sm:hidden">{ask("start")}</span>
        </a>
      </div>
      {/* One-tap starting points: each opens the form with that service ticked. */}
      <nav
        aria-label={ask("picks")}
        className="flex max-w-3xl flex-wrap items-center justify-center gap-2"
      >
        {(
          [
            ["pickApp", "web-mobile", "smartphone"],
            ["pickAi", "ai-data", "brain"],
            ["pickCloud", "cloud-devops", "cloud"],
            ["pickIot", "embedded-iot", "cpu"],
            ["pickIt", "managed-it", "life-buoy"],
          ] as const
        ).map(([key, slug, icon], i) => (
          <a
            key={slug}
            href={localizePath(`/contact?topic=sales&service=${slug}`, locale)}
            className="cta-chip group/chip inline-flex min-h-10 items-center gap-2 rounded-md border border-subtle bg-surface px-3.5 text-body-sm text-fg-secondary transition-[border-color,color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-fg hover:shadow-2"
            style={{ "--i": i } as React.CSSProperties}
          >
            <Icon
              name={icon}
              className="size-4 text-accent transition-transform duration-300 group-hover/chip:scale-110"
            />
            {ask(key)}
          </a>
        ))}
        <a
          href={localizePath("/book", locale)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-accent")}
        >
          <CalendarDays aria-hidden className="size-4" />
          {ask("book")}
        </a>
      </nav>
    </div>
  );
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      {block.showFilter ? (
        <PillarFilter
          label={t("pillars.all")}
          options={(["engineering", "technology", "innovation", "consulting"] as const).map(
            (p) => ({ value: p, label: t(`pillars.${p}`) }),
          )}
        >
          {grid}
        </PillarFilter>
      ) : (
        explorer
      )}
      {request}
    </Section>
  );
}

// Solutions overview grid
export async function IndustriesGridBlock({ block, locale, edit }: BlockProps<"industriesGrid">) {
  const [industries, c] = await Promise.all([
    getIndustries(locale),
    getTranslations({ locale, namespace: "common" }),
  ]);
  if (!industries.length) return null;
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((i: Industry) => (
          <li key={i.id}>
            <ServiceCard
              title={i.title}
              summary={i.summary}
              icon={i.icon}
              href={localizePath(`/solutions/${i.slug}`, locale)}
              cta={c("learnMore")}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// FR-HOME-04 + IX-01: verified, dated numbers only; hidden when none.
// FR-HOME-05: featured case studies; hidden until published (OI-13).
export async function FeaturedWorkBlock({ block, locale, edit }: BlockProps<"featuredWork">) {
  const [all, t] = await Promise.all([
    getCaseStudies(locale),
    getTranslations({ locale, namespace: "templates" }),
  ]);
  const items = (all.filter((c) => c.featured).length ? all.filter((c) => c.featured) : all).slice(
    0,
    3,
  );
  if (!items.length) return null;
  return (
    <Section id={block.anchor}>
      <SectionHeader
        eyebrow={block.eyebrow}
        edit={edit}
        title={block.title}
        lead={block.lead}
        action={
          <Button asChild variant="secondary">
            <a href={localizePath("/work", locale)}>{t("home.allWork")}</a>
          </Button>
        }
      />
      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {items.map((cs) => (
          <li key={cs.id}>
            <CaseStudyCard
              cs={cs}
              href={localizePath(`/work/${cs.slug}`, locale)}
              industry={typeof cs.industry === "object" ? cs.industry?.title : undefined}
            />
          </li>
        ))}
      </ul>
      <p className="sr-only">{items.map(clientLabel).join(", ")}</p>
    </Section>
  );
}

// FR-HOME-11: three newest posts, linking to the Insights hub.
export async function LatestPostsBlock({ block, locale, edit }: BlockProps<"latestPosts">) {
  const [posts, t] = await Promise.all([
    getPosts(locale),
    getTranslations({ locale, namespace: "s5.insights" }),
  ]);
  const items = posts.slice(0, 3);
  if (!items.length) return null;
  return (
    <Section id={block.anchor}>
      <SectionHeader
        eyebrow={block.eyebrow}
        edit={edit}
        title={block.title ?? t("latest")}
        lead={block.lead}
        action={
          <Button asChild variant="secondary">
            <a href={localizePath("/insights", locale)}>{t("allInsights")}</a>
          </Button>
        }
      />
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.id}>
            <PostCard post={p} locale={locale} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// FR-HOME-09 / FR-PRD-01
export async function ProductsShowcaseBlock({
  block,
  locale,
  edit,
}: BlockProps<"productsShowcase">) {
  const [products, t] = await Promise.all([
    getProducts(locale),
    getTranslations({ locale, namespace: "templates" }),
  ]);
  if (!products.length) return null;
  if (products.length === 1) {
    const p = products[0]!;
    return (
      <Section id={block.anchor} night>
        <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
        <ProductSpotlight
          product={p}
          locale={locale}
          statusLabel={t(`product.status.${p.status}`)}
        />
      </Section>
    );
  }
  return (
    <Section id={block.anchor} night>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard
              product={p}
              href={localizePath(`/products/${p.slug}`, locale)}
              statusLabel={t(`product.status.${p.status}`)}
              cta={t("home.productsCta")}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// FR-HOME-07: approved quotes only; the whole section disappears without them.
export async function TestimonialsBlock({ block, locale, edit }: BlockProps<"testimonials">) {
  const quotes = await getApprovedTestimonials(locale);
  if (!quotes.length) return null;
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ul className="mt-12 grid gap-6 lg:grid-cols-2">
        {quotes.slice(0, 4).map((q) => (
          <li key={q.id}>
            <figure className="h-full rounded-xl border border-subtle bg-surface p-8 shadow-1">
              <Quote aria-hidden className="size-8 text-spark" />
              <blockquote className="mt-4 font-display text-heading-md leading-snug">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-6 text-fg-secondary">
                <strong className="text-fg">{q.personName}</strong>
                {q.role ? `, ${q.role}` : ""}
                {q.company ? ` · ${q.company}` : ""}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// FR-HOME-08: Discover → Design → Develop → Deliver → Support (trace + nodes)
export function ProcessBlock({ block, edit }: BlockProps<"process">) {
  const steps = block.steps ?? [];
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ol className="relative mt-14 grid gap-8 md:grid-cols-5 md:gap-4">
        <span
          aria-hidden
          className="absolute top-5 right-0 left-0 hidden h-px bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-spark))] md:block"
        />
        {steps.map((s, i) => (
          <li key={s.id ?? i} className="relative flex gap-4 md:block">
            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas font-mono text-body-sm font-medium text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="md:mt-5">
              <h3
                className="font-display text-heading-md"
                {...editable(child(edit, "steps", s.id), "title", "text", s.title)}
              >
                {s.title}
              </h3>
              {s.body && (
                <p
                  className="mt-2 text-fg-secondary"
                  {...editable(child(edit, "steps", s.id), "body", "textarea", s.body)}
                >
                  {s.body}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// FR-HOME-06: Labs on Night with one glow.
// FR-HOME-12 Kigali → World (UI/UX §10.5): globe on capable devices, list for everyone.
// Suspension-bridge line art for the CTA band: a cable arc over a deck with
// hangers, computed once (quadratic arc, viewBox 1200 × 220).
const BRIDGE = (() => {
  const [x0, y0, cx, cy, x1, y1] = [70, 200, 600, 20, 1130, 200];
  const at = (t: number) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
  });
  const hangers = Array.from({ length: 19 }, (_, i) => at(0.05 + i * 0.05));
  return { arc: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, hangers, deck: 200 };
})();

function BridgeArt() {
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax meet"
      className="cta-bridge absolute bottom-0 left-1/2 h-auto w-[220%] -translate-x-1/2 sm:w-[140%] lg:w-full"
    >
      <defs>
        <linearGradient id="cta-bridge-fade" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.2" stopColor="currentColor" />
          <stop offset="0.8" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="cta-bridge__hangers">
        {BRIDGE.hangers.map((h, i) => (
          <line
            key={i}
            x1={h.x}
            y1={h.y}
            x2={h.x}
            y2={BRIDGE.deck}
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </g>
      <line
        x1="0"
        y1={BRIDGE.deck}
        x2="1200"
        y2={BRIDGE.deck}
        stroke="url(#cta-bridge-fade)"
        className="cta-bridge__deck"
      />
      <path d={BRIDGE.arc} pathLength={1} className="cta-bridge__arc" />
      <path d={BRIDGE.arc} pathLength={100} className="cta-bridge__pulse" />
      {[70, 1130].map((x) => (
        <circle key={x} cx={x} cy={BRIDGE.deck} r="7" className="cta-bridge__node" />
      ))}
    </svg>
  );
}

// FR-HOME-13 final CTA band: a floating card (no hard junction with the footer).
// Bridge line art, drifting glows, a sweeping border light and a pointer
// spotlight (lib/fx/spotlight). Motion is decorative and stops for reduced motion.
export function CtaBandBlock({ block, locale, edit }: BlockProps<"ctaBand">) {
  return (
    <section id={block.anchor ?? undefined} className="section">
      <div className="container-page">
        <div
          data-fx="spotlight"
          className="cta-band group/cta relative rounded-[2rem] p-px shadow-3"
        >
          <div className="cta-band__inner relative isolate overflow-hidden rounded-[calc(2rem-1px)] px-6 pt-14 pb-28 text-center sm:px-12 sm:pt-20 sm:pb-36 lg:pb-40">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="cta-band__grid absolute inset-0" />
              <div className="cta-band__glow cta-band__glow--a" />
              <div className="cta-band__glow cta-band__glow--b" />
              <div className="cta-band__spot absolute inset-0" />
              <BridgeArt />
            </div>
            {block.eyebrow && (
              <p className="cta-band__pill eyebrow inline-flex items-center gap-2.5 rounded-full border border-subtle py-1.5 pr-3.5 pl-3">
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-spark opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-spark" />
                </span>
                <span {...editable(edit, "eyebrow", "text", block.eyebrow)}>{block.eyebrow}</span>
              </p>
            )}
            <h2
              className="cta-band__title mx-auto mt-6 max-w-4xl text-display-xl"
              {...editable(edit, "title", "accent", block.title)}
            >
              <AccentText text={block.title} />
            </h2>
            {block.lead && (
              <p
                className="mx-auto mt-5 max-w-2xl text-body-lg text-fg-secondary"
                {...editable(edit, "lead", "textarea", block.lead)}
              >
                {block.lead}
              </p>
            )}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {block.primary?.label && (
                <Button
                  asChild
                  size="lg"
                  variant="spark"
                  className="rounded-full shadow-[0_8px_24px_-8px_var(--accent-spark)]"
                >
                  <a href={href(block.primary.href, locale)}>
                    <span {...editable(edit, "primary.label", "text", block.primary.label)}>
                      {block.primary.label}
                    </span>{" "}
                    <ArrowRight aria-hidden data-arrow />
                  </a>
                </Button>
              )}
              {block.secondary?.label && (
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="cta-band__ghost rounded-full"
                >
                  <a href={href(block.secondary.href, locale)}>
                    <CalendarDays aria-hidden className="size-4" />
                    <span {...editable(edit, "secondary.label", "text", block.secondary.label)}>
                      {block.secondary.label}
                    </span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CardsGridBlock({ block, locale, edit }: BlockProps<"cardsGrid">) {
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(block.cards ?? []).map((c, i) => (
          <li key={c.id ?? i} className="rounded-xl border border-subtle bg-surface p-6 shadow-1">
            {c.icon && (
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent [&_svg]:size-5">
                <Icon name={c.icon} />
              </span>
            )}
            <h3 className="mt-5 font-display text-heading-md">
              <span {...editable(child(edit, "cards", c.id), "title", "text", c.title)}>
                {c.href ? <a href={href(c.href, locale)}>{c.title}</a> : c.title}
              </span>
            </h3>
            {c.body && (
              <p
                className="mt-2 text-fg-secondary"
                {...editable(child(edit, "cards", c.id), "body", "textarea", c.body)}
              >
                {c.body}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function MediaTextBlock({ block, locale, edit }: BlockProps<"mediaText">) {
  return (
    <Section id={block.anchor}>
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2",
          block.reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <Media
          media={block.media}
          editAttrs={editable(
            edit,
            "media",
            "image",
            typeof block.media === "object" ? block.media?.id : block.media,
          )}
          sizes="(min-width:1024px) 50vw, 100vw"
          className="bridge-mask aspect-[4/3] rounded-xl"
        />
        <div>
          <SectionHeader
            eyebrow={block.eyebrow}
            title={block.title}
            lead={block.lead}
            edit={edit}
          />
          {block.cta?.label && (
            <Button asChild className="mt-8">
              <a href={href(block.cta.href, locale)}>
                <span {...editable(edit, "cta.label", "text", block.cta.label)}>
                  {block.cta.label}
                </span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}

export function TimelineBlock({ block, edit }: BlockProps<"timeline">) {
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <ol className="mt-12 space-y-8 border-l border-strong pl-8">
        {(block.items ?? []).map((item, i) => (
          <li key={item.id ?? i} className="relative">
            <span
              aria-hidden
              className="absolute top-1.5 -left-[39px] size-3.5 rounded-full border-2 border-accent bg-canvas"
            />
            <p
              className="font-mono text-body-sm text-spark-text"
              {...editable(child(edit, "items", item.id), "year", "text", item.year)}
            >
              {item.year}
            </p>
            <h3
              className="mt-1 font-display text-heading-md"
              {...editable(child(edit, "items", item.id), "title", "text", item.title)}
            >
              {item.title}
            </h3>
            {item.body && (
              <p
                className="mt-1 text-fg-secondary"
                {...editable(child(edit, "items", item.id), "body", "textarea", item.body)}
              >
                {item.body}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function FaqBlock({ block, edit }: BlockProps<"faq">) {
  const faqs = (block.faqs ?? []).filter((f): f is Faq => typeof f === "object");
  if (!faqs.length) return null;
  return (
    <Section id={block.anchor}>
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
        <Accordion
          items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
        />
      </div>
    </Section>
  );
}

// Rich text is edited in the admin (formatting, links, headings), not on the page.
export function RichTextBlock({ block }: BlockProps<"richText">) {
  return (
    <section className="section">
      <div className="container-reading">
        <RichText data={block.content} />
      </div>
    </section>
  );
}

// UI/UX §10.3 Ideas → Code → Impact.
export function StoryBlock({ block, edit }: BlockProps<"story">) {
  const steps = block.steps ?? [];
  if (steps.length < 3) return null;
  const visuals = [
    <IdeasVisual key="i" />,
    <CodeVisual key="c" />,
    <ImpactVisual key="m" metric={steps[2]?.metric} />,
  ];
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <div className="mt-16 lg:mt-8">
        <StoryPin
          steps={steps.map((st, i) => ({
            id: st.id ?? String(i),
            eyebrow: st.eyebrow,
            title: st.title,
            body: st.body,
            visual: visuals[i],
          }))}
        />
      </div>
    </Section>
  );
}
