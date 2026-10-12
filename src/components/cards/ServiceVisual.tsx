import { cn } from "@/lib/utils";
import { CodeLines, SECTOR_VISUALS } from "./SectorVisuals";

/**
 * Live mini-diagrams for service cards: one per service, picked by its icon.
 * Inline SVG + CSS only (no JavaScript, theme tokens throughout), decorative
 * (aria-hidden). Parts draw in as the card scrolls into view and then keep a
 * quiet loop going (a pulse, a scrolling signal) so the grid feels alive.
 * Figures are illustrative UI, not company statistics. Reduced motion and
 * Lite mode show the final, still state (globals.css, "svc-*").
 */
export function ServiceVisual({
  icon,
  feature,
  className,
}: {
  icon?: string | null;
  feature?: boolean;
  className?: string;
}) {
  const Visual = feature ? Pipeline : (VISUALS[icon ?? ""] ?? Sparkline);
  return (
    <div aria-hidden className={cn("svc-visual relative select-none", className)}>
      <Visual />
    </div>
  );
}

const label = "fill-[var(--text-muted)] font-mono text-[9px] tracking-[0.12em] uppercase";
const value = "fill-[var(--text-primary)] font-display text-[15px] font-semibold";

/** Custom software (feature tile): plan → build → test → ship, a release travelling through, and weekly releases. */
function Pipeline() {
  const stages = ["Plan", "Build", "Test", "Ship"];
  const bars = [6, 9, 7, 11, 10, 13, 12, 15, 14, 17, 16, 19];
  return (
    <svg viewBox="0 0 480 210" className="h-full w-full">
      <path
        className="svc-draw"
        pathLength={1}
        d="M40 60 H440"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeDasharray="1"
      />
      {stages.map((s, i) => {
        const x = 40 + i * 133.3;
        return (
          <g key={s} className="svc-pop" style={{ "--d": i } as React.CSSProperties}>
            <circle
              cx={x}
              cy="60"
              r="18"
              fill="var(--bg-surface)"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
            />
            <circle
              className="svc-stage"
              style={{ "--d": i } as React.CSSProperties}
              cx={x}
              cy="60"
              r="7"
              fill="var(--accent-primary)"
            />
            <text x={x} y="102" textAnchor="middle" className={label}>
              {s}
            </text>
          </g>
        );
      })}
      {/* A release travelling down the pipeline */}
      <circle
        className="svc-travel"
        r="5"
        fill="var(--accent-spark)"
        style={{ offsetPath: "path('M40 60 H440')" } as React.CSSProperties}
      />
      {/* Releases per week */}
      <text x="40" y="140" className={label}>
        Releases / week
      </text>
      <g>
        {bars.map((h, i) => (
          <rect
            key={i}
            className="svc-grow"
            style={{ "--d": i } as React.CSSProperties}
            x={40 + i * 33.4}
            y={200 - h * 2.4}
            width="20"
            height={h * 2.4}
            rx="4"
            fill={
              i === bars.length - 1
                ? "var(--accent-spark)"
                : "color-mix(in oklab, var(--accent-primary) 30%, transparent)"
            }
          />
        ))}
      </g>
    </svg>
  );
}

/** Web & mobile: a page loading (skeleton shimmer) beside a performance score. */
function Devices() {
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <rect
        x="1"
        y="4"
        width="150"
        height="88"
        rx="10"
        fill="var(--bg-surface)"
        stroke="var(--border-strong)"
      />
      <circle cx="14" cy="15" r="2.5" fill="var(--border-strong)" />
      <circle cx="22" cy="15" r="2.5" fill="var(--border-strong)" />
      <rect
        className="svc-shimmer"
        x="12"
        y="28"
        width="90"
        height="8"
        rx="4"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-shimmer"
        style={{ "--d": 1 } as React.CSSProperties}
        x="12"
        y="44"
        width="126"
        height="6"
        rx="3"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-shimmer"
        style={{ "--d": 2 } as React.CSSProperties}
        x="12"
        y="56"
        width="104"
        height="6"
        rx="3"
        fill="var(--accent-primary-soft)"
      />
      <rect x="12" y="72" width="44" height="12" rx="6" fill="var(--accent-spark)" />
      <rect
        x="160"
        y="14"
        width="56"
        height="78"
        rx="11"
        fill="var(--bg-surface)"
        stroke="var(--border-strong)"
      />
      {/* Performance score ring */}
      <circle cx="188" cy="46" r="16" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
      <circle
        className="svc-ring"
        cx="188"
        cy="46"
        r="16"
        fill="none"
        stroke="var(--success)"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        style={{ "--v": 98 } as React.CSSProperties}
        transform="rotate(-90 188 46)"
      />
      <text
        x="188"
        y="50"
        textAnchor="middle"
        className="fill-[var(--text-primary)] text-[11px] font-semibold"
      >
        98
      </text>
      <text x="188" y="80" textAnchor="middle" className={label}>
        Perf
      </text>
    </svg>
  );
}

