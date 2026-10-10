import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/CountUp";
import { Globe } from "@/components/motion/Globe";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getPublicStats } from "@/lib/cms/content";
import { cn } from "@/lib/utils";
import { Section } from "./Section";
import type { BlockProps } from "./types";

// Blocks built around client islands (count-up numbers, the WebGL globe).

export async function StatsBandBlock({ block, locale, edit }: BlockProps<"statsBand">) {
  const [stats, t] = await Promise.all([
    getPublicStats(locale),
    getTranslations({ locale, namespace: "templates.stats" }),
  ]);
  if (!stats.length) return null;
  const fmt = new Intl.DateTimeFormat(locale === "rw" ? "en" : locale, {
    month: "short",
    year: "numeric",
  });
  const stat = (s: (typeof stats)[number]) => (
    <>
      <dt className="sr-only">{s.label}</dt>
      <dd className="font-display text-display-lg text-fg">
        <CountUp value={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} locale={locale} />
      </dd>
      <dd aria-hidden className="mt-1 text-fg-secondary">
        {s.label}
      </dd>
      <dd className="mt-1 font-mono text-[0.75rem] text-fg-muted">
        {t("asOf", { date: fmt.format(new Date(s.asOf)) })}
      </dd>
    </>
  );
  // One or two verified stats read as inline highlights beside the heading, not a
  // half-empty card grid (UI/UX audit P2-6). The grid returns once there are more.
  if (stats.length < 3)
    return (
      <Section id={block.anchor}>
        <div className="grid items-end gap-10 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <SectionHeader
            eyebrow={block.eyebrow}
            title={block.title}
            lead={block.lead}
            edit={edit}
          />
          <dl className="grid gap-8 sm:grid-cols-2">
            {stats.map((s) => (
              <div key={s.id} className="border-l-2 border-spark pl-6">
                {stat(s)}
              </div>
            ))}
          </dl>
        </div>
      </Section>
    );
  return (
    <Section id={block.anchor}>
      <SectionHeader eyebrow={block.eyebrow} title={block.title} lead={block.lead} edit={edit} />
      <dl
        className={cn(
          "mt-12 grid gap-px overflow-hidden rounded-xl border border-subtle bg-[var(--border-subtle)]",
          stats.length >= 4
            ? "grid-cols-2 lg:grid-cols-4"
            : stats.length === 3
              ? "sm:grid-cols-3"
              : "",
        )}
      >
        {stats.map((s) => (
          <div key={s.id} className="bg-surface px-6 py-8 lg:px-10">
            {stat(s)}
          </div>
        ))}
      </dl>
    </Section>
  );
}

// Kigali → World (FR-HOME-11, UI/UX §10.5)
export function GlobalReachBlock({ block, edit }: BlockProps<"globalReach">) {
  const markets = (block.markets ?? []).map((m) => ({ name: m.name, lat: m.lat, lng: m.lng }));
  return (
    <Section id={block.anchor} night className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow={block.eyebrow}
            title={block.title}
            lead={block.lead}
            edit={edit}
          />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            {(block.points ?? []).map((p, i) => (
              <li key={p.id ?? i} className="rounded-lg border border-subtle p-4 sm:p-5">
                <p className="font-display text-body-lg font-semibold sm:text-heading-md">
                  {p.title}
                </p>
                {p.body && <p className="mt-2 text-fg-secondary max-sm:hidden">{p.body}</p>}
              </li>
            ))}
          </ul>
          {markets.length > 0 && (
            <p className="mt-6 text-body-sm text-fg-secondary">
              {markets.map((m) => m.name).join(" · ")}
            </p>
          )}
        </div>
        <div className="relative mx-auto w-full max-w-[560px] max-md:hidden">
          <div
            aria-hidden
            className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
          />
          <Globe places={markets} className="relative" />
        </div>
      </div>
    </Section>
  );
}
