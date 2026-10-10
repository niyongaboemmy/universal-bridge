import { Fragment } from "react";

/** Renders "*word*" from the CMS as an orange accent word (UI/UX §7). */
export function AccentText({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="accent-word">
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain-text version for metadata and aria labels. */
export const stripAccents = (text?: string | null) => (text ?? "").replace(/\*/g, "");
