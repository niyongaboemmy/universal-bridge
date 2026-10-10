import { ChevronDown } from "lucide-react";

/**
 * FAQ accordion on native <details>: keyboard and screen-reader support for
 * free, zero JS. Height animates where `interpolate-size` is supported.
 */
export function Accordion({
  items,
}: {
  items: { id: string | number; question: string; answer: string }[];
}) {
  return (
    <div className="divide-y divide-subtle rounded-xl border border-subtle bg-surface">
      {items.map((item) => (
        <details key={item.id} className="accordion group px-5 sm:px-6">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-heading-md [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-fg-muted transition-transform duration-[var(--dur-base)] group-open:rotate-180"
            />
          </summary>
          <p className="pb-5 text-fg-secondary">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
