/**
 * Whether auth cookies get the Secure flag: in production, unless the site itself is
 * served over plain http (a production build on http://localhost in CI or local checks).
 * Chromium accepts Secure cookies on http://localhost, but WebKit drops them, so
 * sign-in would silently fail there. The live site is https, so it always gets Secure.
 */
export const secureCookies = (): boolean =>
  process.env.NODE_ENV === "production" &&
  !/^http:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL ?? "");
