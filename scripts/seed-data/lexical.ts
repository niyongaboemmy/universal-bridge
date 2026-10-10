// Tiny builder for Lexical rich-text JSON used by the seed.
// Lines: "## Heading", "### Heading", "- item" (consecutive → list), other lines → paragraphs.
// Inline **bold** is supported.

type Node = Record<string, unknown>;

const text = (t: string, format = 0): Node => ({
  type: "text",
  version: 1,
  text: t,
  format,
  detail: 0,
  mode: "normal",
  style: "",
});

function inline(line: string): Node[] {
  return line
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith("**") ? text(part.slice(2, -2), 1) : text(part)));
}

const base = { version: 1, direction: "ltr", format: "", indent: 0 };

export function lexical(source: string) {
  const children: Node[] = [];
  let list: Node | null = null;
  for (const raw of source.trim().split("\n")) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }
    if (line.startsWith("- ")) {
      if (!list) {
        list = { ...base, type: "list", listType: "bullet", start: 1, tag: "ul", children: [] };
        children.push(list);
      }
      (list.children as Node[]).push({
        ...base,
        type: "listitem",
        value: (list.children as Node[]).length + 1,
        children: inline(line.slice(2)),
      });
      continue;
    }
    list = null;
    const h = /^(#{2,3}) (.*)$/.exec(line);
    if (h)
      children.push({
        ...base,
        type: "heading",
        tag: h[1] === "##" ? "h2" : "h3",
        children: inline(h[2]!),
      });
    else children.push({ ...base, type: "paragraph", textFormat: 0, children: inline(line) });
  }
  return { root: { ...base, type: "root", children } };
}
