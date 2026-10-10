import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localizePath, type Locale } from "@/i18n/routing";
import { JsonLd } from "@/lib/seo/json-ld";
import { siteUrl } from "@/lib/utils";

export type Crumb = { label: string; href: string };

/** FR-GL-07: breadcrumbs + BreadcrumbList JSON-LD on pages deeper than level 1. */
export async function Breadcrumbs({
  items,
  locale,
  className,
}: {
  items: Crumb[];
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "a11y" });
  const n = await getTranslations({ locale, namespace: "nav" });
  const all = [{ label: n("home"), href: "/" }, ...items];
  return (
    <>
      <nav aria-label={t("breadcrumbs")} className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-body-sm text-fg-secondary">
          {all.map((crumb, i) => {
            const last = i === all.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="text-fg">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={localizePath(crumb.href, locale)}
                    className="link-underline inline-block hover:text-fg max-md:py-2.5"
                  >
                    {crumb.label}
                  </a>
                )}
                {!last && <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: siteUrl(localizePath(c.href, locale)),
          })),
        }}
      />
    </>
  );
}
