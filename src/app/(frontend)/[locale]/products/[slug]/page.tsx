import { ArrowUpRight } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
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
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Badge tone={p.status === "live" ? "live" : p.status === "beta" ? "spark" : "neutral"}>
              {t(`status.${p.status}`)}
            </Badge>
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

      {shots.length > 0 && (
        <div className="container-page -mt-10 grid gap-4 sm:grid-cols-2">
          {shots.slice(0, 2).map((s) => (
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
            {p.summary && <p className="font-display text-heading-lg">{p.summary}</p>}
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
        <section className="section">
          <div className="container-page">
            <h2 className="text-display-lg">{t("features")}</h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.features.map((f, i) => (
                <li
                  key={f.id ?? i}
                  className="rounded-xl border border-subtle bg-surface p-6 shadow-1"
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

      <section id="demo" className="section bg-sunken" aria-labelledby="demo-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="demo-title" className="text-display-lg">
              {t("demoTitle")}
            </h2>
            <p className="mt-4 text-body-lg text-fg-secondary">{t("demoLead")}</p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface p-6 shadow-2 sm:p-8">
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
