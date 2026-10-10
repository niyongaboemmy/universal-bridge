import type { ReactNode } from "react";
import { editable, type EditRef } from "@/lib/live-edit/attrs";
import { cn } from "@/lib/utils";
import { AccentText } from "./AccentText";

/** Eyebrow (mono) + title + lead (UI/UX §13). */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Heading = "h2",
  action,
  className,
  id,
  edit,
}: {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  align?: "left" | "center";
  as?: "h1" | "h2";
  action?: ReactNode;
  className?: string;
  id?: string;
  /** Live editing: the block these fields belong to. */
  edit?: EditRef;
}) {
  if (!title && !eyebrow) return null;
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="eyebrow" {...editable(edit, "eyebrow", "text", eyebrow)}>
            {eyebrow}
          </p>
        )}
        {title && (
          <Heading
            id={id}
            className={cn("mt-4", Heading === "h1" ? "text-display-xl" : "text-display-lg")}
            {...editable(edit, "title", "accent", title)}
          >
            <AccentText text={title} />
          </Heading>
        )}
        {lead && (
          <p
            className="mt-5 max-w-xl text-body-lg text-fg-secondary"
            {...editable(edit, "lead", "textarea", lead)}
          >
            {lead}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
