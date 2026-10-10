import { NextResponse } from "next/server";
import { isLocale, localizePath, routing, type Locale } from "@/i18n/routing";
import { cached } from "@/lib/cms/cached";
import { payload } from "@/lib/cms/payload";

// Pages with a fixed URL. English titles: the palette ranks by title and summary,
// and these names are mostly the same across languages.
const STATIC_PAGES: [string, string][] = [
  ["/company/about", "About Universal Bridge"],
  ["/company/leadership", "Leadership"],
  ["/company/careers", "Careers"],
  ["/company/partners", "Partners and agents"],
  ["/company/events", "Events"],
  ["/company/press", "Press and media kit"],
  ["/academy/internships", "Internships"],
  ["/academy/verify", "Verify a certificate"],
  ["/contact", "Contact"],
  ["/book", "Book a call"],
  ["/legal/privacy", "Privacy policy"],
  ["/legal/cookies", "Cookie policy"],
  ["/legal/terms", "Terms of use"],
  ["/legal/accessibility", "Accessibility statement"],
];

export type SearchDoc = {
  id: string;
  type: "pages" | "services" | "work" | "programs" | "jobs" | "posts";
  title: string;
  text: string;
  url: string;
};

const build = cached(
  async (locale: Locale): Promise<SearchDoc[]> => {
    const p = await payload();
    const published = { _status: { equals: "published" } } as const;
    const opts = { where: published, limit: 500, depth: 0, locale, pagination: false } as const;
    const [services, cases, programs, jobs, posts, industries, products, hubs, events] =
      await Promise.all([
        p.find({ collection: "services", ...opts }),
        p.find({ collection: "case-studies", ...opts }),
        p.find({ collection: "programs", ...opts }),
        p.find({ collection: "jobs", ...opts }),
        p.find({ collection: "posts", ...opts }),
        p.find({ collection: "industries", ...opts }),
        p.find({ collection: "products", ...opts }),
        p.find({ collection: "hubs", ...opts }),
        p.find({ collection: "events", ...opts }),
      ]);
    const doc = (
      type: SearchDoc["type"],
      id: string | number,
      title: string,
      text: string | null | undefined,
      path: string,
    ): SearchDoc => ({
      id: `${type}-${id}`,
      type,
      title,
      text: (text ?? "").slice(0, 300),
      url: localizePath(path, locale),
    });
    return [
      ...services.docs.map((d) => doc("services", d.id, d.title, d.summary, `/services/${d.slug}`)),
      ...industries.docs.map((d) =>
        doc("pages", `i${d.id}`, d.title, d.summary, `/solutions/${d.slug}`),
      ),
      ...products.docs.map((d) =>
        doc("pages", `p${d.id}`, d.name, d.tagline, `/products/${d.slug}`),
      ),
      ...hubs.docs.map((d) => doc("pages", `h${d.id}`, d.name, d.tagline, `/labs/${d.slug}`)),
      ...cases.docs.map((d) => doc("work", d.id, d.title, d.summary, `/work/${d.slug}`)),
      ...programs.docs.map((d) =>
        doc("programs", d.id, d.title, d.summary, `/academy/programs/${d.slug}`),
      ),
      ...jobs.docs.map((d) => doc("jobs", d.id, d.title, d.summary, `/company/careers/${d.slug}`)),
      ...posts.docs.map((d) => doc("posts", d.id, d.title, d.excerpt, `/insights/${d.slug}`)),
      ...events.docs.map((d) =>
        doc("pages", `e${d.id}`, d.title, d.summary, `/company/events/${d.slug}`),
      ),
      // Fixed-URL CMS pages people search for by name (about, partners, legal…).
      ...STATIC_PAGES.map(([path, title]) => doc("pages", `s${path}`, title, "", path)),
    ];
  },
  ["search-index"],
  () => [
    "search-index",
    "services",
    "case-studies",
    "programs",
    "jobs",
    "posts",
    "industries",
    "products",
    "hubs",
    "events",
  ],
);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ADR-005: the ⌘K palette fetches this once, on first open.
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return NextResponse.json({ error: "unknown locale" }, { status: 404 });
  return NextResponse.json(await build(locale), {
    headers: { "cache-control": "public, max-age=300, stale-while-revalidate=86400" },
  });
}
