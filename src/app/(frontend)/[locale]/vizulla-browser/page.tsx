import { Download, KeyRound, Languages, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircuitArt } from "@/components/brand/CircuitArt";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { DetailCta } from "@/components/patterns/DetailCta";
import { FactChips, InnerSection, StepTrack } from "@/components/patterns/Inner";
import { buttonVariants } from "@/components/ui/button-variants";
import { BrowserShowcase } from "@/features/vizulla/BrowserShowcase";
import { DownloadPanel, type DownloadCopy } from "@/features/vizulla/DownloadPanel";
import { InstallGuide } from "@/features/vizulla/InstallGuide";
import { PLATFORMS, type OsFamily, type PlatformId } from "@/features/vizulla/platforms";
import { getVizullaRelease } from "@/features/vizulla/releases";
import { localizePath, type Locale } from "@/i18n/routing";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

const PATH = "/vizulla-browser";
const OS: OsFamily[] = ["mac", "windows", "linux"];
const FEATURES = [
  ["shields", ShieldCheck],
  ["assistant", Sparkles],
  ["tabs", Layers],
  ["passwords", KeyRound],
  ["profiles", Users],
  ["languages", Languages],
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vizulla" });
  return pageMetadata({
    locale,
    path: PATH,
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// The release list is cached for ten minutes (releases.ts); the page follows it.
export const revalidate = 600;

// Vizulla Browser: product page and downloads. The visitor's system is detected in
// the browser (DownloadPanel); every installer stays listed below for everyone else.
export default async function VizullaBrowserPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, release] = await Promise.all([
    getTranslations({ locale, namespace: "vizulla" }),
    getVizullaRelease(),
  ]);
  const megabytes = (bytes: number) =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "megabyte",
      maximumFractionDigits: 0,
    }).format(bytes / 1_000_000);
  const installers = release
    ? PLATFORMS.flatMap((p) => release.installers.filter((i) => i.platform === p))
    : [];
  const href = (p: PlatformId) => `/api/vizulla/download/${p}?locale=${locale}`;

  const copy: DownloadCopy = {
    detecting: t("download.detecting"),
    choose: t("download.choose"),
    recommended: t("download.recommended"),
    others: t("download.others"),
    macIntel: t("download.macIntel"),
    macArm: t("download.macArm"),
    macUnsure: t("download.macUnsure"),
    linuxDeb: t("download.linuxDeb"),
    mobileTitle: t("download.mobileTitle"),
    mobileBody: t("download.mobileBody"),
    copyLink: t("download.copyLink"),
    copied: t("download.copied"),
    unavailableTitle: t("download.unavailableTitle"),
    unavailableBody: t("download.unavailableBody"),
    contact: t("download.contact"),
    started: t("download.started"),
    os: { mac: t("os.mac"), windows: t("os.windows"), linux: t("os.linux") },
    button: {
      mac: t("download.button", { os: t("os.mac") }),
      windows: t("download.button", { os: t("os.windows") }),
      linux: t("download.button", { os: t("os.linux") }),
    },
    platform: Object.fromEntries(PLATFORMS.map((p) => [p, t(`platform.${p}`)])) as Record<
      PlatformId,
      string
    >,
    details: Object.fromEntries(
      installers.map((i) => [
        i.platform,
        t("download.details", { version: release!.version, size: megabytes(i.size) }),
      ]),
    ),
    notice: {
      unavailable: t("download.notice.unavailable"),
      busy: t("download.notice.busy"),
      unknown: t("download.notice.unknown"),
    },
  };

  const steps = (os: OsFamily) =>
    (["s1", "s2", "s3"] as const).map((s) => ({
      id: s,
      title: t(`install.${os}.${s}.title`),
      body: t(`install.${os}.${s}.body`),
    }));

  return (
    <>
      <section data-hero="night" className="night relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 right-[-15%] size-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.35),transparent)]" />
          <div className="absolute -bottom-64 left-[-10%] size-[520px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-spark)_14%,transparent),transparent)]" />
          <CircuitArt className="absolute inset-0 h-full w-full opacity-40 [mask-image:linear-gradient(90deg,transparent_45%,#000_85%)]" />
        </div>
        <div className="container-page pt-8 pb-20 lg:pb-28">
          <Breadcrumbs locale={locale} items={[{ label: t("crumb"), href: PATH }]} />
          <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <div>
              <p className="inner-rise eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
                {t("eyebrow")}
              </p>
              <div
                className="inner-rise mt-5 flex items-center gap-4 sm:gap-5"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                <VizullaLogo title={null} className="size-14 sm:size-[4.5rem]" />
                <h1 className="text-display-xl">{t("title")}</h1>
              </div>
              <p
                className="inner-rise mt-6 max-w-2xl text-body-lg text-fg-secondary"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                {t("lead")}
              </p>
              <div className="inner-rise" style={{ "--i": 3 } as React.CSSProperties}>
                <DownloadPanel
                  locale={locale}
                  available={installers.map((i) => i.platform)}
                  contactHref={localizePath("/contact", locale)}
                  copy={copy}
                />
              </div>
              <FactChips
                facts={[
                  { label: t("facts.free") },
                  { label: t("facts.platforms") },
                  { label: t("facts.languages") },
                ]}
              />
            </div>
            <BrowserShowcase
              labels={{
                blocked: t("showcase.blocked"),
                assistant: t("showcase.assistant"),
                address: t("showcase.address"),
                newTab: t("showcase.newTab"),
              }}
            />
          </div>
        </div>
      </section>

      <InnerSection
        eyebrow={t("features.eyebrow")}
        title={t("features.title")}
        lead={t("features.lead")}
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([key, Icon]) => (
            <li key={key} className="reveal">
              <SpotlightCard className="inner-card group h-full rounded-2xl border border-subtle bg-surface p-6 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,#2563eb_45%,var(--border-subtle))] hover:shadow-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#3b82f6,#1d4ed8)] text-white transition-[rotate] duration-300 group-hover:-rotate-6 [&_svg]:size-5">
                  <Icon aria-hidden strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 font-display text-[1.125rem] leading-snug font-semibold text-fg">
                  {t(`features.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-body-sm text-fg-secondary">
                  {t(`features.items.${key}.body`)}
                </p>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </InnerSection>

      <div id="install" className="scroll-mt-24">
        <InnerSection
          sunken
          eyebrow={t("install.eyebrow")}
          title={t("install.title")}
          lead={t("install.lead")}
        >
          <InstallGuide
            labels={{ mac: t("os.mac"), windows: t("os.windows"), linux: t("os.linux") }}
            panels={
              Object.fromEntries(
                OS.map((os) => [
                  os,
                  <StepTrack
                    key={os}
                    steps={steps(os)}
                    stepLabel={(n) => t("install.step", { n })}
                  />,
                ]),
              ) as Record<OsFamily, React.ReactNode>
            }
          />
        </InnerSection>
      </div>

      {release && installers.length > 0 && (
        <div id="downloads" className="scroll-mt-24">
          <InnerSection
            eyebrow={t("all.eyebrow")}
            title={t("all.title")}
            lead={t("all.lead", {
              version: release.version,
              date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                new Date(release.publishedAt),
              ),
            })}
          >
            <div className="grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
              <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-2xl border border-subtle bg-surface">
                {installers.map((i) => (
                  <li
                    key={i.platform}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-fg">{t(`platform.${i.platform}`)}</p>
                      <p className="mt-1 truncate font-mono text-[0.8rem] text-fg-secondary">
                        {i.name} · {megabytes(i.size)}
                      </p>
                      {i.sha256 && (
                        <details className="mt-2 text-[0.8rem] text-fg-secondary">
                          <summary className="cursor-pointer select-none hover:text-fg">
                            {t("all.checksum")}
                          </summary>
                          <code className="mt-2 block font-mono break-all text-fg">{i.sha256}</code>
                        </details>
                      )}
                    </div>
                    <a
                      href={href(i.platform)}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                        "self-start sm:self-center",
                      )}
                      aria-label={`${t("all.get")}: ${t(`platform.${i.platform}`)}`}
                    >
                      <Download aria-hidden /> {t("all.get")}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="h-fit rounded-2xl border border-subtle bg-sunken p-6">
                <h3 className="font-display text-heading-md">{t("all.requirements")}</h3>
                <dl className="mt-4 space-y-4 text-body-sm">
                  {OS.map((os) => (
                    <div key={os}>
                      <dt className="font-semibold text-fg">{t(`os.${os}`)}</dt>
                      <dd className="mt-0.5 text-fg-secondary">{t(`all.req.${os}`)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </InnerSection>
        </div>
      )}

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
          "@type": "SoftwareApplication",
          name: "Vizulla Browser",
          description: t("metaDescription"),
          url: siteUrl(localizePath(PATH, locale)),
          applicationCategory: "BrowserApplication",
          operatingSystem: "macOS, Windows, Linux",
          ...(release ? { softwareVersion: release.version } : {}),
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@id": siteUrl("/#organization") },
        }}
      />
    </>
  );
}
