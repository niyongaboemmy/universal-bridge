import { cn } from "@/lib/utils";

/**
 * Section divider in the brand circuit style (as CircuitArt): thick, subtle
 * traces with 45° chamfers ending in large hollow rings. Drawn 1:1 (the wide
 * viewBox is cropped, never stretched), so the rings stay round. Decorative.
 */
export function CircuitDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 2400 48"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-12 w-full text-circuit", className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 42 H1110 l20 -20 H1150" strokeWidth="3" />
        <path d="M1250 22 H1270 l20 20 H2400" strokeWidth="3" />
        <circle cx="1170" cy="22" r="18" strokeWidth="4" />
        <circle cx="1230" cy="22" r="18" strokeWidth="4" />
      </g>
    </svg>
  );
}
