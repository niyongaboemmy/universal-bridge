import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { Media } from "@/components/ui/Media";
import type { Locale } from "@/i18n/routing";
import { getLeadership } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "s5.leadership" });
  return pageMetadata({
    locale,
    path: "/company/leadership",
    title: t("title"),
    description: t("lead"),
  });
}

// FR-TEAM-01/03: photo, name, title, bio, LinkedIn — no personal emails or phones.
// Bios open in native <details> (no JS). Hidden until OI-11 confirms names.
export default async function LeadershipPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [people, t, n] = await Promise.all([
    getLeadership(locale),
    getTranslations({ locale, namespace: "s5.leadership" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: n("company"), href: "/company/about" },
            { label: t("title"), href: "/company/leadership" },
          ]}
        />
        <h1 className="mt-10 text-display-xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-fg-secondary">{t("lead")}</p>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <li key={p.id}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sunken">
                  {p.photo && typeof p.photo === "object" ? (
                    <Media
                      media={p.photo}
                      sizes="(min-width:1024px) 33vw, 50vw"
                      className="absolute inset-0"
                      imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center font-display text-display-xl text-accent/60"
                    >
                      {p.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-heading-md">{p.name}</h2>
                    {p.title && <p className="text-fg-secondary">{p.title}</p>}
                  </div>
                  {p.linkedinUrl && (
                    <a
                      href={p.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("linkedin", { name: p.name })}
                      className="inline-flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-accent-soft hover:text-accent"
                    >
                      <SocialIcon network="linkedin" />
                    </a>
                  )}
                </div>
                {p.bio && (
                  <details className="accordion mt-2">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center font-semibold text-accent [&::-webkit-details-marker]:hidden">
                      {t("viewBio", { name: p.name.split(" ")[0] ?? p.name })}
                    </summary>
                    <p className="pb-2 text-fg-secondary">{p.bio}</p>
                  </details>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
