import { BadgeCheck, Check, Download, Languages, Laptop, Monitor, Terminal } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircuitArt } from "@/components/brand/CircuitArt";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DetailCta } from "@/components/patterns/DetailCta";
import { InnerSection, StepTrack } from "@/components/patterns/Inner";
import { buttonVariants } from "@/components/ui/button-variants";
import { BrowserShowcase } from "@/features/vizulla/BrowserShowcase";
import { DownloadPanel, type DownloadCopy } from "@/features/vizulla/DownloadPanel";
import { FeatureBento, type FeatureKey } from "@/features/vizulla/FeatureBento";
import { InstallArt } from "@/features/vizulla/InstallArt";
import { InstallGuide } from "@/features/vizulla/InstallGuide";
import {
  PLATFORM_OS,
  PLATFORMS,
  type OsFamily,
  type PlatformId,
} from "@/features/vizulla/platforms";
import { getVizullaRelease } from "@/features/vizulla/releases";
import { localizePath, type Locale } from "@/i18n/routing";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale }> };

const PATH = "/vizulla-browser";
const OS: OsFamily[] = ["mac", "windows", "linux"];
const OS_ICON = { mac: Laptop, windows: Monitor, linux: Terminal } as const;
const FEATURES: FeatureKey[] = [
  "shields",
  "assistant",
  "tabs",
  "passwords",
  "profiles",
  "languages",
];

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
                  <VizullaLogo
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
                    hl: (chunks) => <span className="vz-gradient-text">{chunks}</span>,
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
                <DownloadPanel
                  locale={locale}
                  available={installers.map((i) => i.platform)}
                  contactHref={localizePath("/contact", locale)}
                  copy={copy}
                />
              </div>
              <ul
                className="inner-rise mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-subtle pt-6 text-body-sm text-fg-secondary"
                style={{ "--i": 5 } as React.CSSProperties}
              >
                {(
                  [
                    [BadgeCheck, t("facts.free")],
                    [Monitor, t("facts.platforms")],
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
            <BrowserShowcase locale={locale} />
          </div>
        </div>
      </section>

      <InnerSection
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
            blocked: t("showcase.blocked"),
            onDevice: t("showcase.onDevice"),
            ask: t("showcase.ask"),
            strong: t("showcase.strong"),
          }}
        />
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
                  <div
                    key={os}
                    className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                  >
                    <InstallArt os={os} />
                    <StepTrack steps={steps(os)} stepLabel={(n) => t("install.step", { n })} />
                  </div>,
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
            <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
              <ul className="grid gap-3 sm:grid-cols-2">
                {installers.map((i) => {
                  const Icon = OS_ICON[PLATFORM_OS[i.platform]];
                  return (
                    <li
                      key={i.platform}
                      className="reveal flex flex-col rounded-2xl border border-subtle bg-surface p-5 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,#2563eb_45%,var(--border-subtle))] hover:shadow-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(180deg,#3b82f6,#1d4ed8)] text-white">
                          <Icon aria-hidden className="size-5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-fg">{t(`platform.${i.platform}`)}</p>
                          <p className="mt-1 truncate font-mono text-[0.78rem] text-fg-secondary">
                            {i.name}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="rounded-full bg-sunken px-2.5 py-1 font-mono text-[0.75rem] text-fg-secondary">
                          {megabytes(i.size)}
                        </span>
                        <a
                          href={href(i.platform)}
                          className={buttonVariants({ variant: "secondary", size: "sm" })}
                          aria-label={`${t("all.get")}: ${t(`platform.${i.platform}`)}`}
                        >
                          <Download aria-hidden /> {t("all.get")}
                        </a>
                      </div>
                      {i.sha256 && (
                        <details className="mt-3 text-[0.8rem] text-fg-secondary">
                          <summary className="cursor-pointer select-none hover:text-fg">
                            {t("all.checksum")}
                          </summary>
                          <code className="mt-2 block font-mono break-all text-fg">{i.sha256}</code>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="h-fit rounded-2xl border border-subtle bg-sunken p-6">
                <h3 className="font-display text-heading-md">{t("all.requirements")}</h3>
                <dl className="mt-5 space-y-4 text-body-sm">
                  {OS.map((os) => {
                    const Icon = OS_ICON[os];
                    return (
                      <div key={os} className="flex gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-subtle bg-surface text-accent">
                          <Icon aria-hidden className="size-4" />
                        </span>
                        <div>
                          <dt className="font-semibold text-fg">{t(`os.${os}`)}</dt>
                          <dd className="mt-0.5 flex items-start gap-1.5 text-fg-secondary">
                            <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {t(`all.req.${os}`)}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
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
