/**
 * Live mini-diagrams for industry cards (Solutions), one per sector icon. Same
 * vocabulary as ServiceVisual: inline SVG, theme tokens, svc-* motion classes
 * (draw in on scroll, then a quiet loop), decorative only. Figures are
 * illustrative UI states, never company statistics.
 */

const label = "fill-[var(--text-muted)] font-mono text-[9px] tracking-[0.12em] uppercase";
const chip = "fill-[var(--text-primary)] text-[9px] font-semibold";
const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

/** Government: an e-service application moving from submitted to approved. */
function Eservice() {
  const steps = ["Submitted", "In review", "Approved"];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Permit application
      </text>
      <path
        className="svc-draw"
        pathLength={1}
        d="M20 48 H220"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeDasharray="1"
        fill="none"
      />
      {steps.map((s, i) => {
        const x = 20 + i * 100;
        const done = i < 2;
        return (
          <g key={s} className="svc-pop" style={d(i)}>
            <circle
              cx={x}
              cy="48"
              r="10"
              fill={done ? "var(--accent-primary)" : "var(--bg-surface)"}
              stroke={done ? "var(--accent-primary)" : "var(--accent-spark)"}
              strokeWidth="2"
            />
            {done && (
              <path
                d={`M${x - 4} 48 l3 3 l5 -6`}
                stroke="var(--bg-surface)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            )}
            <text
              x={x}
              y="76"
              textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
              className={label}
              dx={i === 0 ? -10 : i === 2 ? 10 : 0}
            >
              {s}
            </text>
          </g>
        );
      })}
      <circle className="svc-dot" cx="220" cy="48" r="4" fill="var(--accent-spark)" />
      <circle
        className="svc-travel"
        r="4"
        fill="var(--accent-spark)"
        style={{ offsetPath: "path('M20 48 H220')" } as React.CSSProperties}
      />
    </svg>
  );
}

/** Education: term results per class, report cards going out. */
function Classroom() {
  const bars = [44, 58, 50, 66, 62, 74];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Term results · S1–S6
      </text>
      {bars.map((h, i) => (
        <rect
          key={i}
          className="svc-grow"
          style={d(i)}
          x={4 + i * 24}
          y={92 - h}
          width="15"
          height={h}
          rx="4"
          fill={
            i === bars.length - 1
              ? "var(--accent-spark)"
              : "color-mix(in oklab, var(--accent-primary) 45%, transparent)"
          }
        />
      ))}
      <g className="svc-pop" style={d(3)}>
        <rect x="156" y="30" width="84" height="26" rx="13" fill="var(--accent-primary-soft)" />
        <circle className="svc-dot" cx="170" cy="43" r="3.5" fill="var(--success)" />
        <text x="180" y="46.5" className={chip}>
          Reports sent
        </text>
      </g>
      <g className="svc-pop" style={d(5)}>
        <rect x="156" y="62" width="84" height="26" rx="13" fill="var(--accent-primary-soft)" />
        <text x="168" y="78.5" className={chip}>
          Fees · Paid
        </text>
      </g>
    </svg>
  );
}

/** Finance: a mobile-money payment flowing to a bank, confirmed. */
function Payments() {
  const nodes = [
    { x: 24, t: "MoMo" },
    { x: 120, t: "Ledger" },
    { x: 216, t: "Bank" },
  ];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Payment flow
      </text>
      <path
        className="svc-draw"
        pathLength={1}
        d="M24 46 C 60 22, 84 22, 120 46 S 180 70, 216 46"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeDasharray="1"
        fill="none"
      />
      {nodes.map((n, i) => (
        <g key={n.t} className="svc-pop" style={d(i)}>
          <rect
            x={n.x - 20}
            y="34"
            width="40"
            height="24"
            rx="8"
            fill="var(--bg-surface)"
            stroke={i === 1 ? "var(--accent-spark)" : "var(--accent-primary)"}
            strokeWidth="1.5"
          />
          <text x={n.x} y="49.5" textAnchor="middle" className={chip}>
            {n.t}
          </text>
        </g>
      ))}
      <circle
        className="svc-travel"
        r="4"
        fill="var(--accent-spark)"
        style={
          {
            offsetPath: "path('M24 46 C 60 22, 84 22, 120 46 S 180 70, 216 46')",
          } as React.CSSProperties
        }
      />
      <g className="svc-fade">
        <rect
          x="70"
          y="70"
          width="100"
          height="20"
          rx="10"
          fill="color-mix(in oklab, var(--success) 16%, transparent)"
        />
        <text x="120" y="83.5" textAnchor="middle" className={chip}>
          ✓ Confirmed · encrypted
        </text>
      </g>
    </svg>
  );
}

