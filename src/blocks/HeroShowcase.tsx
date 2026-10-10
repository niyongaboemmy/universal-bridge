import { getTranslations } from "next-intl/server";
import { PhoneScreens } from "@/components/brand/PhoneScreens";
import { TiltStage } from "@/components/motion/TiltStage";
import type { Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/cms/content";

const BARS = [38, 52, 44, 61, 57, 70, 66, 78, 74, 88, 83, 96];

/**
 * Hero "showcase" visual (UI/UX audit v2 V-1): what UB builds instead of a
 * render of its own sign — the live product's app (from the CMS), a Labs field
 * sensor and a web dashboard, layered with pointer parallax. Decorative
 * (aria-hidden); the H1 stays the LCP element, so no image is needed.
 */
export async function HeroShowcase({ locale }: { locale: Locale }) {
  const [t, products] = await Promise.all([
    getTranslations({ locale, namespace: "showcase" }),
    getProducts(locale),
  ]);
  const product = products[0];
  return (
    <TiltStage className="showcase absolute inset-0 [container-type:inline-size]">
      <div aria-hidden className="absolute inset-0">
        {/* Web: dashboard */}
        <div
          className="showcase-layer glass absolute top-[6%] left-0 w-[80%] rounded-2xl border border-subtle p-[4.5cqw] shadow-4"
          style={{ "--depth": 10 } as React.CSSProperties}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[clamp(0.8rem,3.6cqw,1rem)] font-semibold text-fg">
              {t("dashboard")}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-2 py-0.5 text-[clamp(0.6rem,2.4cqw,0.7rem)] font-medium text-success">
              <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" />
              {t("live")}
            </span>
          </div>
          <div className="mt-[3.5cqw] grid grid-cols-2 gap-[3cqw]">
            <div>
              <p className="text-[clamp(0.6rem,2.4cqw,0.72rem)] text-fg-secondary">{t("orders")}</p>
              <p className="font-display text-[clamp(1.1rem,6cqw,1.6rem)] font-bold text-fg">
                128 <span className="text-[0.5em] font-semibold text-success">↑ 12%</span>
              </p>
            </div>
            <div>
              <p className="text-[clamp(0.6rem,2.4cqw,0.72rem)] text-fg-secondary">
                {t("members")}
              </p>
              <p className="font-display text-[clamp(1.1rem,6cqw,1.6rem)] font-bold text-fg">
                1,240
              </p>
            </div>
          </div>
          <div className="mt-[3.5cqw] flex h-[18cqw] items-end gap-[1.2cqw]">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="showcase-bar flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,var(--accent-primary),color-mix(in_oklab,var(--accent-primary)_30%,transparent))]"
                style={{ "--h": `${h}%`, "--n": i } as React.CSSProperties}
              />
            ))}
          </div>
          <p className="mt-[2.5cqw] flex gap-2 font-mono text-[clamp(0.55rem,2.2cqw,0.68rem)] tracking-[0.18em] text-fg-muted uppercase">
            <span>{t("web")}</span>·<span>{t("mobile")}</span>·<span>{t("iot")}</span>
          </p>
        </div>

        {/* Mobile: the live product, from the CMS */}
        {product && (
          <div
            className="showcase-layer absolute right-[2%] bottom-[2%]"
            style={{ "--depth": 22 } as React.CSSProperties}
          >
            <PhoneScreens
              name={product.name}
              tagline={product.tagline}
              features={product.features ?? []}
              className="rotate-[5deg] max-lg:[zoom:0.72]"
            />
          </div>
        )}

        {/* IoT: Labs field sensor */}
        <div
          className="showcase-layer glass absolute bottom-[9%] left-[4%] flex w-[52%] items-center gap-[3cqw] rounded-2xl border border-subtle p-[3.5cqw] shadow-4"
          style={{ "--depth": 34 } as React.CSSProperties}
        >
          <svg viewBox="0 0 44 44" className="size-[13cqw] shrink-0 -rotate-90">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="5"
            />
            <circle
              className="showcase-gauge"
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="var(--accent-spark)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              style={{ "--v": 34 } as React.CSSProperties}
            />
          </svg>
          <div className="min-w-0">
            <p className="truncate text-[clamp(0.6rem,2.4cqw,0.72rem)] text-fg-secondary">
              {t("sensor")}
            </p>
            <p className="font-display text-[clamp(1.1rem,6cqw,1.6rem)] leading-tight font-bold text-fg">
              34%
            </p>
            <p className="truncate text-[clamp(0.55rem,2.2cqw,0.68rem)] text-spark-text">
              {t("sms")}
            </p>
          </div>
        </div>
      </div>
    </TiltStage>
  );
}
