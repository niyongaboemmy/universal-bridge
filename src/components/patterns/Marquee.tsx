import type { ReactNode } from "react";

/**
 * Logo marquee (FR-HOME-02): CSS only, pauses on hover/focus, the duplicate
 * track is aria-hidden, and it becomes a static wrap under reduced motion.
 */
export function Marquee({
  items,
  label,
}: {
  items: { key: string; node: ReactNode }[];
  label: string;
}) {
  return (
    <div className="marquee group relative overflow-hidden" role="region" aria-label={label}>
      <div className="marquee__track flex w-max gap-14">
        <ul className="flex shrink-0 items-center gap-14">
          {items.map((i) => (
            <li key={i.key}>{i.node}</li>
          ))}
        </ul>
        <ul aria-hidden className="marquee__dup flex shrink-0 items-center gap-14">
          {items.map((i) => (
            <li key={i.key}>{i.node}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
