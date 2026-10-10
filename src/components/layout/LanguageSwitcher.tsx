"use client";

import { Check, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { localeLabels, localizePath, routing, type Locale } from "@/i18n/routing";
import { cx as cn } from "@/lib/cx";

/**
 * FR-GL-05: switch language and stay on the same page.
 * Native Popover API (opens with zero JS, works before hydration) and plain
 * anchors, so it also works if JavaScript fails. Full page loads on switch are
 * intended: the whole document changes language.
 */
export function LanguageSwitcher({
  locale,
  label,
  changeLabel,
  className,
}: {
  locale: Locale;
  label: string;
  changeLabel: string;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  // Rendered twice (header + mobile drawer), so ids and anchor names are per instance.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = `language-menu-${uid}`;
  const anchor = `--lang-${uid}`;
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        popoverTarget={id}
        aria-label={`${changeLabel} (${localeLabels[locale].native})`}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-body-sm font-medium text-fg transition-colors hover:bg-accent-soft hover:text-accent"
        style={{ anchorName: anchor } as React.CSSProperties}
      >
        <Globe aria-hidden className="size-4" />
        <span>{localeLabels[locale].short}</span>
      </button>
      <div
        id={id}
        popover="auto"
        className="anchored-popover acrylic min-w-48 rounded-lg border border-subtle p-1.5 text-fg shadow-4"
        style={{ positionAnchor: anchor } as React.CSSProperties}
      >
        <p className="px-3 py-1.5 text-body-sm text-fg-muted">{label}</p>
        <ul>
          {routing.locales.map((code) => (
            <li key={code}>
              <a
                href={localizePath(pathname, code)}
                lang={code}
                hrefLang={code}
                aria-current={code === locale ? "true" : undefined}
                onClick={() => {
                  // Persist the explicit choice (I18N-03) before navigating.
                  document.cookie = `UB_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
                }}
                className="flex min-h-11 items-center justify-between gap-4 rounded-md px-3 text-body-sm outline-none hover:bg-accent-soft hover:text-accent focus-visible:bg-accent-soft"
              >
                {localeLabels[code].native}
                {code === locale && <Check aria-hidden className="size-4" />}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
