import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { LocaleOffer } from "@/features/i18n/LocaleOffer";
import { Fx } from "@/components/motion/Fx";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { liveEditSession } from "@/lib/live-edit/session";
import { localizePath } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/cms/settings";
import { getPublicSystem } from "@/lib/cms/system";
import { JsonLd } from "@/lib/seo/json-ld";
import { organizationLd } from "@/lib/seo/schema";
import { inter, jakarta, jetbrains } from "../fonts";
import { InlineScript, Providers } from "../providers";
import { navProgressScript } from "@/lib/ui/nav-progress";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("defaultTitle"), template: t("titleTemplate") },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    openGraph: { siteName: t("siteName"), type: "website", locale },
    twitter: { card: "summary_large_image" },
    robots: (await getPublicSystem()).noindex ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#060d20" },
  ],
};

// IX-06 Lite mode: applied before paint so heavy effects never start.
// Lite mode (no CSS animation) only for data saver or a genuine 2G link. Chrome
// often estimates ordinary Wi-Fi as "3g", which used to switch every animation
// off; 3G now only skips the canvas/WebGL effects (lib/motion/can-use-rich-effects).
// Lite mode (calm motion) on a slow link, with Save-Data, or on a phone: decorative loops and
// scroll-linked animations cost frames and jump the layout on small touch screens.
const liteModeScript = `try{var c=navigator.connection;var s=localStorage.getItem('ub-lite');if(s==='on'||(s!=='off'&&((c&&(c.saveData||/2g/.test(c.effectiveType||'')))||matchMedia('(max-width: 767px)').matches)))document.documentElement.dataset.lite='on'}catch(e){}`;

async function localeOffers() {
  const pick = async (l: "fr" | "rw") => {
    const t = await getTranslations({ locale: l, namespace: "language.offer" });
    return { text: t("text"), action: t("action"), dismiss: t("dismiss") };
  };
  return { fr: await pick("fr"), rw: await pick("rw") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "a11y" });
  const c = await getTranslations({ locale, namespace: "consent" });
  const settings = await getSiteSettings(locale);
  const consentCopy = {
    title: c("title"),
    body: c("body"),
    accept: c("accept"),
    reject: c("reject"),
    customise: c("customise"),
    save: c("save"),
    analytics: c("analytics"),
    analyticsHint: c("analyticsHint"),
    essential: c("essential"),
    essentialHint: c("essentialHint"),
    policy: c("policy"),
    policyHref: localizePath("/legal/cookies", locale),
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${jakarta.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <InlineScript code={liteModeScript} />
        <InlineScript code={navProgressScript} />
        {/* SEO-04: Organization + LocalBusiness + WebSite */}
        <JsonLd data={organizationLd(settings)} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-md bg-accent px-4 py-3 font-medium text-on-accent shadow-3 transition-transform focus:translate-y-0"
        >
          {t("skipToContent")}
        </a>
        {/* No NextIntlClientProvider: client components receive translated labels as
            props, which keeps the ICU formatter (~10 KB) out of the browser bundle. */}
        <Providers>
          <AnnouncementBar locale={locale} />
          <SiteHeader locale={locale} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} />
          <WhatsAppButton locale={locale} />
          {/* CMS-07 live editing: the editor loads only for staff in edit mode. */}
          {(await liveEditSession()) && <div data-fx="liveedit" data-locale={locale} hidden />}
          {locale === "en" && <LocaleOffer offers={await localeOffers()} />}
          <Fx />
          <CookieConsent
            copy={consentCopy}
            plausibleDomain={(await getPublicSystem()).plausibleDomain ?? undefined}
          />
        </Providers>
      </body>
    </html>
  );
}