/** Cloud & DevOps: uptime ticks, a new healthy check arriving every few seconds. */
function Uptime() {
  const ticks = Array.from({ length: 30 }, (_, i) => (i === 11 ? "warn" : "ok"));
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Uptime · 30 days
      </text>
      <text x="240" y="14" textAnchor="end" className={value}>
        99.9%
      </text>
      <g>
        {ticks.map((t, i) => (
          <rect
            key={i}
            className={cn("svc-grow", i === ticks.length - 1 && "svc-blink")}
            style={{ "--d": i * 0.4 } as React.CSSProperties}
            x={i * 8}
            y="30"
            width="5.5"
            height="40"
            rx="2"
            fill={t === "warn" ? "var(--warning)" : "var(--success)"}
            opacity={t === "warn" ? 0.9 : 0.75}
          />
        ))}
      </g>
      <text x="0" y="90" className={label}>
        Deploys automated
      </text>
      <circle className="svc-dot" cx="234" cy="87" r="3" fill="var(--success)" />
    </svg>
  );
}

/** AI & data: actuals, a dashed forecast and its confidence band. */
function Forecast() {
  const actual = "M0 70 C 20 66, 30 58, 50 60 S 80 44, 100 48 S 130 36, 150 38";
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Demand forecast
      </text>
      {[34, 56, 78].map((y) => (
        <line
          key={y}
          x1="0"
          x2="240"
          y1={y}
          y2={y}
          stroke="var(--border-subtle)"
          strokeDasharray="2 4"
        />
      ))}
      <path
        className="svc-fade"
        d="M150 38 C 175 30, 200 20, 240 14 L 240 42 C 200 46, 175 48, 150 44 Z"
        fill="color-mix(in oklab, var(--accent-spark) 16%, transparent)"
      />
      <path
        className="svc-draw"
        pathLength={1}
        d={actual}
        fill="none"
        stroke="var(--accent-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
      />
      <path
        className="svc-draw svc-draw--late"
        pathLength={1}
        d="M150 38 C 175 34, 200 30, 240 27"
        fill="none"
        stroke="var(--accent-spark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
      />
      <path
        d="M150 38 C 175 34, 200 30, 240 27"
        fill="none"
        stroke="var(--bg-surface)"
        strokeWidth="3"
        strokeDasharray="0 7"
        strokeLinecap="round"
        className="svc-fade"
      />
      <circle className="svc-dot" cx="150" cy="38" r="4" fill="var(--accent-primary)" />
      <text x="150" y="92" textAnchor="middle" className={label}>
        Today
      </text>
    </svg>
  );
}

/** Embedded & IoT: a live sensor signal scrolling, with a threshold and an alert. */
function Signal() {
  // Two identical periods so the scroll loops seamlessly.
  const period =
    "C 15 30, 25 30, 40 48 S 65 66, 80 48 S 105 22, 120 40 S 145 64, 160 48 S 185 34, 200 46 S 225 58, 240 48";
  const d = `M0 48 ${period} ${period.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (_, x, y) => `${Number(x) + 240} ${y}`)}`;
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full overflow-hidden">
      <text x="0" y="12" className={label}>
        Soil moisture · live
      </text>
      <line
        x1="0"
        x2="240"
        y1="30"
        y2="30"
        stroke="var(--accent-spark)"
        strokeDasharray="3 4"
        opacity=".7"
      />
      <g className="svc-scroll">
        <path
          d={d}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </g>
      <rect
        x="168"
        y="70"
        width="72"
        height="20"
        rx="10"
        fill="color-mix(in oklab, var(--accent-spark) 14%, transparent)"
      />
      <circle className="svc-dot" cx="180" cy="80" r="3" fill="var(--accent-spark)" />
      <text x="190" y="83.5" className="fill-[var(--accent-spark-text)] text-[9px] font-semibold">
        SMS alert
      </text>
    </svg>
  );
}

