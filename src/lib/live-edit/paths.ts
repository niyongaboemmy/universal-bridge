/**
 * Where each CMS document lives on the site, for "Preview" in the admin (opens
 * the page in live-edit mode) and the admin nav link.
 */
const PAGE_PATHS: Record<string, string> = {
  home: "/",
  services: "/services",
  solutions: "/solutions",
  work: "/work",
  products: "/products",
  academy: "/academy",
  internships: "/academy/internships",
  careers: "/company/careers",
  partners: "/company/partners",
  about: "/company/about",
  labs: "/labs",
};

const COLLECTION_BASE: Record<string, string> = {
  services: "/services",
  industries: "/solutions",
  products: "/products",
  programs: "/academy/programs",
  jobs: "/company/careers",
  "case-studies": "/work",
  hubs: "/labs",
  events: "/company/events",
  posts: "/insights",
};

export function sitePath(collection: string, slug: string | null | undefined): string | null {
  if (!slug) return null;
  if (collection === "pages")
    return PAGE_PATHS[slug] ?? (slug.startsWith("legal-") ? `/legal/${slug.slice(6)}` : null);
  const base = COLLECTION_BASE[collection];
  return base ? `${base}/${slug}` : null;
}

export function liveEditUrl(path: string, locale?: string | null) {
  const localized = !locale || locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
  return `/api/live-edit/enable?path=${encodeURIComponent(localized)}`;
}

/** Payload `admin.preview` for a collection: opens the document on the page, ready to edit. */
export const previewFor =
  (collection: string) =>
  (doc: Record<string, unknown>, { locale }: { locale?: string }) => {
    const path = sitePath(collection, doc.slug as string | undefined);
    return path ? liveEditUrl(path, locale) : null;
  };
