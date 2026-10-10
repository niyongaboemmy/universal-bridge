import type { Metadata } from "next";
import { docRef } from "@/lib/live-edit/session";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PeopleList } from "@/components/patterns/PeopleList";
import { DetailHero } from "@/components/layout/DetailHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getHub, publishedSlugs } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("hubs");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const h = await getHub(slug, locale);
  if (!h) return {};
  return pageMetadata({
    locale,
    path: `/labs/${slug}`,
    title: h.seo?.title || h.name,
    description: h.seo?.description || h.summary,
  });
}

// FR-LAB-01/02/03 hub page (Night).
export default async function HubPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [h, t, n] = await Promise.all([
    getHub(slug, locale),
    getTranslations({ locale, namespace: "s5.labs" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  if (!h) notFound();
  return (
    // The whole page is Night; marking it as the opener slides it under the transparent header.
    <div className="night" data-hero="night">
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("labs"), href: "/labs" },
          { label: h.name, href: `/labs/${slug}` },
        ]}
        eyebrow={h.tagline}
        title={h.name}
        edit={{ ref: await docRef("hubs", h, locale), title: "name", lead: "summary" }}
        lead={h.summary}
      />
      {h.cover && typeof h.cover === "object" && (
        <div className="container-page -mt-10">
          <Media
            media={h.cover}
            priority
            sizes="100vw"
            style={{ viewTransitionName: `hub-${h.slug}` }}
            className="aspect-[21/9] rounded-xl border border-subtle"
          />
        </div>
      )}
      {!!h.focusAreas?.length && (
        <section className="section">
          <div className="container-page">
            <h2 className="text-display-lg">{t("focus")}</h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {h.focusAreas.map((f, i) => (
                <li
                  key={f.id ?? i}
                  className="spotlight rounded-xl border border-subtle bg-surface p-6"
                >
                  {f.icon && (
                    <span className="flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent [&_svg]:size-5">
                      <Icon name={f.icon} />
                    </span>
                  )}
                  <h3 className="mt-4 font-display text-heading-md">{f.title}</h3>
                  {f.body && <p className="mt-2 text-fg-secondary">{f.body}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="section pt-0">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          {!!h.equipment?.length && (
            <div>
              <h2 className="font-display text-heading-lg">{t("equipment")}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {h.equipment.map((e, i) => (
                  <li
                    key={e.id ?? i}
                    className="rounded-full border border-subtle px-4 py-2 text-body-sm"
                  >
                    {e.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!h.projects?.length && (
            <div>
              <h2 className="font-display text-heading-lg">{t("projects")}</h2>
              <ul className="mt-5 space-y-3">
                {h.projects.map((p, i) => (
                  <li key={p.id ?? i} className="rounded-lg border border-subtle bg-surface p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{p.title}</h3>
                      {p.status && (
                        <Badge tone={p.status === "live" ? "live" : "neutral"}>
                          {t(`status.${p.status}`)}
                        </Badge>
                      )}
                    </div>
                    {p.body && <p className="mt-1 text-body-sm text-fg-secondary">{p.body}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="lg:col-span-2">
            <PeopleList people={h.people} title={t("people")} />
          </div>
        </div>
      </section>
      <section className="section pt-0">
        <div className="container-page">
          <div className="flex flex-col items-start gap-5 rounded-xl border border-subtle bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-heading-lg">{t("collaborate")}</h2>
              <p className="mt-2 text-fg-secondary">{t("collaborateLead")}</p>
            </div>
            <Button asChild variant="spark" size="lg">
              <a href={localizePath("/contact?topic=partnerships", locale)}>{n("letsTalk")}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
