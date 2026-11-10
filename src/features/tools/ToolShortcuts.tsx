import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { KubikaLogo } from "@/components/brand/KubikaLogo";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { localizePath, type Locale } from "@/i18n/routing";

/**
 * Home hero shortcuts to our own products (Vizulla Browser, Kubika): a glass
 * announcement row above the headline, each pill opening the product's page.
 */
export async function ToolShortcuts({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "tools" });
  const tools = [
    {
      key: "vizulla",
      href: "/vizulla-browser",
      logo: <VizullaLogo title={null} className="size-full" />,
    },
    { key: "kubika", href: "/kubika", logo: <KubikaLogo title={null} className="size-full" /> },
  ] as const;
  return (
    <nav
      aria-label={t("shortcutsLabel")}
      className="mb-7 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[1.4rem] border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_65%,transparent)] p-1.5 backdrop-blur-md sm:rounded-full"
    >
      <span className="flex items-center gap-2 px-2.5 text-[0.8rem] font-semibold text-fg-secondary">
        <span
          aria-hidden
          className="ot-live relative inline-block size-2 rounded-full bg-success"
        />
        {t("shortcutsLabel")}
      </span>
      {tools.map(({ key, href, logo }) => (
        <a
          key={key}
          href={localizePath(href, locale)}
          title={t(`${key}.short`)}
          className="ot-pill group relative flex h-10 items-center gap-2 overflow-hidden rounded-full border border-subtle bg-surface pr-3 pl-1.5 text-body-sm font-semibold text-fg transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,#3b82f6_60%,var(--border-subtle))] hover:shadow-3"
        >
          <span className="size-7 shrink-0 transition-transform duration-300 ease-emphasized group-hover:scale-110 group-hover:-rotate-6">
            {logo}
          </span>
          {t(`${key}.name`)}
          <ArrowUpRight
            aria-hidden
            className="size-3.5 text-fg-muted transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
          />
        </a>
      ))}
    </nav>
  );
}
