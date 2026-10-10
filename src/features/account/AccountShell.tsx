import type { ReactNode } from "react";

/** Centered card for the member sign-in screens. */
export function AccountShell({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="section pt-10">
      <div className="container-page">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-2 sm:p-8">
            <h1 className="font-display text-heading-lg">{title}</h1>
            {lead && <p className="mt-2 text-body-sm text-fg-secondary">{lead}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <p className="mt-5 text-center text-body-sm text-fg-secondary">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
