import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { BridgeGame } from "@/features/not-found/BridgeGame";
import { Link } from "@/i18n/link";
import { localizePath, type Locale } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button-variants";

// FR-GL-09: branded 404 with the broken-bridge interaction and helpful links.
export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const [t, g, n] = await Promise.all([
    getTranslations("notFound"),
    getTranslations("s5.notFound"),
    getTranslations("nav"),
  ]);
  const popular = [
    ["/services", n("services")],
    ["/work", n("work")],
    ["/academy", n("academy")],
    ["/contact", n("contact")],
  ] as const;
  return (
    <section className="section">
      <div className="container-reading text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-display-lg">{t("title")}</h1>
        <p className="mt-4 text-body-lg text-fg-secondary">{t("body")}</p>
        <div className="mt-10">
          <BridgeGame
            homeHref={localizePath("/", locale)}
            copy={{ piece: g("piece"), hint: g("hint"), connected: g("connected") }}
          />
        </div>
        <Button asChild className="mt-8">
          <Link href="/" locale={locale}>
            {t("home")}
          </Link>
        </Button>
        <nav aria-label={t("popular")} className="mt-10">
          <p className="text-body-sm text-fg-muted">{t("popular")}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {popular.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  locale={locale}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
