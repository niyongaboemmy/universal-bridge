import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TiltStage } from "@/components/motion/TiltStage";
import { getCatalog } from "@/features/products/catalog";
import { ProductCarousel } from "@/features/products/ProductCarousel";
import type { Locale } from "@/i18n/routing";

/**
 * Hero "showcase" visual: every product we build and run, one at a time, on a
 * stage tinted to the product (its app on a phone or in a browser), with a
 * card that links to it and logo tabs to switch. New CMS products join on
 * their own (features/products/catalog). The H1 stays the LCP element.
 */
export async function HeroShowcase({ locale }: { locale: Locale }) {
  const [t, catalog] = await Promise.all([
    getTranslations({ locale, namespace: "showcase" }),
    getCatalog(locale),
  ]);
  if (!catalog.length) return null;
  const slides = catalog.map((p, i) => (
    <div key={p.key} className="absolute inset-0">
      <TiltStage className="absolute inset-x-0 top-0 bottom-[17%]">
        <div
          aria-hidden
          className="pc-stage absolute inset-0 overflow-hidden rounded-[1.75rem] border border-subtle bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,#2563eb_20%,transparent),transparent_70%),linear-gradient(160deg,#0b1430,#060b1a)] shadow-4"
        >
          <div
            className="absolute -top-28 left-1/2 size-[130%] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${p.accent}, transparent)` }}
          />
          <div className="pc-device absolute inset-0">{p.visual}</div>
        </div>
      </TiltStage>
      {p.highlight && (
        <p
          aria-hidden
          className="pc-chip vz-chip absolute top-[5%] right-[-2%] flex items-center gap-2 rounded-full border border-subtle py-1.5 pr-3.5 pl-1.5 text-[0.78rem] font-semibold whitespace-nowrap text-fg shadow-3 max-sm:hidden"
        >
          <span className="grid size-6 place-items-center rounded-full bg-spark text-on-spark">
            <Sparkles className="size-3.5" />
          </span>
          {p.highlight}
        </p>
      )}
      <div className="pc-card glass absolute bottom-0 left-[3%] w-[min(94%,22rem)] rounded-2xl border border-subtle p-4 shadow-4">
        <div className="flex items-center gap-3">
          <span className="size-10 shrink-0 text-[1.4rem]">{p.logo}</span>
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="truncate font-display text-[1.05rem] font-semibold text-fg">
                {p.name}
              </span>
              <span className="shrink-0 rounded-full bg-[color-mix(in_oklab,var(--success)_16%,transparent)] px-2 py-0.5 text-[0.68rem] font-semibold text-success">
                {p.status}
              </span>
            </p>
            <p className="truncate text-body-sm text-fg-secondary">{p.tagline}</p>
          </div>
        </div>
        <a
          href={p.href}
          className="group/link mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent"
        >
          {t("explore", { name: p.name })}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover/link:translate-x-0.5"
          />
        </a>
        <span aria-hidden className="absolute top-4 right-4 font-mono text-[0.7rem] text-fg-muted">
          {String(i + 1).padStart(2, "0")} / {String(catalog.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  ));
  return (
    <div className="showcase absolute inset-0 [container-type:inline-size]">
      <ProductCarousel
        tabs={catalog.map((p) => ({ key: p.key, name: p.name, logo: p.logo }))}
        slides={slides}
        labels={{ products: t("products"), pause: t("pause"), play: t("play") }}
      />
    </div>
  );
}
