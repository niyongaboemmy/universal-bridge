import { cn } from "@/lib/utils";
import { Monogram } from "./Monogram";

/**
 * Horizontal logo (SRS §4.4): UB master monogram | orange divider |
 * "Universal Bridge Ltd". Matches the supplied horizontal logos:
 * - brand: master blue (#0145B8) in Daylight, brighter blue on dark backgrounds
 * - white: white mark and wordmark with orange wedge and "Ltd" (on blue/navy)
 * The wordmark is live text until vector outlines are supplied (OI-07).
 */
export function Logo({
  className,
  compact = false,
  variant = "brand",
}: {
  className?: string;
  compact?: boolean;
  variant?: "brand" | "white";
  priority?: boolean;
}) {
  // Default ink follows the surface: white on dark, master blue on light.
  const ink =
    variant === "white" ? "text-white" : "text-[var(--logo-ink)] transition-colors duration-300";
  return (
    <span data-logo className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}>
      <Monogram title={null} className={cn("h-8 w-auto shrink-0", ink)} />
      {!compact && (
        <>
          {/* Phones: a smaller wordmark, and "Ltd" only from 400 px (audit v2 V-5). */}
          <span aria-hidden className="h-6 w-[2px] rounded-full bg-ub-orange-500 sm:h-7" />
          <span
            aria-hidden
            className={cn(
              "font-display text-[0.9375rem] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap sm:text-[1.125rem]",
              ink,
            )}
          >
            Universal Bridge <span className="text-ub-orange-500 max-[399px]:hidden">Ltd</span>
          </span>
        </>
      )}
      <span className="sr-only">Universal Bridge Ltd</span>
    </span>
  );
}
