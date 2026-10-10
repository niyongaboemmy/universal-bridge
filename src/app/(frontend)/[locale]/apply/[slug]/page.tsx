import { CalendarClock, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { OpeningField } from "@/collections/Openings";
import { currentMember } from "@/features/account/session";
import { ApplyForm } from "@/features/openings/ApplyForm";
import { getOpening, isAccepting } from "@/features/openings/data";
import { localizePath, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";
import { buttonVariants } from "@/components/ui/button-variants";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const o = await getOpening(slug, locale);
  if (!o) return {};
  return pageMetadata({
    locale,
    path: `/apply/${slug}`,
    title: o.title,
    description: o.summary ?? undefined,
  });
}

const fmt = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale === "rw" ? "en-GB" : locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** One opening: what it is, key dates, and its application form. */
export default async function OpeningPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const opening = await getOpening(slug, locale);
  if (!opening || (opening.status !== "open" && opening.status !== "closed")) notFound();
  const [t, f, a, ac] = await Promise.all([
    getTranslations({ locale, namespace: "openings" }),
    getTranslations({ locale, namespace: "form" }),
    getTranslations({ locale, namespace: "apply" }),
    getTranslations({ locale, namespace: "account" }),
  ]);
  const accepting = isAccepting(opening);
  // Signed-in members get their details filled in (so these pages render per request).
  const member = await currentMember();
  const next = encodeURIComponent(localizePath(`/apply/${slug}`, locale));
  const loginHref = `${localizePath("/account/login", locale)}?next=${next}`;
  const registerHref = `${localizePath("/account/register", locale)}?next=${next}`;
  const errors = f.raw("errors") as Record<string, string>;
  const dates = [
    ["opens", opening.opensAt],
    ["closes", opening.closesAt],
    ["startsLabel", opening.startsAt],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: t("title"), href: "/apply" },
            { label: opening.title, href: `/apply/${slug}` },
          ]}
        />
        <div className="mt-10 grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="space-y-8">
            <div>
              <p className="text-eyebrow font-semibold tracking-[0.14em] text-accent uppercase">
                {t(`kinds.${opening.kind}`)}
              </p>
              <h1 className="mt-3 text-display-lg">{opening.title}</h1>
              {opening.summary && (
                <p className="mt-4 text-body-lg text-fg-secondary">{opening.summary}</p>
              )}
            </div>
            <ul className="flex flex-wrap gap-2 text-body-sm">
              {(opening.location || opening.mode) && (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-sunken)] px-3 py-1">
                  <MapPin className="size-4" aria-hidden />
                  {[opening.location, opening.mode ? t(`modes.${opening.mode}`) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </li>
              )}
              {opening.seats ? (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-sunken)] px-3 py-1">
                  <Users className="size-4" aria-hidden />
                  {t("seats", { count: opening.seats })}
                </li>
              ) : null}
            </ul>
            {dates.length > 0 && (
              <section
                aria-labelledby="dates"
                className="rounded-xl border border-subtle bg-surface p-6"
              >
                <h2 id="dates" className="font-semibold">
                  {t("timeline")}
                </h2>
                <ol className="mt-4 grid gap-4 border-l-2 border-subtle pl-5">
                  {dates.map(([k, v]) => (
                    <li key={k} className="relative">
                      <span className="absolute top-1.5 -left-[1.6rem] size-3 rounded-full border-2 border-accent bg-surface" />
                      <p className="text-[0.8125rem] text-fg-muted">{t(k)}</p>
                      <p className="font-medium">{fmt(v, locale)}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {opening.description && (
              <section aria-labelledby="details">
                <h2 id="details" className="font-display text-heading-md">
                  {t("details")}
                </h2>
                <div className="mt-3 space-y-3 text-body-lg whitespace-pre-line text-fg-secondary">
                  {opening.description}
                </div>
              </section>
            )}
          </div>

          <section
            aria-labelledby="apply"
            className="self-start rounded-xl border border-subtle bg-surface p-6 shadow-1 sm:p-8"
          >
            <h2 id="apply" className="font-display text-heading-lg">
              {t("formTitle")}
            </h2>
            {!accepting ? (
              <div className="mt-4 grid justify-items-start gap-4">
                <p className="inline-flex items-center gap-2 text-body-lg text-fg-secondary">
                  <CalendarClock className="size-5" aria-hidden /> {t("closedBody")}
                </p>
                <a
                  href={localizePath("/apply", locale)}
                  className="font-semibold text-accent underline underline-offset-4"
                >
                  {t("seeOpen")}
                </a>
              </div>
            ) : opening.requireAccount && !member ? (
              <div className="mt-4 grid gap-5">
                <p className="text-body-lg text-fg-secondary">{t("signInFirst")}</p>
                <div className="flex flex-wrap gap-3">
                  <a href={loginHref} className={buttonVariants({ size: "lg" })}>
                    {t("signIn")}
                  </a>
                  <a
                    href={registerHref}
                    className={buttonVariants({ variant: "secondary", size: "lg" })}
                  >
                    {t("register")}
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                {member && (
                  <p className="mb-5 rounded-lg bg-accent-soft px-4 py-2.5 text-body-sm text-accent">
                    {t("signedInAs", { name: member.name })}
                  </p>
                )}
                <ApplyForm
                  slug={slug}
                  locale={locale}
                  fields={((opening.fields ?? []) as OpeningField[]).filter((x) => x.key)}
                  member={
                    member ? { name: member.name, email: member.email, phone: member.phone } : null
                  }
                  accountHref={localizePath("/account", locale)}
                  turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
                  copy={{
                    name: f("fields.name"),
                    email: f("fields.email"),
                    phone: f("fields.phone"),
                    consent: f.markup("consentLabel", {
                      link: (c) =>
                        `<a class="font-semibold text-accent underline" href="${localizePath("/legal/privacy", locale)}">${c}</a>`,
                    }),
                    submit: t("apply"),
                    submitting: f("submitting"),
                    optional: f("optional"),
                    choose: f("choose"),
                    yes: a("yes"),
                    fileTypes: a("file.types"),
                    errors,
                    formErrors: {
                      generic: f("genericError"),
                      rateLimited: f("rateLimited"),
                      botCheckFailed: f("botCheckFailed"),
                      closed: t("closedBody"),
                      signIn: t("signInFirst"),
                    },
                    successTitle: a("receivedTitle"),
                    successBody: a("receivedBody"),
                    reference: f.raw("reference") as string,
                    track: member ? t("trackInAccount") : undefined,
                  }}
                />
                {!member && (
                  <p className="mt-6 text-body-sm text-fg-muted">
                    <a href={loginHref} className="font-medium text-accent">
                      {ac("loginTitle")}
                    </a>
                    {" · "}
                    <a href={registerHref} className="font-medium text-accent">
                      {ac("createOne")}
                    </a>
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
