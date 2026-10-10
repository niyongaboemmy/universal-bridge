import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/link";
import { localizePath, type Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getNavigation } from "@/lib/cms/globals";
import { HeaderScrollState } from "./HeaderScrollState";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import type { NavItem } from "./nav-types";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "@/features/search/SearchTrigger";
import { getSiteSettings } from "@/lib/cms/settings";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [t, a, l, th, c, nav, sr, settings] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "a11y" }),
    getTranslations({ locale, namespace: "language" }),
    getTranslations({ locale, namespace: "theme" }),
    getTranslations({ locale, namespace: "common" }),
    getNavigation(locale),
    getTranslations({ locale, namespace: "search" }),
    getSiteSettings(locale),
  ]);
  const searchCopy = {
    open: sr("open"),
    placeholder: sr("placeholder"),
    empty: sr.raw("empty") as string,
    groups: Object.fromEntries(
      (["actions", "pages", "services", "work", "programs", "jobs", "posts"] as const).map((g) => [
        g,
        sr(`groups.${g}`),
      ]),
    ),
    actions: {
      book: sr("actions.book"),
      copyEmail: sr("actions.copyEmail"),
      toggleTheme: sr("actions.toggleTheme"),
      language: sr("actions.language"),
    },
  };

  const items: NavItem[] = (nav.items ?? []).map((item) => ({
    label: item.label,
    href: localizePath(item.href, locale),
    feature: item.feature
      ? {
          ...item.feature,
          href: item.feature.href ? localizePath(item.feature.href, locale) : null,
        }
      : null,
    children: item.children?.map((child) => ({
      label: child.label,
      href: localizePath(child.href, locale),
      description: child.description,
      icon: child.icon ? <Icon name={child.icon} /> : undefined,
    })),
  }));

  const controls = (
    <>
      <LanguageSwitcher locale={locale} label={l("label")} changeLabel={l("change")} />
      <ThemeToggle label={th("darkMode")} />
    </>
  );

  return (
    <header id="site-header" data-site-header data-scrolled="false">
      <div className="container-page relative flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" locale={locale} aria-label={a("home")} className="rounded-md">
          <Logo priority />
        </Link>
        <MegaMenu items={items} label={a("mainNav")} viewAllLabel={c("viewAll")} />
        <div className="flex items-center gap-1">
          <SearchTrigger locale={locale} copy={searchCopy} email={settings.email} />
          <div className="hidden items-center gap-1 sm:flex">{controls}</div>
          {/* FR-GL-04: persistent primary CTA */}
          <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/contact" locale={locale}>
              {t("letsTalk")}
            </Link>
          </Button>
          <MobileMenu
            items={items}
            labels={{
              open: a("openMenu"),
              close: a("closeMenu"),
              nav: a("mainNav"),
              viewAll: c("viewAll"),
            }}
            controls={controls}
            cta={
              <Button asChild className="w-full">
                <a href={localizePath("/contact", locale)}>{t("letsTalk")}</a>
              </Button>
            }
          />
        </div>
      </div>
      <HeaderScrollState targetId="site-header" />
    </header>
  );
}
