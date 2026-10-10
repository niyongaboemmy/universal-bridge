import { CalendarDays, Clock, MapPin, MonitorSmartphone, Wallet } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PeopleList } from "@/components/patterns/PeopleList";
import { DetailHero } from "@/components/layout/DetailHero";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { feeLabel, intakeLabels } from "@/features/academy/format";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { openIntakes } from "@/lib/cms/academy";
import { getProgram, publishedSlugs } from "@/lib/cms/content";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/utils";
import type { Faq } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("programs");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProgram(slug, locale);
  if (!p) return {};
  return pageMetadata({
    locale,
    path: `/academy/programs/${slug}`,
    title: p.seo?.title || p.title,
    description: p.seo?.description || p.summary,
  });
}

// FR-ACA-03 program detail + Course JSON-LD; sticky enrol panel (UI/UX §12.9).
export default async function ProgramPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [p, intakes, t, n] = await Promise.all([
    getProgram(slug, locale),
    openIntakes(locale),
    getTranslations({ locale, namespace: "academyPages" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  if (!p) notFound();
  const intake = intakes.find((i) => typeof i.program === "object" && i.program.id === p.id);
  const [fee, labels] = await Promise.all([
    feeLabel(p, locale),
    intake ? intakeLabels(intake, locale) : null,
  ]);
  const faqs = (p.faqs ?? []).filter((f): f is Faq => typeof f === "object");
  const applyHref = localizePath(`/academy/apply${intake ? `?intake=${intake.id}` : ""}`, locale);
  const applyLabel = intake?.full ? t("joinWaitlist") : t("apply");

  const facts = [
    { icon: MonitorSmartphone, label: t("mode"), value: t(`modes.${p.mode}`) },
    {
      icon: Clock,
      label: t("duration"),
      value: `${t("weeks", { n: p.durationWeeks })}${p.hoursPerWeek ? ` · ${t("hoursPerWeek", { n: p.hoursPerWeek })}` : ""}`,
    },
    ...(p.schedule ? [{ icon: CalendarDays, label: t("schedule"), value: p.schedule }] : []),
    ...(p.location ? [{ icon: MapPin, label: t("location"), value: p.location }] : []),
    { icon: Wallet, label: t("fee"), value: `${fee}${p.fee?.note ? ` · ${p.fee.note}` : ""}` },
  ];

  const panel = (
    <aside className="rounded-xl border border-subtle bg-surface p-6 shadow-3">
      <p className="eyebrow">{t("nextIntake")}</p>
      {intake && labels ? (
        <div className="mt-3 space-y-1">
          <p className="font-display text-heading-md">{labels.starts}</p>
          <p className="text-body-sm text-fg-secondary">{labels.deadline}</p>
          <p className="text-body-sm font-semibold text-spark-text">{labels.seats}</p>
        </div>
      ) : (
        <p className="mt-3 text-body-sm text-fg-secondary">{t("noIntake")}</p>
      )}
      <dl className="mt-5 space-y-3 border-t border-subtle pt-5 text-body-sm">
        {facts.map(({ icon: I, label, value }) => (
          <div key={label} className="relative pl-7">
            <I aria-hidden className="absolute top-0.5 left-0 size-4 text-accent" />
            <dt className="text-fg-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <Button asChild variant="spark" size="lg" className="mt-6 w-full">
        <a href={applyHref}>{intake ? applyLabel : n("contact")}</a>
      </Button>
    </aside>
  );

  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("academy"), href: "/academy" },
          { label: t("programsTitle"), href: "/academy/programs" },
          { label: p.title, href: `/academy/programs/${slug}` },
        ]}
        eyebrow={`${t(`categories.${p.category}`)} · ${t(`levels.${p.level}`)}`}
        title={p.title}
        edit={{ ref: await docRef("programs", p, locale), title: "title", lead: "summary" }}
        lead={p.summary}
      />
      <div className="section">
        <div className="container-page grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="space-y-12">
            {!!p.outcomes?.length && (
              <section>
                <h2 className="font-display text-heading-lg">{t("outcomes")}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.outcomes.map((o, i) => (
                    <li key={o.id ?? i} className="rounded-lg border border-subtle bg-surface p-4">
                      {o.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {!!p.curriculum?.length && (
              <section>
                <h2 className="font-display text-heading-lg">{t("curriculum")}</h2>
                <ol className="mt-5 space-y-3 border-l border-strong pl-6">
                  {p.curriculum.map((m, i) => (
                    <li key={m.id ?? i} className="relative">
                      <span
                        aria-hidden
                        className="absolute top-2 -left-[31px] size-3 rounded-full border-2 border-accent bg-canvas"
                      />
                      <details className="accordion group rounded-lg border border-subtle bg-surface px-4">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                          <span>
                            {m.weeks && (
                              <span className="mr-2 font-mono text-body-sm text-spark-text">
                                {m.weeks}
                              </span>
                            )}
                            <span className="font-semibold">{m.module}</span>
                          </span>
                          <span
                            aria-hidden
                            className="text-fg-muted transition-transform group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        {m.topics && (
                          <ul className="list-disc space-y-1 pb-4 pl-5 text-fg-secondary">
                            {m.topics
                              .split("\n")
                              .filter(Boolean)
                              .map((topic) => (
                                <li key={topic}>{topic}</li>
                              ))}
                          </ul>
                        )}
                      </details>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {!!p.prerequisites?.length && (
              <section>
                <h2 className="font-display text-heading-lg">{t("prerequisites")}</h2>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-fg-secondary">
                  {p.prerequisites.map((x, i) => (
                    <li key={x.id ?? i}>{x.text}</li>
                  ))}
                </ul>
              </section>
            )}
            <PeopleList people={p.instructors} title={t("instructors")} />
            {faqs.length > 0 && (
              <section>
                <h2 className="font-display text-heading-lg">{t("faq")}</h2>
                <div className="mt-5">
                  <Accordion
                    items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
                  />
                </div>
              </section>
            )}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-28">{panel}</div>
          </div>
        </div>
      </div>
      {/* Mobile: the enrol panel becomes a bottom bar (UI/UX §12.9). */}
      <div
        data-no-print
        data-bottom-bar
        className="glass sticky bottom-0 z-40 flex items-center justify-between gap-3 border-t border-subtle px-4 py-3 lg:hidden"
      >
        <div className="min-w-0 text-body-sm">
          <p className="truncate font-semibold">{labels?.starts ?? p.title}</p>
          {labels && <p className="truncate text-fg-secondary">{labels.seats}</p>}
        </div>
        <Button asChild variant="spark">
          <a href={applyHref}>{intake ? applyLabel : n("contact")}</a>
        </Button>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: p.title,
          description: p.summary,
          provider: { "@type": "Organization", name: "Universal Bridge Ltd", sameAs: siteUrl("/") },
          inLanguage: locale,
          ...(intake
            ? {
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode:
                    p.mode === "online" ? "online" : p.mode === "hybrid" ? "blended" : "onsite",
                  startDate: intake.startDate,
                  endDate: intake.endDate ?? undefined,
                  location:
                    p.mode === "online"
                      ? undefined
                      : { "@type": "Place", name: p.location ?? "Kigali, Rwanda" },
                },
              }
            : {}),
          offers: p.fee?.isFree
            ? { "@type": "Offer", price: 0, priceCurrency: "RWF", category: "Free" }
            : p.fee?.amount
              ? {
                  "@type": "Offer",
                  price: p.fee.amount,
                  priceCurrency: p.fee.currency ?? "RWF",
                  category: "Paid",
                }
              : undefined,
        }}
      />
    </>
  );
}
