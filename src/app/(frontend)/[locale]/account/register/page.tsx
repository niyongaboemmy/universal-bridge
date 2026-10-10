import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AccountShell } from "@/features/account/AccountShell";
import { MemberRegisterForm } from "@/features/account/AccountForms";
import { accountCopy } from "@/features/account/copy";
import { currentMember } from "@/features/account/session";
import { localizePath, type Locale } from "@/i18n/routing";
import { getPublicSystem } from "@/lib/cms/system";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("registerTitle"), robots: { index: false } };
}

export default async function MemberRegister({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  if (await currentMember()) redirect(localizePath("/account", locale));
  const [copy, system] = await Promise.all([accountCopy(locale), getPublicSystem()]);
  const qs = sp.next ? `?next=${encodeURIComponent(sp.next)}` : "";
  return (
    <AccountShell
      title={copy.registerTitle!}
      lead={copy.registerLead}
      footer={
        <>
          {copy.haveAccount}{" "}
          <a
            href={localizePath("/account/login", locale) + qs}
            className="font-semibold text-accent"
          >
            {copy.loginTitle}
          </a>
        </>
      }
    >
      {system.registrationOpen ? (
        <MemberRegisterForm copy={copy} locale={locale} next={sp.next} />
      ) : (
        <p className="rounded-lg bg-[var(--bg-sunken)] px-4 py-3 text-body-sm">
          {copy.registrationClosed}
        </p>
      )}
    </AccountShell>
  );
}