/** UI/UX & design: a wireframe, a palette and a type specimen. */
function DesignKit() {
  const swatches = [
    "var(--accent-primary)",
    "var(--accent-spark)",
    "var(--text-primary)",
    "var(--accent-primary-soft)",
  ];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <rect
        x="1"
        y="4"
        width="118"
        height="88"
        rx="10"
        fill="var(--bg-surface)"
        stroke="var(--border-strong)"
        strokeDasharray="4 4"
      />
      <rect
        className="svc-pop"
        x="12"
        y="16"
        width="96"
        height="30"
        rx="6"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-pop"
        style={{ "--d": 1 } as React.CSSProperties}
        x="12"
        y="54"
        width="44"
        height="28"
        rx="6"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-pop"
        style={{ "--d": 2 } as React.CSSProperties}
        x="64"
        y="54"
        width="44"
        height="28"
        rx="6"
        fill="var(--accent-primary-soft)"
      />
      {/* Cursor dragging a frame into place */}
      <g className="svc-cursor">
        <path
          d="M70 26 l12 6 -5 1.5 -2.5 5 z"
          fill="var(--accent-spark)"
          stroke="var(--bg-surface)"
          strokeWidth="1"
        />
      </g>
      {swatches.map((c, i) => (
        <circle
          key={i}
          className="svc-pop"
          style={{ "--d": i + 1 } as React.CSSProperties}
          cx={140 + i * 26}
          cy="22"
          r="10"
          fill={c}
          stroke="var(--border-subtle)"
        />
      ))}
      <text
        x="132"
        y="74"
        className="fill-[var(--text-primary)] font-display text-[30px] font-bold"
      >
        Aa
      </text>
      <text x="182" y="62" className={label}>
        Display
      </text>
      <text x="182" y="76" className={label}>
        Body
      </text>
      <text x="182" y="90" className={label}>
        Mono
      </text>
    </svg>
  );
}

/** IT consulting: a roadmap — phases on a timeline with a "today" marker. */
function Roadmap() {
  const rows = [
    { x: 0, w: 70, c: "var(--accent-primary)" },
    { x: 50, w: 90, c: "color-mix(in oklab, var(--accent-primary) 55%, transparent)" },
    { x: 120, w: 80, c: "var(--accent-spark)" },
    { x: 170, w: 70, c: "color-mix(in oklab, var(--accent-spark) 45%, transparent)" },
  ];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <text key={q} x={i * 60 + 2} y="10" className={label}>
          {q}
        </text>
      ))}
      {rows.map((r, i) => (
        <rect
          key={i}
          className="svc-grow-x"
          style={{ "--d": i } as React.CSSProperties}
          x={r.x}
          y={20 + i * 18}
          width={r.w}
          height="10"
          rx="5"
          fill={r.c}
        />
      ))}
      <line
        className="svc-today"
        x1="128"
        x2="128"
        y1="16"
        y2="94"
        stroke="var(--text-primary)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <circle className="svc-today" cx="128" cy="16" r="3" fill="var(--text-primary)" />
    </svg>
  );
}

/** Managed IT: support tickets resolved within the agreed time. */
function Sla() {
  const bars = [52, 44, 60, 38, 48, 34, 30];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Response time
      </text>
      <text x="240" y="14" textAnchor="end" className={value}>
        Within SLA
      </text>
      <line
        x1="0"
        x2="240"
        y1="36"
        y2="36"
        stroke="var(--accent-spark)"
        strokeDasharray="3 4"
        opacity=".7"
      />
      <text x="240" y="32" textAnchor="end" className="fill-[var(--accent-spark-text)] text-[8px]">
        SLA
      </text>
      {bars.map((h, i) => (
        <rect
          key={i}
          className="svc-grow"
          style={{ "--d": i } as React.CSSProperties}
          x={6 + i * 34}
          y={92 - h}
          width="20"
          height={h}
          rx="5"
          fill="color-mix(in oklab, var(--success) 55%, transparent)"
        />
      ))}
      <circle className="svc-dot" cx="223" cy="56" r="3" fill="var(--success)" />
    </svg>
  );
}

/** Fallback: a simple growing line. */
function Sparkline() {
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <path
        className="svc-draw"
        pathLength={1}
        d="M0 80 C 40 70, 60 76, 90 58 S 150 40, 180 34 S 220 18, 240 14"
        fill="none"
        stroke="var(--accent-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
      />
    </svg>
  );
}

const VISUALS: Record<string, () => React.ReactElement> = {
  code: CodeLines,
  smartphone: Devices,
  cloud: Uptime,
  brain: Forecast,
  cpu: Signal,
  palette: DesignKit,
  compass: Roadmap,
  "life-buoy": Sla,
  ...SECTOR_VISUALS,
};