/** Health: a heartbeat trace scrolling, with stock levels for a pharmacy. */
function Vitals() {
  const beat = "L 20 48 L 26 48 L 31 30 L 37 64 L 42 48 L 60 48";
  const period = `${beat} ${beat.replace(/(\d+) (\d+)/g, (_, x, y) => `${Number(x) + 60} ${y}`)}`;
  const periods = [0, 120, 240, 360].map((o) =>
    period.replace(/(\d+) (\d+)/g, (_, x, y) => `${Number(x) + o} ${y}`),
  );
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full overflow-hidden">
      <text x="0" y="12" className={label}>
        Patient monitor
      </text>
      <g className="svc-scroll">
        <path
          d={`M0 48 ${periods.join(" ")}`}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
      <rect
        x="150"
        y="72"
        width="90"
        height="20"
        rx="10"
        fill="color-mix(in oklab, var(--success) 16%, transparent)"
      />
      <circle className="svc-dot" cx="162" cy="82" r="3" fill="var(--success)" />
      <text x="172" y="85.5" className={chip}>
        Stock OK · 12
      </text>
    </svg>
  );
}

/** Agriculture: weekly rainfall and a rising yield forecast. */
function Harvest() {
  const rain = [18, 30, 24, 40, 34, 46, 38, 28];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Rainfall · yield outlook
      </text>
      {rain.map((h, i) => (
        <rect
          key={i}
          className="svc-grow"
          style={d(i)}
          x={4 + i * 30}
          y={92 - h}
          width="16"
          height={h}
          rx="4"
          fill="color-mix(in oklab, var(--accent-primary) 30%, transparent)"
        />
      ))}
      <path
        className="svc-draw svc-draw--late"
        pathLength={1}
        d="M8 70 C 50 64, 80 60, 120 50 S 190 30, 236 22"
        fill="none"
        stroke="var(--success)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1"
      />
      <circle className="svc-dot" cx="236" cy="22" r="4" fill="var(--success)" />
    </svg>
  );
}

/** Retail: stock per shop kept in sync, one running low. */
function Inventory() {
  const shops = [
    { t: "Kigali", w: 150 },
    { t: "Musanze", w: 110 },
    { t: "Online", w: 44, low: true },
  ];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Stock by shop
      </text>
      <circle className="svc-dot" cx="234" cy="9" r="3" fill="var(--success)" />
      <text x="226" y="12" textAnchor="end" className={label}>
        Synced
      </text>
      {shops.map((s, i) => (
        <g key={s.t}>
          <text x="0" y={36 + i * 24} className={label}>
            {s.t}
          </text>
          <rect x="64" y={28 + i * 24} width="176" height="10" rx="5" fill="var(--border-subtle)" />
          <rect
            className="svc-grow-x"
            style={d(i)}
            x="64"
            y={28 + i * 24}
            width={s.w}
            height="10"
            rx="5"
            fill={s.low ? "var(--accent-spark)" : "var(--accent-primary)"}
          />
        </g>
      ))}
    </svg>
  );
}

