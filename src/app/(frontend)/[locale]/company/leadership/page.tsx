import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { DetailCta } from "@/components/patterns/DetailCta";
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
  const d = await getTranslations({ locale, namespace: "templates.detail" });
  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("company"), href: "/company/about" },
          { label: t("title"), href: "/company/leadership" },
        ]}
        eyebrow={n("company")}
        title={t("title")}
        lead={t("lead")}
        icon={null}
      />
      <section className="section">
        <div className="container-page">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p, i) => (
              <li key={p.id} className="reveal">
                <article className="person-card spotlight group relative flex h-full flex-col overflow-hidden rounded-2xl border border-subtle bg-surface p-6 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3">
                  <div className="flex items-center gap-5">
                    <div className="person-ring relative size-24 shrink-0 rounded-full p-[3px]">
                      <div className="relative size-full overflow-hidden rounded-full bg-[linear-gradient(150deg,var(--ub-blue-600),var(--ub-navy-900))]">
                        {p.photo && typeof p.photo === "object" ? (
                          <Media
                            media={p.photo}
                            sizes="96px"
                            className="absolute inset-0"
                            imgClassName="transition-transform duration-700 group-hover:scale-[1.06]"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="absolute inset-0 grid place-items-center font-display text-heading-lg font-bold text-white"
                          >
                            {initials(p.name)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.72rem] tracking-[0.16em] text-fg-muted">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1 font-display text-heading-md">{p.name}</h2>
                      {p.title && <p className="text-body-sm text-spark-text">{p.title}</p>}
                    </div>
                  </div>
                  {p.bio && <p className="mt-5 text-fg-secondary">{p.bio}</p>}
                  {p.linkedinUrl && (
                    <a
                      href={p.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("linkedin", { name: p.name })}
                      className="mt-auto inline-flex size-11 items-center justify-center self-start rounded-full text-fg-secondary hover:bg-accent-soft hover:text-accent"
                    >
                      <SocialIcon network="linkedin" />
                    </a>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <DetailCta
        locale={locale}
        eyebrow={d("ctaEyebrow")}
        title={d("ctaTitle")}
        lead={d("ctaLead")}
        primary={{ label: d("ctaPrimary"), href: "/contact" }}
        secondary={{ label: n("careers"), href: "/company/careers" }}
      />
    </>
  );
}
