import NextLink from "next/link";
import { getLocale } from "next-intl/server";
import type { ComponentProps } from "react";
import { localizePath, type Locale } from "./routing";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale?: Locale };

/**
 * Locale-aware link for Server Components. Adds the `/fr` or `/rw` prefix
 * (English has none) without shipping any i18n code to the browser.
 */
export async function Link({ href, locale, ...props }: Props) {
  const isInternal = href.startsWith("/");
  const target = isInternal ? localizePath(href, locale ?? ((await getLocale()) as Locale)) : href;
  return <NextLink href={target} {...props} />;
}
