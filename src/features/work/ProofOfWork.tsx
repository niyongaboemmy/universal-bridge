import { ArrowRight, BadgeCheck, CalendarDays, FlaskConical, PhoneCall } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PhoneScreens } from "@/components/brand/PhoneScreens";
import { AccentText } from "@/components/ui/AccentText";
import { Button } from "@/components/ui/Button";
import { localizePath, type Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/cms/content";

/**
 * /work before any case study is approved (UI/UX audit v2 U-1): never an empty
 * page under a "proof" headline. Shows evidence a buyer can check today — the
 * live product, Labs prototypes, verifiable certificates, public demo days —
 * and offers a reference call. Disappears once the first case study is published.
 */
export async function ProofOfWork({ locale }: { locale: Locale }) {
  const [t, products] = await Promise.all([
    getTranslations({ locale, namespace: "templates.work.proof" }),
    getProducts(locale),
  ]);
  const product = products[0];
  const tile =
    "group relative flex flex-col overflow-hidden rounded-xl border border-subtle bg-surface p-7 shadow-1 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-3";
  const link =
    "mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-accent after:absolute after:inset-0";
  return (
    <>
      <header className="mt-10 max-w-3xl">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-4 text-display-xl">
          <AccentText text={t("title")} />
        </h1>
        <p className="mt-6 text-body-lg text-fg-secondary">{t("lead")}</p>
      </header>
      <ul className="mt-12 grid gap-5 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]">
        {product && (
          <li className="night group relative overflow-hidden rounded-xl border border-subtle p-8 shadow-3 lg:col-span-2 lg:row-span-2">
            <div
              aria-hidden
              className="absolute -top-24 -right-24 size-96 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
            />
            <div className="relative grid h-full items-center gap-8 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-subtle px-3 py-1 text-body-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  {t("liveProduct")}
                </p>
                <h2 className="mt-5 font-display text-display-lg">{product.name}</h2>
                <p className="mt-3 max-w-md text-body-lg text-fg-secondary">{product.tagline}</p>
                <Button asChild size="lg" className="mt-8">
                  <a href={localizePath(`/products/${product.slug}`, locale)}>
                    {t("explore", { name: product.name })}
                    <ArrowRight aria-hidden data-arrow />
                  </a>
                </Button>
              </div>
              <PhoneScreens
                name={product.name}
                tagline={product.tagline}
                features={product.features ?? []}
                className="mx-auto rotate-[4deg] transition-transform duration-700 ease-standard group-hover:rotate-0"
              />
            </div>
          </li>
        )}
        {(
          [
            [FlaskConical, "labs", "/labs"],
            [BadgeCheck, "academy", "/academy/verify"],
            [CalendarDays, "events", "/company/events"],
          ] as const
        ).map(([IconC, key, href]) => (
          <li key={key} className={tile}>
            <span className="flex size-12 items-center justify-center rounded-lg bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <IconC aria-hidden className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 font-display text-heading-md">{t(`${key}Title`)}</h2>
            <p className="mt-2 text-fg-secondary">{t(`${key}Body`)}</p>
            <a href={localizePath(href, locale)} className={link}>
              {t(`${key}Cta`)}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </a>
          </li>
        ))}
        <li className="relative flex flex-col justify-center overflow-hidden rounded-xl bg-spark p-8 text-on-spark shadow-2 lg:col-span-2">
          <h2 className="font-display text-heading-lg">{t("referenceTitle")}</h2>
          <p className="mt-2 max-w-xl">{t("referenceBody")}</p>
          <a
            href={localizePath("/contact?topic=sales", locale)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-[var(--ub-navy-950)] px-5 font-semibold text-white transition-transform hover:-translate-y-px"
          >
            <PhoneCall aria-hidden className="size-4" />
            {t("referenceCta")}
          </a>
        </li>
      </ul>
    </>
  );
}
