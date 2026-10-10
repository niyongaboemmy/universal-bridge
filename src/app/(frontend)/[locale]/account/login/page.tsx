import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AccountShell } from "@/features/account/AccountShell";
import { MemberForgotForm, MemberLoginForm } from "@/features/account/AccountForms";
import { accountCopy } from "@/features/account/copy";
import { currentMember } from "@/features/account/session";
import { localizePath, type Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string; forgot?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("loginTitle"), robots: { index: false } };
}

export default async function MemberLogin({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  if (await currentMember()) redirect(localizePath("/account", locale));
  const copy = await accountCopy(locale);
  const forgot = sp.forgot === "1";
  const qs = sp.next ? `?next=${encodeURIComponent(sp.next)}` : "";
  return (
    <AccountShell
      title={forgot ? copy.resetRequestTitle! : copy.loginTitle!}
      lead={forgot ? undefined : copy.loginLead}
      footer={
        forgot ? (
          <a
            href={localizePath("/account/login", locale) + qs}
            className="font-semibold text-accent"
          >
            {copy.loginTitle}
          </a>
        ) : (
          <>
            {copy.noAccount}{" "}
            <a
              href={localizePath("/account/register", locale) + qs}
              className="font-semibold text-accent"
            >
              {copy.createOne}
            </a>
          </>
        )
      }
    >
      {forgot ? (
        <MemberForgotForm copy={copy} locale={locale} />
      ) : (
        <>
          <MemberLoginForm copy={copy} locale={locale} next={sp.next} />
          <a
            href={`${localizePath("/account/login", locale)}?forgot=1${sp.next ? `&next=${encodeURIComponent(sp.next)}` : ""}`}
            className="mt-4 block text-center text-body-sm text-fg-secondary hover:text-accent"
          >
            {copy.forgot}
          </a>
        </>
      )}
    </AccountShell>
  );
}
