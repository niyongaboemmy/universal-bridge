import { Download, ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { dateFmt } from "@/features/academy/format";
import type { Locale } from "@/i18n/routing";
import { getPressItems } from "@/lib/cms/content";
import { getSiteSettings } from "@/lib/cms/settings";
import { getPublicSystem } from "@/lib/cms/system";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "s5.press" });
  return pageMetadata({
    locale,
    path: "/company/press",
    title: t("title"),
    description: t("lead"),
  });
}

// FR-PRS-01: news, mentions, press kit (logos, facts, boilerplate).
export default async function PressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [items, settings, t, n, { pressEmail }] = await Promise.all([
    getPressItems(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "s5.press" }),
    getTranslations({ locale, namespace: "nav" }),
    getPublicSystem(),
  ]);
  const groups = [
    ["news", t("news")],
    ["mention", t("mentions")],
  ] as const;
  const facts = [
    [t("factLegalName"), settings.legalName ?? "Universal Bridge Ltd"],
    [t("factFounded"), String(settings.foundingYear ?? 2019)],
    [t("factHq"), t("factHqValue")],
    [t("factLanguages"), t("factLanguagesValue")],
  ];
  const logos = [
    ["/brand/original-logo.svg", t("logoSvg"), "bg-white"],
    [
      "/brand/ub-mark-white.svg",
      t("logoWhite"),
      "bg-[linear-gradient(150deg,var(--ub-blue-600),var(--ub-navy-900))]",
    ],
  ] as const;
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("company"), href: "/company/about" },
          { label: t("title"), href: "/company/press" },
        ]}
        eyebrow={n("company")}
        title={t("title")}
        lead={t("lead")}
        icon="newspaper"
        chips={[t("kit"), t("facts"), t("boilerplate")]}
      />
      <section className="section">
        <div className="container-page grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-12">
            <section>
              <h2 className="font-display text-heading-lg">{t("kit")}</h2>
              <p className="mt-2 text-fg-secondary">{t("kitLead")}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {logos.map(([href, label, bg]) => (
                  <li key={href} className="reveal">
                    <a
                      href={href}
                      download
                      className="group block overflow-hidden rounded-2xl border border-subtle bg-surface transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-3"
                    >
                      <span className={`grid aspect-[16/9] place-items-center ${bg}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
                        <img
                          src={href}
                          alt=""
                          width={96}
                          height={96}
                          className="size-24 transition-transform duration-500 group-hover:scale-110"
                        />
                      </span>
                      <span className="flex items-center justify-between gap-3 p-4 font-semibold">
                        {label}
                        <Download aria-hidden className="size-4 text-accent" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-display text-heading-lg">{t("boilerplate")}</h2>
              <blockquote className="reveal mt-5 rounded-2xl border border-subtle bg-[linear-gradient(120deg,var(--accent-primary-soft),transparent_70%)] p-6 text-body-lg">
                {t("boilerplateText")}
              </blockquote>
            </section>
            {groups.map(([kind, label]) => {
              const list = items.filter((i) => i.kind === kind);
              if (!list.length) return null;
              return (
                <section key={kind}>
                  <h2 className="font-display text-heading-lg">{label}</h2>
                  <ul className="mt-5 divide-y divide-subtle rounded-2xl border border-subtle bg-surface">
                    {list.map((i) => (
                      <li key={i.id} className="p-5">
                        <p className="text-body-sm text-fg-secondary">
                          {i.outlet ? `${i.outlet} · ` : ""}
                          {dateFmt(i.date, locale)}
                        </p>
                        <h3 className="mt-1 font-semibold">
                          {i.url ? (
                            <a
                              href={i.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 hover:text-accent"
                            >
                              {i.title}
                              <ExternalLink aria-hidden className="size-4" />
                            </a>
                          ) : (
                            i.title
                          )}
                        </h3>
                        {i.summary && <p className="mt-1 text-fg-secondary">{i.summary}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            {!items.length && <p className="text-body-sm text-fg-muted">{t("none")}</p>}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-2xl border border-subtle bg-surface p-6 shadow-2">
              <h2 className="font-display text-heading-md">{t("facts")}</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {facts.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-subtle bg-sunken p-4">
                    <dt className="font-mono text-[0.7rem] tracking-[0.14em] text-fg-muted uppercase">
                      {k}
                    </dt>
                    <dd className="mt-1 font-display font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-6 font-semibold">{t("contact")}</h3>
              <a
                href={`mailto:${pressEmail ?? settings.email}`}
                className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-accent hover:underline"
              >
                <Mail aria-hidden className="size-4" />
                {pressEmail ?? settings.email}
              </a>
            </section>
          </aside>
        </div>
      </section>
    </>
  );
}
