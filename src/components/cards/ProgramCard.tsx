import { ArrowRight, CalendarDays, Clock, MonitorSmartphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import { feeLabel, intakeLabels } from "@/features/academy/format";
import { localizePath, type Locale } from "@/i18n/routing";
import type { IntakeView } from "@/lib/cms/academy";
import { cn } from "@/lib/utils";
import type { Program } from "@/payload-types";

/** FR-ACA-02 program card with the next intake and live seats (IX-12). */
export async function ProgramCard({
  program,
  intake,
  locale,
}: {
  program: Program;
  intake?: IntakeView;
  locale: Locale;
}) {
  const [t, fee, labels] = await Promise.all([
    getTranslations({ locale, namespace: "academyPages" }),
    feeLabel(program, locale),
    intake ? intakeLabels(intake, locale) : Promise.resolve(null),
  ]);
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-subtle bg-surface p-6 shadow-1 transition-[transform,box-shadow] duration-[var(--dur-base)] hover:-translate-y-1 hover:shadow-3">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--accent-spark)_14%,transparent)] text-spark-text [&_svg]:size-6">
          <Icon name={program.icon ?? "graduation-cap"} />
        </span>
        <span className="rounded-full bg-sunken px-2.5 py-1 text-[0.8125rem] font-medium">
          {t(`levels.${program.level}`)}
        </span>
      </div>
      <h3 className="mt-5 font-display text-heading-md">
        <a
          href={localizePath(`/academy/programs/${program.slug}`, locale)}
          className="after:absolute after:inset-0"
        >
          {program.title}
        </a>
      </h3>
      <p className="mt-2 flex-1 text-fg-secondary">{program.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-body-sm text-fg-secondary">
        <li className="inline-flex items-center gap-1.5">
          <MonitorSmartphone aria-hidden className="size-4" />
          {t(`modes.${program.mode}`)}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {t("weeks", { n: program.durationWeeks })}
        </li>
        <li className="font-medium text-fg">{fee}</li>
      </ul>
      {intake && labels ? (
        <p
          className={cn(
            "mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-3 py-2 text-body-sm",
            intake.full
              ? "bg-sunken"
              : "bg-[color-mix(in_oklch,var(--accent-spark)_10%,transparent)]",
          )}
        >
          <CalendarDays aria-hidden className="size-4 text-spark-text" />
          <span className="font-medium">{labels.starts}</span>
          <span>· {labels.seats}</span>
          {!intake.full && intake.daysToDeadline <= 14 && <span>· {labels.closes}</span>}
        </p>
      ) : null}
      <span className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent">
        {t("overview")}
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </article>
  );
}
