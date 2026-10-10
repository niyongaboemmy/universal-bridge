import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/ui/Icon";
import { Media } from "@/components/ui/Media";
import { localizePath, type Locale } from "@/i18n/routing";
import { getHubs } from "@/lib/cms/content";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata("labs", locale, "/labs");
}

// FR-LAB-01: hubs overview (Night).
export default async function LabsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [hubs, c] = await Promise.all([
    getHubs(locale),
    getTranslations({ locale, namespace: "common" }),
  ]);
  return (
    <CmsPage slug="labs" locale={locale}>
      <section className="night section">
        <div className="container-page">
          <ul className="grid gap-6 lg:grid-cols-3">
            {hubs.map((h) => (
              <li
                key={h.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-subtle bg-surface/70 transition-transform duration-[var(--dur-base)] hover:-translate-y-1"
              >
                {h.cover && typeof h.cover === "object" && (
                  <div
                    className="relative aspect-[16/10] overflow-hidden"
                    style={{ viewTransitionName: `hub-${h.slug}` }}
                  >
                    <Media
                      media={h.cover}
                      sizes="(min-width:1024px) 33vw, 100vw"
                      className="absolute inset-0"
                      imgClassName="transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <span className="flex size-12 items-center justify-center rounded-lg bg-accent-soft text-accent [&_svg]:size-6">
                    <Icon name={h.icon} />
                  </span>
                  <h2 className="mt-5 font-display text-heading-md">
                    <a
                      href={localizePath(`/labs/${h.slug}`, locale)}
                      className="after:absolute after:inset-0"
                    >
                      {h.name}
                    </a>
                  </h2>
                  <p className="mt-2 flex-1 text-fg-secondary">{h.tagline}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-accent">
                    {c("explore")}{" "}
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </CmsPage>
  );
}
