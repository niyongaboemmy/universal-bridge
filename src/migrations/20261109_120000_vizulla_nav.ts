import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

// Data only: links /vizulla-browser on sites seeded before the page existed, as the
// highlight panel of the Solutions mega-menu (only if that panel is still empty) and
// in the footer's Company column (after Products). The header has no room for another
// top-level item. Skips entirely if any link to the page exists, so editors' changes
// are kept.
const HREF = "/vizulla-browser";
const LOCALES = ["en", "fr", "rw"] as const;
type Locale = (typeof LOCALES)[number];

const FEATURE: Record<Locale, { eyebrow: string; title: string; body: string; cta: string }> = {
  en: {
    eyebrow: "Our product",
    title: "Vizulla Browser",
    body: "Fast, private and free, with ads and trackers blocked. For macOS, Windows and Linux.",
    cta: "Download Vizulla",
  },
  fr: {
    eyebrow: "Notre produit",
    title: "Vizulla Browser",
    body: "Rapide, privé et gratuit, sans publicités ni traqueurs. Pour macOS, Windows et Linux.",
    cta: "Télécharger Vizulla",
  },
  rw: {
    eyebrow: "Igicuruzwa cyacu",
    title: "Vizulla Browser",
    body: "Yihuta, irinda ubuzima bwite kandi ni ubuntu, nta matangazo n'ababakurikirana. Kuri macOS, Windows na Linux.",
    cta: "Kuramo Vizulla",
  },
};
const FOOTER_LABEL = "Vizulla Browser";

type Link = { id?: string | null; href?: string; label?: string };
type Item = Link & { feature?: { title?: string | null; href?: string | null } | null; [k: string]: unknown };
type Column = { id?: string | null; title?: string; links?: Link[] | null };
type Nav = { items?: Item[] | null; footerColumns?: Column[] | null };

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const read = (locale: Locale) =>
    payload.findGlobal({ slug: "navigation", locale, fallbackLocale: false, depth: 0, req }) as Promise<Nav>;
  const en = await read("en");
  // An empty site gets the links from the seed instead.
  if (!en.items?.length || JSON.stringify(en).includes(`"${HREF}"`)) return;

  const solutions = en.items.findIndex((i) => i.href === "/solutions" && !i.feature?.title);
  const company = (en.footerColumns ?? []).findIndex((c) => c.links?.some((l) => l.href === "/products"));
  // English first creates the footer row; the other locales then label the same row.
  for (const locale of LOCALES) {
    const doc = locale === "en" ? en : await read(locale);
    const items = (doc.items ?? []).map((item, i) =>
      i === solutions ? { ...item, feature: { ...item.feature, ...FEATURE[locale], href: HREF } } : item,
    );
    const footerColumns = (doc.footerColumns ?? []).map((c, i) => {
      if (i !== company) return c;
      const links = [...(c.links ?? [])];
      const existing = links.find((l) => l.href === HREF);
      if (existing) existing.label = FOOTER_LABEL;
      else links.splice(links.findIndex((l) => l.href === "/products") + 1, 0, { label: FOOTER_LABEL, href: HREF });
      return { ...c, links };
    });
    await payload.updateGlobal({ slug: "navigation", locale, data: { items, footerColumns } as never, depth: 0, req });
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const locale of LOCALES) {
    const nav = (await payload.findGlobal({
      slug: "navigation",
      locale,
      fallbackLocale: false,
      depth: 0,
      req,
    })) as Nav;
    await payload.updateGlobal({
      slug: "navigation",
      locale,
      data: {
        items: (nav.items ?? []).map((i) =>
          i.feature?.href === HREF
            ? { ...i, feature: { eyebrow: null, title: null, body: null, href: null, cta: null } }
            : i,
        ),
        footerColumns: (nav.footerColumns ?? []).map((c) => ({
          ...c,
          links: (c.links ?? []).filter((l) => l.href !== HREF),
        })),
      } as never,
      depth: 0,
      req,
    });
  }
}
