import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

// Data only: links /kubika on sites seeded before the page existed, in the footer's
// Company column (after Vizulla Browser, else after Products). The Solutions
// highlight panel already shows Vizulla. Skips entirely if any link to the page
// exists, so editors' changes are kept.
const HREF = "/kubika";
const LOCALES = ["en", "fr", "rw"] as const;
const LABEL = "Kubika";

type Link = { id?: string | null; href?: string; label?: string };
type Column = { id?: string | null; title?: string; links?: Link[] | null };
type Nav = { items?: unknown[] | null; footerColumns?: Column[] | null };

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const read = (locale: (typeof LOCALES)[number]) =>
    payload.findGlobal({ slug: "navigation", locale, fallbackLocale: false, depth: 0, req }) as Promise<Nav>;
  const en = await read("en");
  // An empty site gets the link from the seed instead.
  if (!en.footerColumns?.length || JSON.stringify(en).includes(`"${HREF}"`)) return;

  const company = en.footerColumns.findIndex((c) => c.links?.some((l) => l.href === "/products"));
  if (company < 0) return;
  // English first creates the footer row; the other locales then label the same row.
  for (const locale of LOCALES) {
    const doc = locale === "en" ? en : await read(locale);
    const footerColumns = (doc.footerColumns ?? []).map((c, i) => {
      if (i !== company) return c;
      const links = [...(c.links ?? [])];
      const existing = links.find((l) => l.href === HREF);
      if (existing) existing.label = LABEL;
      else {
        const after = links.findIndex((l) => l.href === "/vizulla-browser");
        const at = after >= 0 ? after : links.findIndex((l) => l.href === "/products");
        links.splice(at + 1, 0, { label: LABEL, href: HREF });
      }
      return { ...c, links };
    });
    await payload.updateGlobal({ slug: "navigation", locale, data: { footerColumns } as never, depth: 0, req });
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