/** NGOs: field forms collected offline, syncing to a donor dashboard. */
function FieldSync() {
  const pins = [
    [22, 40],
    [48, 66],
    [70, 34],
    [36, 82],
    [88, 60],
  ];
  return (
    <svg viewBox="0 0 240 96" className="h-full w-full">
      <text x="0" y="12" className={label}>
        Field data · offline sync
      </text>
      {pins.map(([x, y], i) => (
        <circle
          key={i}
          className="svc-pop"
          style={d(i)}
          cx={x}
          cy={y}
          r="5"
          fill="var(--accent-primary)"
          stroke="var(--bg-surface)"
          strokeWidth="2"
        />
      ))}
      <path
        className="svc-draw"
        pathLength={1}
        d="M96 56 C 120 56, 130 50, 150 50"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="2"
        strokeDasharray="1"
      />
      <circle
        className="svc-travel"
        r="3.5"
        fill="var(--accent-spark)"
        style={{ offsetPath: "path('M96 56 C 120 56, 130 50, 150 50')" } as React.CSSProperties}
      />
      <rect
        x="152"
        y="26"
        width="88"
        height="62"
        rx="10"
        fill="var(--bg-surface)"
        stroke="var(--border-strong)"
      />
      <circle cx="178" cy="57" r="15" fill="none" stroke="var(--border-subtle)" strokeWidth="5" />
      <circle
        className="svc-ring"
        cx="178"
        cy="57"
        r="15"
        fill="none"
        stroke="var(--accent-spark)"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        style={{ "--v": 72 } as React.CSSProperties}
        transform="rotate(-90 178 57)"
      />
      <rect
        className="svc-shimmer"
        x="200"
        y="44"
        width="30"
        height="6"
        rx="3"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-shimmer"
        style={d(1)}
        x="200"
        y="56"
        width="22"
        height="6"
        rx="3"
        fill="var(--accent-primary-soft)"
      />
      <rect
        className="svc-shimmer"
        style={d(2)}
        x="200"
        y="68"
        width="26"
        height="6"
        rx="3"
        fill="var(--accent-primary-soft)"
      />
    </svg>
  );
}

export const SECTOR_VISUALS: Record<string, () => React.ReactElement> = {
  landmark: Eservice,
  "graduation-cap": Classroom,
  banknote: Payments,
  "heart-pulse": Vitals,
  sprout: Harvest,
  "shopping-bag": Inventory,
  "hand-heart": FieldSync,
};

/** Custom software (standard card): an editor with code lines and a passing build. */
export function CodeLines() {
  const lines = [
    { x: 14, w: 70, c: "var(--accent-primary)" },
    { x: 26, w: 96, c: "color-mix(in oklab, var(--accent-primary) 45%, transparent)" },
    { x: 26, w: 58, c: "var(--accent-spark)" },
    { x: 38, w: 84, c: "color-mix(in oklab, var(--accent-primary) 45%, transparent)" },
    { x: 14, w: 40, c: "var(--accent-primary)" },
  ];
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
      {lines.map((l, i) => (
        <g key={i}>
          <text x="6" y={23 + i * 15} className={label}>
            {i + 1}
          </text>
          <rect
            className="svc-grow-x"
            style={d(i)}
            x={l.x + 4}
            y={17 + i * 15}
            width={l.w}
            height="7"
            rx="3.5"
            fill={l.c}
          />
        </g>
      ))}
      <rect className="svc-blink" x="66" y="77" width="2" height="9" fill="var(--text-primary)" />
      <g className="svc-pop" style={d(4)}>
        <rect
          x="160"
          y="20"
          width="80"
          height="24"
          rx="12"
          fill="color-mix(in oklab, var(--success) 16%, transparent)"
        />
        <circle className="svc-dot" cx="174" cy="32" r="3.5" fill="var(--success)" />
        <text x="184" y="35.5" className={chip}>
          Build passed
        </text>
      </g>
      <g className="svc-pop" style={d(5)}>
        <rect x="160" y="52" width="80" height="24" rx="12" fill="var(--accent-primary-soft)" />
        <text x="172" y="67.5" className={chip}>
          Tests green
        </text>
      </g>
    </svg>
  );
}
