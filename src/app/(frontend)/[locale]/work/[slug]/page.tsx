import type { Metadata } from "next";
import { docRef } from "@/lib/live-edit/session";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { clientLabel, CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { DetailHero } from "@/components/layout/DetailHero";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getCaseStudies, getCaseStudy, publishedSlugs } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Media as MediaDoc, Technology, Testimonial } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("case-studies");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = await getCaseStudy(slug, locale);
  if (!cs) return {};
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: cs.seo?.title || cs.title,
    description: cs.seo?.description || cs.summary,
    type: "article",
  });
}

// FR-WORK-02 case study: results first, then challenge / solution.
export default async function CaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [cs, all, t] = await Promise.all([
    getCaseStudy(slug, locale),
    getCaseStudies(locale),
    getTranslations({ locale, namespace: "templates.work" }),
  ]);
  if (!cs) notFound();
  const index = all.findIndex((x) => x.id === cs.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  const previous = all.length > 2 ? all[(index - 1 + all.length) % all.length] : undefined;
  const gallery = (cs.gallery ?? []).filter((m): m is MediaDoc => typeof m === "object");
  const team = (cs.team ?? []).map((m) => m.role).filter(Boolean);
  const techs = (cs.technologies ?? []).filter((x): x is Technology => typeof x === "object");
  const quote =
    typeof cs.testimonial === "object" && cs.testimonial?.approved
      ? (cs.testimonial as Testimonial)
      : null;
  const industry = typeof cs.industry === "object" ? cs.industry?.title : undefined;

  return (
    <article>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: t("title"), href: "/work" },
          { label: cs.title, href: `/work/${slug}` },
        ]}
        eyebrow={[clientLabel(cs), industry, cs.year].filter(Boolean).join(" · ")}
        title={cs.title}
        edit={{ ref: await docRef("case-studies", cs, locale), title: "title", lead: "summary" }}
        lead={cs.summary}
      />
      {cs.cover && typeof cs.cover === "object" && (
        <div className="container-page -mt-12">
          {/* Shares its name with the card on /work, so the card morphs into it (M-3). */}
          <Media
            style={{ viewTransitionName: `case-${cs.id}` }}
            media={cs.cover as MediaDoc}
            priority
            sizes="100vw"
            className="aspect-[21/9] rounded-xl shadow-4"
          />
        </div>
      )}
      {!!cs.results?.length && (
        <section className="section pb-0" aria-labelledby="results">
          <div className="container-page">
            <h2 id="results" className="eyebrow">
              {t("results")}
            </h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cs.results.map((r, i) => (
                <div
                  key={r.id ?? i}
                  className="rounded-xl border border-subtle bg-surface p-6 shadow-1"
                >
                  <dd className="font-display text-display-lg text-accent">{r.value}</dd>
                  <dt className="mt-1 text-fg-secondary">{r.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
      <section className="section">
        <div className="container-page grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="space-y-12">
            {cs.challenge && (
              <div>
                <h2 className="font-display text-heading-lg">{t("challenge")}</h2>
                <RichText data={cs.challenge} className="mt-4" />
              </div>
            )}
            {cs.solution && (
              <div>
                <h2 className="font-display text-heading-lg">{t("solution")}</h2>
                <RichText data={cs.solution} className="mt-4" />
              </div>
            )}
            {quote && (
              <figure className="rounded-xl border-l-4 border-spark bg-surface p-8">
                <blockquote className="font-display text-heading-md">“{quote.quote}”</blockquote>
                <figcaption className="mt-4 text-fg-secondary">
                  {quote.personName}
                  {quote.role ? `, ${quote.role}` : ""}
                </figcaption>
              </figure>
            )}
          </div>
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <dl className="space-y-4 rounded-xl border border-subtle bg-surface p-6">
              <div>
                <dt className="text-body-sm text-fg-muted">{t("client")}</dt>
                <dd className="font-medium">{clientLabel(cs)}</dd>
                {cs.client?.anonymised && (
                  <dd className="text-body-sm text-fg-secondary">{t("anonymised")}</dd>
                )}
              </div>
              {cs.year && (
                <div>
                  <dt className="text-body-sm text-fg-muted">{t("year")}</dt>
                  <dd className="font-medium">{cs.year}</dd>
                </div>
              )}
              {techs.length > 0 && (
                <div>
                  <dt className="text-body-sm text-fg-muted">{t("stack")}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {techs.map((x) => (
                      <span
                        key={x.id}
                        className="rounded-full bg-sunken px-2.5 py-0.5 text-body-sm"
                      >
                        {x.name}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {team.length > 0 && (
                <div>
                  <dt className="text-body-sm text-fg-muted">{t("team")}</dt>
                  <dd className="mt-1 text-body-sm">{team.join(" · ")}</dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </section>
      {gallery.length > 0 && (
        <section className="section pt-0" aria-labelledby="gallery">
          <div className="container-page">
            <h2 id="gallery" className="eyebrow">
              {t("gallery")}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {gallery.map((m, i) => (
                <li
                  key={m.id}
                  className={i === 0 && gallery.length % 2 === 1 ? "sm:col-span-2" : undefined}
                >
                  <Media
                    media={m}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="aspect-[16/10] rounded-xl"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {next && next.id !== cs.id && (
        <nav className="section bg-sunken" aria-label={t("next")}>
          <div
            className={
              previous ? "container-page grid gap-8 md:grid-cols-2" : "container-page max-w-3xl"
            }
          >
            {previous && previous.id !== next.id && (
              <div>
                <p className="eyebrow">{t("previous")}</p>
                <div className="mt-6">
                  <CaseStudyCard
                    cs={previous}
                    href={localizePath(`/work/${previous.slug}`, locale)}
                  />
                </div>
              </div>
            )}
            <div>
              <p className="eyebrow">{t("next")}</p>
              <div className="mt-6">
                <CaseStudyCard cs={next} href={localizePath(`/work/${next.slug}`, locale)} />
              </div>
            </div>
          </div>
        </nav>
      )}
    </article>
  );
}
