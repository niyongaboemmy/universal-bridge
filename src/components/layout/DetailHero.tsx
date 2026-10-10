import { CircuitArt } from "@/components/brand/CircuitArt";
import { AccentText } from "@/components/ui/AccentText";
import type { Locale } from "@/i18n/routing";
import { editable, type EditRef } from "@/lib/live-edit/attrs";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/** Night opener for detail pages (UI/UX §12.3/§12.5). */
export function DetailHero({
  locale,
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
  edit,
}: {
  locale: Locale;
  crumbs: Crumb[];
  eyebrow?: string | null;
  title: string;
  lead?: string | null;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  /** Live editing: the document and the field names behind the title and lead. */
  edit?: { ref?: EditRef; title: string; lead?: string };
}) {
  return (
    <section data-hero="night" className="night relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-15%] size-[620px] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <CircuitArt className="absolute inset-0 h-full w-full opacity-50 [mask-image:linear-gradient(90deg,transparent_45%,#000_85%)]" />
      </div>
      <div className="container-page pt-8 pb-20 lg:pb-28">
        <Breadcrumbs locale={locale} items={crumbs} />
        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1
              className="mt-4 text-display-xl"
              {...editable(edit?.ref, edit?.title ?? "", "accent", title)}
            >
              <AccentText text={title} />
            </h1>
            {lead && (
              <p
                className="mt-6 max-w-2xl text-body-lg text-fg-secondary"
                {...(edit?.lead ? editable(edit.ref, edit.lead, "textarea", lead) : {})}
              >
                {lead}
              </p>
            )}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
