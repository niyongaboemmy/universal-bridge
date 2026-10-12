import { ArrowUpRight } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { PhoneScreens } from "@/components/brand/PhoneScreens";
import { FeatureGrid, InnerSection } from "@/components/patterns/Inner";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { ContactForm } from "@/features/contact/ContactForm";
import { contactFormCopy } from "@/features/contact/copy";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getProduct, publishedSlugs } from "@/lib/cms/content";
import { countryOptions } from "@/lib/forms/options";
import { callingCodes } from "@/lib/forms/phone";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { productLd } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/utils";
import type { Media as MediaDoc } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("products");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug, locale);
  if (!p) return {};
  return pageMetadata({
    locale,
    path: `/products/${slug}`,
    title: p.seo?.title || p.name,
    description: p.seo?.description || p.tagline,
  });
}

// FR-PRD-02/03 product page with "Request a demo".
export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [p, t, n, copy] = await Promise.all([
    getProduct(slug, locale),
    getTranslations({ locale, namespace: "templates.product" }),
    getTranslations({ locale, namespace: "nav" }),
    contactFormCopy(locale),
  ]);
  if (!p) notFound();
  const shots = (p.screenshots ?? []).filter((s): s is MediaDoc => typeof s === "object");

  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("products"), href: "/products" },
          { label: p.name, href: `/products/${slug}` },
        ]}
        title={p.name}
        edit={{ ref: await docRef("products", p, locale), title: "name", lead: "tagline" }}
        lead={p.tagline}
        aside={
          <div className="inner-media relative mx-auto aspect-square w-full max-w-[460px]">
            <div
              aria-hidden
              className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
            />
            <div aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
              <div className="product-orbit absolute inset-[6%] rounded-full border border-dashed border-[var(--border-strong)]" />
              <div className="product-orbit product-orbit--rev absolute inset-[20%] rounded-full border border-subtle">
                <span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-spark shadow-[0_0_12px_var(--accent-spark)]" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {shots[0] ? (
                <Media
                  media={shots[0]}
                  priority
                  sizes="(min-width: 1024px) 240px, 60vw"
                  className="aspect-[9/17] w-56 rounded-[2rem] shadow-4"
                />
              ) : (
                <PhoneScreens
                  name={p.name}
                  tagline={p.tagline}
                  features={p.features ?? []}
                  className="w-52 rotate-[-3deg] sm:w-56"
                />
              )}
            </div>
            <span className="glass absolute top-[8%] right-[4%] inline-flex items-center gap-2 rounded-full border border-subtle px-3.5 py-1.5 text-body-sm font-medium text-fg shadow-3">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              {t(`status.${p.status}`)}
            </span>
          </div>
        }
      >
        <div className="mt-9 flex flex-wrap gap-3">
          {p.externalUrl && (
            <Button asChild size="lg" variant="spark">
              <a href={p.externalUrl} target="_blank" rel="noopener">
                {t("visit", { name: p.name })} <ArrowUpRight aria-hidden />
              </a>
            </Button>
          )}
          {(p.ctas ?? []).map((cta, i) => (
            <Button
              key={cta.id ?? i}
              asChild
              size="lg"
              variant="secondary"
              className="bg-transparent"
            >
              <a href={cta.href.startsWith("/") ? localizePath(cta.href, locale) : cta.href}>
                {cta.label}
              </a>
            </Button>
          ))}
          <Button asChild size="lg" variant="ghost">
            <a href="#demo">{t("demoTitle")}</a>
          </Button>
        </div>
      </DetailHero>

      {shots.length > 1 && (
        <div className="container-page -mt-10 grid gap-4 sm:grid-cols-2">
          {shots.slice(1, 3).map((s) => (
            <Media
              key={s.id}
              media={s}
              sizes="50vw"
              className="aspect-[16/10] rounded-xl shadow-4"
            />
          ))}
        </div>
      )}

      {(p.summary || p.audience) && (
        <section className="section pb-0">
          <div className="container-page grid gap-10 lg:grid-cols-2">
            {p.summary && (
              <p className="reveal font-display text-heading-lg text-balance lg:text-[2rem] lg:leading-tight">
                {p.summary}
              </p>
            )}
            {p.audience && (
              <div>
                <h2 className="eyebrow">{t("audience")}</h2>
                <p className="mt-3 text-body-lg text-fg-secondary">{p.audience}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {!!p.features?.length && (
        <InnerSection title={t("features")}>
          <FeatureGrid items={p.features} />
        </InnerSection>
      )}

      <section id="demo" className="section bg-sunken" aria-labelledby="demo-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="demo-title" className="text-display-lg">
              {t("demoTitle")}
            </h2>
            <p className="mt-4 text-body-lg text-fg-secondary">{t("demoLead")}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-3 sm:p-8">
            <ContactForm
              copy={{ ...copy, fields: { ...copy.fields, message: t("useCase"), messageHint: "" } }}
              locale={locale}
              countries={countryOptions(locale)}
              callingCodes={callingCodes()}
              services={[]}
              product={{ slug: p.slug, name: p.name }}
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
            />
          </div>
        </div>
      </section>
      <JsonLd
        data={productLd({
          name: p.name,
          description: p.tagline,
          url: siteUrl(localizePath(`/products/${slug}`, locale)),
          externalUrl: p.externalUrl,
        })}
      />
    </>
  );
}
