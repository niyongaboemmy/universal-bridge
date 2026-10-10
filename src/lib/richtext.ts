// Helpers for Lexical JSON (server-safe, no React).
type LexNode = { type?: string; tag?: string; text?: string; children?: LexNode[] };

export function nodeText(node: LexNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(nodeText).join("");
}

export function headingId(text: string) {
  return (
    "h-" +
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}

/** h2/h3 headings for a table of contents (FR-BLOG-02). */
export function tableOfContents(data: unknown): { id: string; text: string; level: 2 | 3 }[] {
  const root = (data as { root?: LexNode } | null)?.root;
  if (!root) return [];
  return (root.children ?? [])
    .filter((n) => n.type === "heading" && (n.tag === "h2" || n.tag === "h3"))
    .map((n) => {
      const text = nodeText(n);
      return { id: headingId(text), text, level: n.tag === "h2" ? 2 : 3 } as const;
    });
}

/** ~200 words per minute; at least 1. */
export function readingMinutes(data: unknown): number {
  const root = (data as { root?: LexNode } | null)?.root;
  const words = root ? nodeText(root).split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 200));
}
