import {
  MARK_BLUE_PATH,
  MARK_NODES,
  MARK_VIEWBOX,
  MARK_WEDGE_PATH,
} from "@/components/brand/Monogram";
import { cn } from "@/lib/utils";

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Branded cover for posts and events without a photo: a Night panel with
 * circuit traces (varied by `seed`) and the monogram. Decorative only.
 */
export function CoverArt({ seed, className }: { seed: string; className?: string }) {
  const h = hash(seed);
  const traces = Array.from({ length: 4 }, (_, i) => {
    // One lane per trace (13 units apart, ±2 jitter; chamfers ≤ 8), so traces never cross.
    const y = 10 + i * 13 + ((h >>> (i * 5)) % 5) - 2;
    const x = 8 + ((h >>> (i * 3 + 2)) % 30);
    const bend = x + 14 + ((h >>> (i * 4 + 1)) % 22);
    const dy = ((h >>> (i * 2)) & 1 ? 1 : -1) * (5 + (i % 2) * 3);
    // Brand circuit style (as CircuitArt): a run, a 45° chamfer, a run.
    return { d: `M${x} ${y} H${bend} l${Math.abs(dy)} ${dy} H100`, end: [x, y] as const };
  });
  return (
    <div aria-hidden className={cn("cover-art absolute inset-0 overflow-hidden", className)}>
      <svg
        viewBox="0 0 100 62.5"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <mask
          id={`cover-holes-${h}`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100"
          height="62.5"
        >
          <rect width="100" height="62.5" fill="#fff" />
          {traces.map((t, i) => (
            <circle key={i} cx={t.end[0]} cy={t.end[1]} r="2.85" fill="#000" />
          ))}
        </mask>
        <g
          mask={`url(#cover-holes-${h})`}
          fill="none"
          stroke="var(--ub-blue-400)"
          strokeOpacity=".35"
          strokeWidth=".8"
          strokeLinejoin="round"
        >
          {traces.map((t, i) => (
            <path key={i} d={t.d} />
          ))}
        </g>
        {traces.map((t, i) => (
          <circle
            key={i}
            cx={t.end[0]}
            cy={t.end[1]}
            r="3.4"
            fill={i === h % 4 ? "var(--ub-orange-500)" : "none"}
            stroke="var(--ub-blue-400)"
            strokeOpacity=".45"
            strokeWidth="1.1"
          />
        ))}
      </svg>
      <svg
        viewBox={MARK_VIEWBOX}
        className="absolute -right-[6%] -bottom-[14%] w-[62%] opacity-15 dark:opacity-25"
      >
        <path d={MARK_BLUE_PATH} fill="var(--ub-blue-600)" />
        {MARK_NODES.map(([cx, cy, r]) => (
          <circle
            key={cx}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--ub-blue-600)"
            strokeWidth="5"
          />
        ))}
        <path d={MARK_WEDGE_PATH} fill="var(--ub-orange-500)" />
      </svg>
    </div>
  );
}
