import type { ReactNode } from "react";

/** Card around an application form, with an id to link to (e.g. #apply). */
export function FormSection({
  id,
  title,
  lead,
  children,
  aside,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section bg-sunken">
      <div className="container-page grid gap-10 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2 id={`${id}-title`} className="text-display-lg">
            {title}
          </h2>
          {lead && <p className="mt-4 text-body-lg text-fg-secondary">{lead}</p>}
          {aside}
        </div>
        <div className="rounded-xl border border-subtle bg-surface p-6 shadow-2 sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </section>
  );
}
