import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Vizulla Browser app icon (vizulla-browser: vizulla/app/icons/icon.svg):
 * two panes meeting in a V on a blue tile. Geometry and colours unchanged.
 */
export function VizullaLogo({
  className,
  title = "Vizulla",
}: {
  className?: string;
  title?: string | null;
}) {
  const id = useId();
  return (
    <svg
      viewBox="100 100 824 824"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x="100" y="100" width="824" height="824" rx="186" fill={`url(#${id}-tile)`} />
      <g strokeLinecap="round" strokeWidth="136" fill="none">
        <line x1="650" y1="312" x2="512" y2="712" stroke="#ffffff" strokeOpacity="0.55" />
        <line x1="374" y1="312" x2="512" y2="712" stroke="#ffffff" />
      </g>
    </svg>
  );
}
