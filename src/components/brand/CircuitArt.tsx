import { cn } from "@/lib/utils";

/**
 * Static circuit-trace field for Night heroes (UI/UX §10.2 fallback). Thin,
 * sparse lines ending in large hollow ring nodes; the canvas version layers on in S5.
 */
const TRACES = [
  "M0 120 H140 l40 40 H320 l30 -30 H520",
  "M60 260 H220 l30 -30 H420 l40 40 H640",
  "M0 400 H180 l40 -40 H360",
  "M280 40 V120 l40 40 V300 l-30 30 V440",
  "M520 0 V80 l-40 40 V240 l40 40 H700",
  "M440 520 V420 l40 -40 H700",
];
const NODES: [number, number][] = [
  [520, 130],
  [640, 270],
  [360, 360],
  [290, 440],
  [700, 280],
  [700, 380],
  [140, 120],
  [60, 260],
];

export function CircuitArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 720 520"
      preserveAspectRatio="xMidYMid slice"
      className={cn("circuit-art text-circuit", className)}
    >
      {/* Holes inside each ring: traces stop at the ring's edge, centres stay transparent. */}
      <mask id="ub-circuit-holes" maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="520">
        <rect width="720" height="520" fill="#fff" />
        {NODES.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8.75" fill="#000" />
        ))}
      </mask>
      <g
        mask="url(#ub-circuit-holes)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {TRACES.map((d, i) => (
          <path
            key={i}
            d={d}
            className="circuit-art__trace"
            style={{ "--i": i } as React.CSSProperties}
            pathLength={1}
          />
        ))}
      </g>
      {/* Large hollow ring nodes (brand motif): the trace stops at the ring's edge. */}
      <g fill="none" stroke="currentColor" strokeWidth="2.5">
        {NODES.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="10" />
        ))}
      </g>
      <circle cx="520" cy="130" r="5" fill="var(--accent-spark)" className="circuit-art__spark" />
    </svg>
  );
}
