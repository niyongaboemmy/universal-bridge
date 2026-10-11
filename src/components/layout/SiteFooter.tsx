import { ArrowUp, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/link";
import { localizePath, type Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/Logo";
import { CircuitDivider } from "@/components/brand/CircuitDivider";
import { getNavigation } from "@/lib/cms/globals";
import { getSiteSettings } from "@/lib/cms/settings";
import { formatPhone } from "@/lib/format";
import { subscribeNewsletter } from "@/features/newsletter/actions";
import { CookieSettingsButton } from "./CookieConsent";
import { NewsletterForm } from "./NewsletterForm";
import { SocialIcon } from "./SocialIcon";

const heading = "font-mono text-eyebrow tracking-[0.2em] text-fg-muted uppercase";

/**
 * SRS §5.4: link columns + bottom bar. FR-TEAM-03: company channels only.
 * Layout: brand + newsletter, four even columns (contact shows live office
 * hours via lib/fx/officehours), a slim legal bar, then the cropped wordmark
 * that rises in on scroll and glows under the pointer (lib/fx/spotlight).
 */
export async function SiteFooter({ locale }: { locale: Locale }) {
  const [t, nl, f, nav, settings] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "newsletter" }),
    getTranslations({ locale, namespace: "form" }),
    getNavigation(locale),
    getSiteSettings(locale),
  ]);
  const year = new Date().getFullYear();
  const legal = [
    ["/legal/privacy", t("privacy")],
    ["/legal/cookies", t("cookies")],
    ["/legal/terms", t("terms")],
    ["/legal/accessibility", t("accessibility")],
  ] as const;
  const address = settings.address;
  const mapsQuery = [address?.building, address?.street, address?.city, address?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <footer data-site-footer className="night site-footer relative overflow-hidden">
      <CircuitDivider className="opacity-70 [mask-image:linear-gradient(90deg,transparent,#000_30%,#000_70%,transparent)]" />

      <div className="container-page pt-16 lg:pt-20">
        {/* Brand and newsletter */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
          <div>
            <Logo />
            <p className="mt-5 max-w-md text-body-lg text-fg-secondary">{t("tagline")}</p>
            {settings.social?.length ? (
              <ul aria-label={t("follow")} className="mt-6 flex gap-2">
                {settings.social.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.network}
                      className="inline-flex size-11 items-center justify-center rounded-md border border-subtle text-fg-secondary transition-[background-color,border-color,color,translate] duration-300 ease-standard hover:-translate-y-0.5 hover:border-transparent hover:bg-spark hover:text-on-spark [&_svg]:size-[1.125rem]"
                    >
                      <SocialIcon network={s.network} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <NewsletterForm
            action={subscribeNewsletter}
            locale={locale}
            copy={{
              title: t("newsletterTitle"),
              lead: t("newsletterLead"),
              label: nl("label"),
              submit: nl("submit"),
              done: nl("checkInbox"),
              consent: f("marketingLabel").replace(/\s*\([^)]*\)\.?$/, "."),
              error: f("genericError"),
              errors: {
                email: f("errors.email"),
                required: f("errors.required"),
                consent: f("errors.consent"),
              },
            }}
          />
        </div>

        {/* Link columns */}
        <div className="footer-rule mt-12 grid grid-cols-1 pt-4 sm:mt-14 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:pt-12 lg:grid-cols-[1fr_1fr_1fr_1.3fr] lg:gap-x-10">
          {(nav.footerColumns ?? []).slice(0, 3).map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="max-sm:border-b max-sm:border-subtle"
            >
              {/* Phones: tap to open (lib/fx/footeracc closes them); wider screens: always-open columns. */}
              <details open data-fx="footeracc" className="group/acc">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between sm:pointer-events-none sm:min-h-0 [&::-webkit-details-marker]:hidden">
                  <h2 className={heading}>{col.title}</h2>
                  <ChevronDown
                    aria-hidden
                    className="size-4 text-fg-muted transition-transform duration-300 group-open/acc:rotate-180 sm:hidden"
                  />
                </summary>
                <ul className="space-y-0.5 pb-4 sm:mt-5 sm:pb-0">
                  {col.links?.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        locale={locale}
                        className="footer-link inline-flex min-h-9 items-center text-body-sm text-fg-secondary transition-colors hover:text-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </nav>
          ))}
          <div className="mt-10 sm:col-span-3 sm:mt-0 lg:col-span-1">
            <h2 className={heading}>{t("contact")}</h2>
            <address className="mt-5 space-y-4 text-body-sm text-fg-secondary not-italic">
              <a
                href={`mailto:${settings.email}`}
                className="group flex items-center gap-3 transition-colors hover:text-fg"
              >
                <Mail aria-hidden className="size-4 shrink-0 text-accent" />
                <span className="footer-link">{settings.email}</span>
              </a>
              {settings.phones?.slice(0, 1).map((p) => (
                <a
                  key={p.number}
                  href={`tel:${p.number}`}
                  className="flex items-center gap-3 transition-colors hover:text-fg"
                >
                  <Phone aria-hidden className="size-4 shrink-0 text-accent" />
                  <span className="footer-link">{formatPhone(p.number)}</span>
                </a>
              ))}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                title={t("directions")}
                className="flex gap-3 transition-colors hover:text-fg"
              >
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  {address?.building}
                  <br />
                  {address?.street}, {address?.city}
                </span>
              </a>
              {/* Office hours with a live open/closed state in Kigali time. */}
              <div
                data-fx="officehours"
                data-label-open={t("openNow")}
                data-label-closed={t("closedNow")}
                className="footer-hours pl-7"
              >
                <p>{t("officeHours")}</p>
                <p className="footer-hours__live mt-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-subtle py-1 pr-3 pl-2.5 text-[0.8125rem]">
                  <span aria-hidden className="footer-hours__dot size-1.5 rounded-full" />
                  <span data-status className="font-medium text-fg" />
                  <span aria-hidden className="text-fg-muted">
                    ·
                  </span>
                  <span className="font-mono text-fg-muted">
                    <span data-time /> {t("kigaliTime")}
                  </span>
                </p>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-rule mt-14 flex flex-col gap-4 py-6 text-body-sm text-fg-muted xl:flex-row xl:items-center xl:justify-between">
          <p>
            {t("rights", { year })}
            {settings.registrationNumber ? ` · RDB ${settings.registrationNumber}` : ""}
          </p>
          <div className="flex items-center justify-between gap-6">
            {/* 44 px touch targets on phones (UI/UX audit P2-7); compact on desktop. */}
            <ul className="flex flex-wrap gap-x-5 md:gap-y-2 [&_a,&_button]:inline-flex [&_a,&_button]:min-h-11 [&_a,&_button]:items-center [&_a,&_button]:transition-colors md:[&_a,&_button]:min-h-0">
              {legal.map(([href, label]) => (
                <li key={href}>
                  <a href={localizePath(href, locale)} className="hover:text-fg">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <CookieSettingsButton label={t("cookieSettings")} />
              </li>
            </ul>
            <a
              href="#"
              aria-label={t("backToTop")}
              className="group inline-flex size-11 shrink-0 items-center justify-center self-start rounded-md border border-subtle text-fg transition-[background-color,border-color,color] duration-300 hover:border-transparent hover:bg-spark hover:text-on-spark md:self-auto"
            >
              <ArrowUp
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Signature wordmark: cropped by the page edge, lit by the pointer. */}
      <div aria-hidden data-fx="spotlight" className="footer-mark-wrap container-page select-none">
        <p className="footer-mark font-display font-extrabold">Universal Bridge</p>
      </div>
    </footer>
  );
}
