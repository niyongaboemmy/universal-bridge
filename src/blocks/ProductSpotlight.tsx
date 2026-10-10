import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PhoneScreens } from "@/components/brand/PhoneScreens";
import { TiltStage } from "@/components/motion/TiltStage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { localizePath, type Locale } from "@/i18n/routing";
import type { Product } from "@/payload-types";

/**
 * FR-HOME-09 single product spotlight: open layout (no slab). The phone floats
 * over slowly turning orbit rings with pointer parallax; its screens cycle on a
 * CSS loop and the feature list lights up in sync (same clock, globals.css
 * "feat-sync"). Two actions: the product page and the live site.
 */
export async function ProductSpotlight({
  product: p,
  locale,
  statusLabel,
}: {
  product: Product;
  locale: Locale;
  statusLabel: string;
}) {
  const t = await getTranslations({ locale, namespace: "templates.home" });
  const features = (p.features ?? []).slice(0, 3);
  const site = p.externalUrl ? new URL(p.externalUrl).hostname.replace(/^www\./, "") : null;
  return (
    <div className="mt-14 grid grid-cols-[minmax(0,1fr)] items-center gap-12 short:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
      {/* Stage */}
      <TiltStage className="product-stage relative mx-auto aspect-square w-full max-w-[520px] short:max-w-[min(520px,60svh)]">
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
        />
        <div
          aria-hidden
          className="product-orbit absolute inset-[6%] rounded-full border border-dashed border-[var(--border-strong)]"
        />
        <div
          aria-hidden
          className="product-orbit product-orbit--rev absolute inset-[20%] rounded-full border border-subtle"
        >
          <span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-spark shadow-[0_0_12px_var(--accent-spark)]" />
        </div>
        <div
          className="showcase-layer absolute inset-0 flex items-center justify-center"
          style={{ "--depth": 18 } as React.CSSProperties}
        >
          {p.screenshots?.[0] && typeof p.screenshots[0] === "object" ? (
            <Media
              media={p.screenshots[0]}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-[9/17] w-56 rounded-[2rem] shadow-4 short:w-[min(14rem,27svh)]"
            />
          ) : (
            <PhoneScreens
              name={p.name}
              tagline={p.tagline}
              features={features}
              className="w-56 rotate-[-3deg] sm:w-60 short:w-[min(15rem,27svh)]"
            />
          )}
        </div>
        {/* Floating feature chips around the phone */}
        {features.slice(0, 2).map((f, i) => (
          <div
            key={f.title}
            aria-hidden
            className="showcase-layer glass absolute flex items-center gap-2 rounded-full border border-subtle py-1.5 pr-3.5 pl-1.5 text-[0.8rem] font-medium text-fg shadow-3 max-sm:hidden"
            style={
              {
                "--depth": 34 + i * 10,
                ...(i === 0 ? { top: "18%", left: "0%" } : { bottom: "16%", right: "0%" }),
              } as unknown as React.CSSProperties
            }
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-spark text-on-spark [&_svg]:size-4">
              <Icon name={f.icon} />
            </span>
            {f.title}
          </div>
        ))}
      </TiltStage>

      {/* Story */}
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-subtle px-3 py-1 text-body-sm text-fg-secondary">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {statusLabel} · {t("productsWhere")}
        </p>
        <h3 className="mt-5 font-display text-display-lg tracking-tight">{p.name}</h3>
        <p className="mt-3 max-w-md text-body-lg text-fg-secondary">{p.tagline}</p>

        {features.length > 0 && (
          <ol
            className="feat-sync mt-8 space-y-1"
            data-screens={features.length + 1}
            style={{ "--screens": features.length + 1 } as React.CSSProperties}
          >
            {features.map((f, i) => (
              <li
                key={f.title}
                className="feat-item flex items-start gap-3 rounded-xl px-3 py-2.5"
                style={{ "--i": i + 1 } as React.CSSProperties}
              >
                <span className="feat-icon mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-subtle text-accent [&_svg]:size-4">
                  <Icon name={f.icon} />
                </span>
                <span>
                  <span className="block font-medium text-fg">{f.title}</span>
                  {f.body && <span className="block text-body-sm text-fg-secondary">{f.body}</span>}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <a href={localizePath(`/products/${p.slug}`, locale)}>
              {t("productsCta")} <ArrowRight aria-hidden data-arrow />
            </a>
          </Button>
          {p.externalUrl && site && (
            <a
              href={p.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex min-h-11 items-center gap-1.5 font-medium text-accent"
            >
              {t("productsVisit", { site })}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
