import { ArrowUpRight, BadgeCheck, Globe, Languages, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircuitArt } from "@/components/brand/CircuitArt";
import { KubikaLogo } from "@/components/brand/KubikaLogo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DetailCta } from "@/components/patterns/DetailCta";
import { InnerSection, StepTrack } from "@/components/patterns/Inner";
import { buttonVariants } from "@/components/ui/button-variants";
import { FeatureBento, type FeatureKey } from "@/features/kubika/FeatureBento";
import { PasteLauncher } from "@/features/kubika/PasteLauncher";
import { PhoneShowcase } from "@/features/kubika/PhoneShowcase";
import {
  KUBIKA_URL,
  PLATFORM_NAME,
  PLATFORM_TINT,
  PLATFORMS,
  PlatformGlyph,
  type PlatformKey,
} from "@/features/kubika/platforms";
import { localizePath, type Locale } from "@/i18n/routing";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

const PATH = "/kubika";
const FEATURES: FeatureKey[] = ["formats", "carousels", "batch", "extension", "library", "privacy"];
/** What each platform's posts can be saved as (Kubika packages/platforms.json). */
const SAVES: Record<PlatformKey, string[]> = {
  youtube: ["videos", "shorts", "audio"],
  tiktok: ["videos", "photoPosts", "audio"],
  instagram: ["reels", "photos", "carousels"],
  x: ["videos", "photos", "gifs"],
  facebook: ["videos", "reels", "photos"],
  linkedin: ["videos", "photos", "files"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kubika" });
  return pageMetadata({
    locale,
    path: PATH,
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// Kubika: product page. The app itself lives at kubika.universalbridge.rw; every
// call to action, the paste box included, opens it.
export default async function KubikaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "kubika" });
  const open = (path = "") => `${KUBIKA_URL}${path}`;

  return (
    <>
      <section data-hero="night" className="night relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 right-[-15%] size-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.35),transparent)]" />
          <div className="absolute -bottom-64 left-[-10%] size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(14_165_233/0.16),transparent)]" />
          <CircuitArt className="absolute inset-0 h-full w-full opacity-40 [mask-image:linear-gradient(90deg,transparent_45%,#000_85%)]" />
        </div>
        <div className="container-page pt-8 pb-16 lg:pb-24">
          <Breadcrumbs locale={locale} items={[{ label: t("crumb"), href: PATH }]} />
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:mt-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-14">
            <div>
              <p className="inner-rise eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
                {t("eyebrow")}
              </p>
              <h1 className="mt-5">
                <span
                  className="inner-rise flex items-center gap-3"
                  style={{ "--i": 1 } as React.CSSProperties}
                >
                  <KubikaLogo
                    title={null}
                    className="size-11 drop-shadow-[0_10px_24px_rgb(37_99_235/0.45)] sm:size-12"
                  />
                  <span className="font-display text-heading-lg">{t("title")}</span>
                </span>
                <span
                  className="inner-rise mt-5 block text-display-xl text-balance"
                  style={{ "--i": 2 } as React.CSSProperties}
                >
                  {t.rich("tagline", {
                    hl: (chunks) => <span className="kb-gradient-text">{chunks}</span>,
                  })}
                </span>
              </h1>
              <p
                className="inner-rise mt-6 max-w-xl text-body-lg text-fg-secondary"
                style={{ "--i": 3 } as React.CSSProperties}
              >
                {t("lead")}
              </p>
              <div className="inner-rise" style={{ "--i": 4 } as React.CSSProperties}>
                <PasteLauncher
                  copy={{
                    label: t("paste.label"),
                    placeholder: t("paste.placeholder"),
                    paste: t("paste.paste"),
                    submit: t("paste.submit"),
                    unsupported: t("paste.unsupported"),
                  }}
                />
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 pl-1 text-body-sm">
                  <span className="flex items-center gap-1.5" aria-label={t("platformsLabel")}>
                    {PLATFORMS.map((p) => (
                      <span
                        key={p}
                        title={PLATFORM_NAME[p]}
                        className={cn(
                          "grid size-7 place-items-center rounded-full border border-subtle bg-surface",
                          PLATFORM_TINT[p],
                        )}
                      >
                        <PlatformGlyph platform={p} className="size-3.5" />
                      </span>
                    ))}
                  </span>
                  <a
                    href={open()}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    {t("openApp")} <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                </div>
              </div>
              <ul
                className="inner-rise mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-subtle pt-6 text-body-sm text-fg-secondary"
                style={{ "--i": 5 } as React.CSSProperties}
              >
                {(
                  [
                    [BadgeCheck, t("facts.free")],
                    [Globe, t("facts.anywhere")],
                    [Languages, t("facts.languages")],
                  ] as const
                ).map(([Icon, label]) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon aria-hidden className="size-4 text-accent" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <PhoneShowcase locale={locale} />
          </div>
        </div>
      </section>

      <InnerSection
        eyebrow={t("platforms.eyebrow")}
        title={t("platforms.title")}
        lead={t("platforms.lead")}
      >
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {PLATFORMS.map((p, i) => (
            <li
              key={p}
              className="reveal group relative overflow-hidden rounded-2xl border border-subtle bg-surface p-5 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,#2563eb_45%,var(--border-subtle))] hover:shadow-3"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span
                className={cn(
                  "kb-tile grid size-12 place-items-center rounded-2xl border border-subtle bg-sunken transition-transform duration-300 ease-emphasized group-hover:scale-110 group-hover:-rotate-6",
                  PLATFORM_TINT[p],
                )}
              >
                <PlatformGlyph platform={p} className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-[1.1rem] font-semibold text-fg">
                {PLATFORM_NAME[p]}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {SAVES[p].map((s) => (
                  <li
                    key={s}
                    className="rounded-full bg-sunken px-2 py-0.5 text-[0.72rem] font-medium text-fg-secondary"
                  >
                    {t(`platforms.saves.${s}`)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </InnerSection>

      <InnerSection
        sunken
        eyebrow={t("features.eyebrow")}
        title={t("features.title")}
        lead={t("features.lead")}
      >
        <FeatureBento
          items={
            Object.fromEntries(
              FEATURES.map((key) => [
                key,
                {
                  title: t(`features.items.${key}.title`),
                  body: t(`features.items.${key}.body`),
                },
              ]),
            ) as Record<FeatureKey, { title: string; body: string }>
          }
          labels={{
            zip: t("bento.zip", { count: 5 }),
            links: t("bento.links", { count: 4 }),
            download: t("showcase.download"),
            search: t("bento.search"),
            noAds: t("showcase.noAds"),
            noTrackers: t("showcase.noTrackers"),
            noPasswords: t("bento.noPasswords"),
            deleted: t("showcase.deleted"),
          }}
        />
      </InnerSection>

      <div id="how" className="scroll-mt-24">
        <InnerSection eyebrow={t("how.eyebrow")} title={t("how.title")} lead={t("how.lead")}>
          <StepTrack
            steps={(["s1", "s2", "s3"] as const).map((s) => ({
              id: s,
              title: t(`how.${s}.title`),
              body: t(`how.${s}.body`),
            }))}
            stepLabel={(n) => t("how.step", { n })}
          />
        </InnerSection>
      </div>

      <section className="section pt-0">
        <div className="container-page">
          <div className="reveal night relative isolate overflow-hidden rounded-3xl border border-subtle px-6 py-10 sm:px-10 lg:py-14">
            <div
              aria-hidden
              className="absolute -top-32 -right-24 -z-10 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.4),transparent)]"
            />
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <div className="flex gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklab,#16a34a_18%,transparent)] text-success">
                  <ShieldCheck aria-hidden className="size-7" />
                </span>
                <div>
                  <h2 className="font-display text-heading-md text-fg">{t("rights.title")}</h2>
                  <p className="mt-3 max-w-2xl text-body-md text-fg-secondary">
                    {t("rights.body")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a
                  href={open()}
                  target="_blank"
                  rel="noopener"
                  className={cn(buttonVariants({ size: "lg" }), "vz-cta")}
                >
                  {t("rights.open")} <ArrowUpRight aria-hidden />
                </a>
                <a
                  href={open("/legal/aup")}
                  target="_blank"
                  rel="noopener"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  {t("rights.policy")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DetailCta
        locale={locale}
        eyebrow={t("cta.eyebrow")}
        title={t("cta.title")}
        lead={t("cta.lead")}
        primary={{ label: t("cta.primary"), href: "/contact" }}
        secondary={{ label: t("cta.secondary"), href: "/book" }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Kubika",
          description: t("metaDescription"),
          url: KUBIKA_URL,
          mainEntityOfPage: siteUrl(localizePath(PATH, locale)),
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "RWF" },
          publisher: { "@id": siteUrl("/#organization") },
        }}
      />
    </>
  );
}
