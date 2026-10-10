import { Download, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { dateFmt } from "@/features/academy/format";
import type { Locale } from "@/i18n/routing";
import { getPressItems } from "@/lib/cms/content";
import { getSiteSettings } from "@/lib/cms/settings";
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
  const [items, settings, t, n] = await Promise.all([
    getPressItems(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "s5.press" }),
    getTranslations({ locale, namespace: "nav" }),
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
  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: n("company"), href: "/company/about" },
            { label: t("title"), href: "/company/press" },
          ]}
        />
        <h1 className="mt-10 text-display-xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-fg-secondary">{t("lead")}</p>
        <div className="mt-14 grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-12">
            {!items.length && <p className="text-fg-secondary">{t("none")}</p>}
            {groups.map(([kind, label]) => {
              const list = items.filter((i) => i.kind === kind);
              if (!list.length) return null;
              return (
                <section key={kind}>
                  <h2 className="font-display text-heading-lg">{label}</h2>
                  <ul className="mt-5 divide-y divide-subtle rounded-xl border border-subtle bg-surface">
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
          </div>
          <aside className="space-y-6">
            <section className="rounded-xl border border-subtle bg-surface p-6 shadow-1">
              <h2 className="font-display text-heading-md">{t("kit")}</h2>
              <p className="mt-2 text-body-sm text-fg-secondary">{t("kitLead")}</p>
              <ul className="mt-4 space-y-2">
                {[
                  ["/brand/original-logo.svg", t("logoSvg")],
                  ["/brand/ub-mark-white.svg", t("logoWhite")],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={href}
                      download
                      className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent hover:underline"
                    >
                      <Download aria-hidden className="size-4" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 font-semibold">{t("facts")}</h3>
              <dl className="mt-2 space-y-1 text-body-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-subtle py-1.5">
                    <dt className="text-fg-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-6 font-semibold">{t("boilerplate")}</h3>
              <p className="mt-2 text-body-sm text-fg-secondary">{t("boilerplateText")}</p>
              <h3 className="mt-6 font-semibold">{t("contact")}</h3>
              <a
                href={`mailto:${process.env.INBOX_PRESS ?? settings.email}`}
                className="mt-1 inline-block text-body-sm font-semibold text-accent hover:underline"
              >
                {process.env.INBOX_PRESS ?? settings.email}
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
