import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { memberLogout } from "@/features/account/actions";
import { MemberProfileForm } from "@/features/account/AccountForms";
import { accountCopy } from "@/features/account/copy";
import { currentMember } from "@/features/account/session";
import { localizePath, type Locale } from "@/i18n/routing";
import { payload } from "@/lib/cms/payload";
import { cn } from "@/lib/utils";
import type { Application, Role } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ reset?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "openings" });
  return { title: t("myAccount"), robots: { index: false } };
}

const STEPS = ["received", "review", "shortlisted", "accepted"] as const;

/** A member's own space: their applications (with progress) and profile. */
export default async function AccountHome({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await currentMember();
  if (!member) redirect(localizePath("/account/login", locale));
  const sp = await searchParams;
  const [t, copy] = await Promise.all([
    getTranslations({ locale, namespace: "account" }),
    accountCopy(locale),
  ]);
  const p = await payload();
  const apps = await p.find({
    collection: "applications",
    where: { member: { equals: member.id } },
    sort: "-createdAt",
    limit: 50,
    depth: 0,
    user: { ...member, collection: "members" } as never,
    overrideAccess: false,
  });
  const role = typeof member.role === "object" ? (member.role as Role | null) : null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "rw" ? "en-GB" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="section pt-10">
      <div className="container-page grid gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-display-lg">{t("hello", { name: member.name.split(" ")[0]! })}</h1>
            <p className="mt-2 text-body-lg text-fg-secondary">{t("dashboardLead")}</p>
          </div>
          <div className="flex items-center gap-3">
            {role?.slug && (role.slug === "visitor" || role.slug === "applicant") && (
              <span className="rounded-full bg-accent-soft px-3 py-1 text-body-sm font-semibold text-accent">
                {t(`roles.${role.slug}`)}
              </span>
            )}
            <form action={memberLogout}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-strong px-4 text-body-sm font-medium hover:border-accent"
              >
                <LogOut className="size-4" aria-hidden /> {t("signOut")}
              </button>
            </form>
          </div>
        </header>
        {sp.reset && (
          <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-body-sm text-accent">
            {t("resetDone")}
          </p>
        )}

        <section aria-labelledby="apps" className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="apps" className="font-display text-heading-lg">
              {t("applications")}
            </h2>
            <a
              href={localizePath("/apply", locale)}
              className="text-body-sm font-semibold text-accent"
            >
              {t("browse")} →
            </a>
          </div>
          {!apps.docs.length ? (
            <p className="rounded-xl border border-dashed border-strong p-8 text-center text-fg-secondary">
              {t("noApplications")}
            </p>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {(apps.docs as Application[]).map((a) => {
                const done = a.status === "rejected" || a.status === "waitlisted";
                const idx = STEPS.indexOf(a.status as (typeof STEPS)[number]);
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-subtle bg-surface p-5 shadow-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{a.subject}</p>
                        <p className="text-[0.8125rem] text-fg-muted">
                          <span className="font-mono">{a.ref}</span> ·{" "}
                          {t("appliedOn", { date: fmt(a.createdAt) })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold",
                          a.status === "accepted"
                            ? "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-success"
                            : done
                              ? "bg-[var(--bg-sunken)] text-fg-secondary"
                              : "bg-accent-soft text-accent",
                        )}
                      >
                        {t(`status.${a.status}`)}
                      </span>
                    </div>
                    {!done && (
                      <ol
                        className="mt-5 grid grid-cols-4 gap-1.5"
                        aria-label={t(`status.${a.status}`)}
                      >
                        {STEPS.map((s, i) => (
                          <li key={s} className="grid gap-1.5">
                            <span
                              className={cn(
                                "h-1.5 rounded-full",
                                i <= idx ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-sunken)]",
                                i === idx && "animate-pulse",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[0.6875rem]",
                                i <= idx ? "font-medium text-fg" : "text-fg-muted",
                              )}
                            >
                              {t(`status.${s}`)}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="profile"
          className="rounded-xl border border-subtle bg-surface p-6 shadow-1"
        >
          <h2 id="profile" className="mb-5 font-display text-heading-md">
            {t("profile")}
          </h2>
          <MemberProfileForm copy={copy} member={member} />
        </section>
      </div>
    </div>
  );
}
