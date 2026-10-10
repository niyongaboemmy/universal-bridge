import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/features/account/AccountShell";
import { MemberResetForm } from "@/features/account/AccountForms";
import { accountCopy } from "@/features/account/copy";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ token?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("resetTitle"), robots: { index: false } };
}

export default async function MemberResetPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token = "" } = await searchParams;
  const copy = await accountCopy(locale);
  return (
    <AccountShell title={copy.resetTitle!}>
      <MemberResetForm copy={copy} locale={locale} token={token} />
    </AccountShell>
  );
}
