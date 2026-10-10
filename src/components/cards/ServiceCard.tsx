import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { ServiceVisual } from "./ServiceVisual";
import { cn } from "@/lib/utils";

/**
 * Service card (UI/UX §12.2), minimal: index, icon, a live mini-diagram, title, one line. The whole
 * card is the link; on hover the border warms, a spotlight follows the pointer,
 * the icon fills with spark and the corner arrow lifts. `feature` and `wide`
 * are the bento tiles that give the home grid an entry point (audit v2 V-2).
 * Theme tokens only, so it reads on white paper and on navy.
 */
export function ServiceCard({
  title,
  summary,
  icon,
  href,
  cta,
  index,
  variant = "default",
}: {
  title: string;
  summary: string;
  icon?: string | null;
  href: string;
  cta: string;
  index?: number;
  variant?: "default" | "feature" | "wide";
}) {
  const feature = variant === "feature";
  const wide = variant === "wide";
  return (
    <SpotlightCard
      className={cn(
        "service-card group h-full overflow-hidden rounded-2xl border border-subtle bg-surface transition-[translate,border-color,box-shadow] duration-300 ease-standard",
        "hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3",
        feature && "service-card--feature",
      )}
    >
      <a
        href={href}
        aria-label={`${title} — ${cta}`}
        className={cn(
          "relative flex h-full flex-col p-6 outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-focus",
          feature && "lg:p-10",
          wide && "lg:flex-row lg:items-center lg:gap-8",
        )}
      >
        <span
          className={cn(
            "flex items-start justify-between gap-4",
            wide && "lg:flex-col lg:justify-center",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl border border-subtle text-accent transition-[background-color,color,border-color,rotate] duration-300",
              "group-hover:-rotate-6 group-hover:border-transparent group-hover:bg-spark group-hover:text-on-spark",
              feature ? "size-14 [&_svg]:size-7" : "size-11 [&_svg]:size-5",
            )}
          >
            <Icon name={icon} strokeWidth={1.6} />
          </span>
          {index != null && !wide && (
            <span aria-hidden className="font-mono text-[0.72rem] tracking-[0.16em] text-fg-muted">
              {String(index).padStart(2, "0")}
            </span>
          )}
        </span>

        {/* Live mini-diagram for this service (illustrative). */}
        <ServiceVisual
          icon={icon}
          feature={feature}
          className={cn(
            "mt-5",
            feature ? "h-40 lg:h-56" : "h-24",
            wide && "lg:order-last lg:mt-0 lg:h-24 lg:w-64 lg:shrink-0",
          )}
        />

        <span
          className={cn(
            "mt-auto flex flex-col pt-6",
            wide && "lg:mt-0 lg:flex-1 lg:pt-0",
            feature && "lg:pt-8",
          )}
        >
          <span className="flex items-start justify-between gap-4">
            <h3
              className={cn(
                "font-display font-semibold tracking-tight text-fg",
                feature
                  ? "text-heading-lg lg:text-[2.25rem] lg:leading-tight"
                  : "text-[1.125rem] leading-snug",
              )}
            >
              {title}
            </h3>
            <ArrowUpRight
              aria-hidden
              className="mt-1 size-5 shrink-0 text-fg-muted transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-spark-text"
            />
          </span>
          <p
            className={cn(
              "mt-2 text-fg-secondary",
              feature ? "max-w-md text-body-lg" : "line-clamp-2 text-body-sm",
            )}
          >
            {summary}
          </p>
        </span>
      </a>
    </SpotlightCard>
  );
}
