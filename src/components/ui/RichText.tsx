import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { createElement } from "react";
import { headingId, nodeText } from "@/lib/richtext";
import { cn } from "@/lib/utils";

// Headings get stable ids so the table of contents and scroll trace can link to them.
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const tag = ["h2", "h3", "h4"].includes(node.tag) ? node.tag : "h2";
    return createElement(
      tag,
      { id: headingId(nodeText(node as never)) },
      nodesToJSX({ nodes: node.children }),
    );
  },
});

/** Rendered from Lexical JSON on the server — never raw HTML (ADR-006). */
export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data || typeof data !== "object") return null;
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={cn("prose-ub", className)}
    />
  );
}
