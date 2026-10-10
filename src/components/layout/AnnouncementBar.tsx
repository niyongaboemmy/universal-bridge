import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { localizePath } from "@/i18n/routing";
import { getAnnouncement } from "@/lib/cms/globals";
import { DismissAnnouncement } from "./DismissAnnouncement";

/**
 * FR-GL-12. Rendered on the server; an inline script hides it before paint if
 * this version was dismissed, so there is no layout shift.
 */
export async function AnnouncementBar({ locale }: { locale: Locale }) {
  const a = await getAnnouncement(locale);
  if (!a.enabled || !a.text) return null;
  const t = await getTranslations({ locale, namespace: "announcement" });
  const key = `ub-ann-${a.version ?? "1"}`;
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem(${JSON.stringify(key)}))document.documentElement.dataset.annDismissed="1";else document.documentElement.style.setProperty("--announcement-h","40px")}catch(e){document.documentElement.style.setProperty("--announcement-h","40px")}`,
        }}
      />
      <div
        data-announcement
        className="fixed inset-x-0 top-0 z-[51] flex h-10 items-center bg-ub-blue-700 text-[0.875rem] text-white [html[data-ann-dismissed]_&]:hidden"
      >
        <div className="container-page flex items-center justify-center gap-3">
          <p className="truncate">
            {a.text}
            {a.href && (
              <a
                href={localizePath(a.href, locale)}
                className="ml-2 inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
              >
                {a.linkLabel}
                <ArrowRight aria-hidden className="size-3.5" />
              </a>
            )}
          </p>
          <DismissAnnouncement storageKey={key} label={t("dismiss")} />
        </div>
      </div>
    </>
  );
}
