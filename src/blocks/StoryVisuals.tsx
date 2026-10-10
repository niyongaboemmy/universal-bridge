import { Monogram } from "@/components/brand/Monogram";

// Illustrations for the Ideas → Code → Impact story (UI/UX §14.2: HTML/CSS/SVG,
// sharp at any size, light to load). Theme tokens throughout, so they read on
// white paper and on navy. In the pinned desktop stage the `sv-*` parts are
// driven by the step's scroll timeline (globals.css); elsewhere they show their
// final state.

/** 01 · Ideas — a whiteboard: notes connect into a plan; two collaborators' cursors. */
export function IdeasVisual() {
  const notes = [
    {
      text: "Farmers need prices before market day",
      dot: "bg-spark",
      cls: "-rotate-2",
      x: "6%",
      y: "8%",
    },
    { text: "SMS works on every phone", dot: "bg-accent", cls: "rotate-1", x: "37%", y: "4%" },
    {
      text: "Co-op managers: one dashboard",
      dot: "bg-spark",
      cls: "rotate-[1.5deg]",
      x: "68%",
      y: "10%",
    },
  ];
  const plan = ["Price feed from 3 markets", "SMS alerts in Kinyarwanda", "Weekly co-op report"];
  return (
    <div className="sv-board relative h-full w-full overflow-hidden rounded-2xl border border-subtle bg-surface shadow-3">
      {/* Dotted whiteboard */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1px,transparent_1.3px)] [background-size:18px_18px] opacity-60"
      />
      {/* Connectors: each note feeds the plan */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <g
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
          opacity=".55"
        >
          <path className="sv-fade" d="M70 66 C 80 140, 140 160, 170 190" />
          <path className="sv-fade" d="M200 58 C 200 120, 200 150, 200 188" />
          <path className="sv-fade" d="M330 70 C 320 140, 260 160, 230 190" />
        </g>
      </svg>
      {notes.map((n) => (
        <div
          key={n.text}
          className={`sv-pop absolute w-[27%] rounded-xl border border-subtle bg-surface-raised p-2.5 text-[0.7rem] leading-snug font-medium text-fg shadow-2 transition-transform duration-500 hover:rotate-0 sm:p-3 sm:text-[0.8rem] ${n.cls}`}
          style={{ left: n.x, top: n.y }}
        >
          <span className={`mb-1.5 block h-1 w-6 rounded-full ${n.dot}`} />
          {n.text}
        </div>
      ))}
      {/* The plan */}
      <div className="sv-pop absolute right-[16%] bottom-[8%] left-[16%] rounded-xl border border-subtle bg-surface-raised p-3 shadow-3 sm:p-4">
        <p className="font-mono text-[0.6rem] tracking-[0.18em] text-fg-muted uppercase">
          Plan · v1
        </p>
        <ul className="mt-2 space-y-1.5">
          {plan.map((item, i) => (
            <li
              key={item}
              className="flex items-center gap-2 text-[0.72rem] text-fg sm:text-[0.8rem]"
            >
              <svg viewBox="0 0 16 16" className="size-4 shrink-0">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="var(--accent-primary-soft)"
                  stroke="var(--accent-primary)"
                  strokeWidth="1.2"
                />
                <path
                  className="sv-draw"
                  pathLength={1}
                  style={{ "--d": i } as React.CSSProperties}
                  d="M4.8 8.2 7 10.3 11.3 5.9"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* Collaborators */}
      <Cursor
        className="sv-cursor-a"
        color="var(--accent-spark)"
        ink="var(--on-spark)"
        label="You"
      />
      <Cursor
        className="sv-cursor-b"
        color="var(--accent-primary)"
        ink="var(--on-accent)"
        label="UB"
      />
    </div>
  );
}

function Cursor({
  className,
  color,
  ink,
  label,
}: {
  className: string;
  color: string;
  ink: string;
  label: string;
}) {
  return (
    <div className={`sv-cursor absolute ${className}`}>
      <svg viewBox="0 0 16 16" className="size-4 drop-shadow">
        <path d="M2 1.5 14 7.2 8.3 8.6 5.6 14.2Z" fill={color} stroke="white" strokeWidth="1" />
      </svg>
      <span
        className="ml-3 -mt-0.5 inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-semibold shadow-2"
        style={{ background: color, color: ink }}
      >
        {label}
      </span>
    </div>
  );
}

/** 02 · Code — the editor, then the pipeline. Light or One Dark editor theme (globals.css). */
export function CodeVisual() {
  const lines = [
    ["kw", "export async function", "fn", " sendPriceAlert", "", "(farmer) {"],
    ["", "  const price = ", "fn", "await market.today", "", "(farmer.crop);"],
    ["", "  ", "kw", "return", "", " sms.send(farmer.phone, price);"],
    ["", "}", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["fn", "test", "", "", "", '("alert reaches every farmer", async () => {'],
    ["", "  expect(", "fn", "await sendPriceAlert", "", '(farmer)).toBe("sent");'],
    ["", "});", "", "", "", ""],
  ];
  const tone = (t: string) =>
    t === "kw" ? "text-[var(--cw-kw)]" : t === "fn" ? "text-[var(--cw-fn)]" : "";
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />
      <div className="code-window flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--cw-line)] bg-[var(--cw-bg)] font-mono text-[0.6875rem] text-[var(--cw-fg)] shadow-4 sm:text-[0.8125rem]">
        <div className="flex items-center gap-1.5 border-b border-[var(--cw-line)] px-4 py-3">
          <span className="size-3 rounded-full bg-[var(--cw-num)]" />
          <span className="size-3 rounded-full bg-[var(--cw-num)]" />
          <span className="size-3 rounded-full bg-[var(--cw-num)]" />
          <span className="ml-3 rounded-md bg-[var(--cw-tab)] px-2.5 py-1 text-[0.7rem] text-[var(--cw-muted)]">
            price-alerts.ts
          </span>
        </div>
        <pre className="flex-1 p-4 leading-7 sm:p-6">
          {lines.map((l, i) => (
            <div key={i} className="story-code-line" style={{ "--l": i } as React.CSSProperties}>
              <span className="mr-4 text-[var(--cw-num)] select-none">{i + 1}</span>
              <span className={tone(l[0]!)}>{l[1]}</span>
              <span className={tone(l[2]!)}>{l[3]}</span>
              <span>{l[5]}</span>
              {i === lines.length - 1 && (
                <span className="sv-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-[var(--cw-fn)]" />
              )}
            </div>
          ))}
        </pre>
        {/* Terminal strip: build → tests → staging. */}
        <div className="space-y-1.5 border-t border-[var(--cw-line)] bg-[var(--cw-bar)] px-4 py-4 sm:px-6">
          <p className="text-[var(--cw-muted)]">
            <span className="text-[var(--cw-ok)]">$</span> git push origin main
          </p>
          <p className="sv-pop" style={{ "--d": 0 } as React.CSSProperties}>
            <span className="text-[var(--cw-ok)]">✓</span> build{" "}
            <span className="text-[var(--cw-muted)]">· 38s</span>
          </p>
          <p className="sv-pop" style={{ "--d": 1 } as React.CSSProperties}>
            <span className="text-[var(--cw-ok)]">✓</span> tests{" "}
            <span className="text-[var(--cw-muted)]">· accessibility · performance</span>
          </p>
          <p className="sv-pop flex items-center gap-2" style={{ "--d": 2 } as React.CSSProperties}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--cw-ok)] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--cw-ok)]" />
            </span>
            <span className="text-[var(--cw-strong)]">Live in staging</span>
            <span className="ml-auto rounded bg-spark px-2 py-0.5 text-[0.65rem] font-semibold text-on-spark">
              Demo · Friday
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/** 03 · Impact — a results card (bars + trend), the alert going out, and the app. */
export function ImpactVisual({ metric }: { metric?: string | null }) {
  const bars = [92, 84, 76, 64, 55, 44, 30];
  const pts = bars.map((h, i) => [8 + i * (84 / 6), 100 - h * 0.9] as const);
  // Smooth curve through the bar tops (Catmull-Rom → cubic Bézier), in a 100×100 box.
  const curve = pts
    .map(([x, y], i) => {
      if (!i) return `M${x} ${y}`;
      const [x0, y0] = pts[i - 2] ?? pts[i - 1]!;
      const [x1, y1] = pts[i - 1]!;
      const [x3, y3] = pts[i + 1] ?? [x, y];
      return `C${x1 + (x - x0) / 6} ${y1 + (y - y0) / 6}, ${x - (x3 - x1) / 6} ${y - (y3 - y1) / 6}, ${x} ${y}`;
    })
    .join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <div className="impact relative h-full w-full overflow-hidden rounded-2xl border border-subtle bg-surface shadow-3">
      {/* Soft brand wash: blue top-left, spark bottom-right. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_0%_0%,color-mix(in_oklab,var(--accent-primary)_16%,transparent),transparent),radial-gradient(50%_50%_at_100%_100%,color-mix(in_oklab,var(--accent-spark)_12%,transparent),transparent)]"
      />

      {/* Results card */}
      <div className="sv-pop absolute top-[7%] right-[6%] left-[6%] rounded-2xl border border-subtle bg-surface-raised p-4 shadow-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-fg-muted uppercase">
              Time to price farmers
            </p>
            <p className="mt-1 font-display text-heading-md leading-none font-semibold text-fg">
              {metric ?? "Faster every week"}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--accent-spark)_14%,transparent)] px-2 py-0.5 text-[0.65rem] font-semibold text-spark-text">
            ↓ Trending down
          </span>
        </div>
        <div className="relative mt-4 h-[clamp(5rem,30cqw,8rem)] [container-type:inline-size]">
          {/* Gridlines */}
          {[0, 33, 66].map((t) => (
            <span
              key={t}
              aria-hidden
              className="absolute inset-x-0 border-t border-dashed border-subtle"
              style={{ top: `${t}%` }}
            />
          ))}
          {/* Bars: blue gradient; the latest one is the spark "now". */}
          <div className="absolute inset-0 flex items-end justify-between gap-[9%] px-[5%]">
            {bars.map((h, i) => (
              <span
                key={i}
                className={`sv-grow block w-full rounded-t-xl rounded-b-md ${
                  i === bars.length - 1
                    ? "bg-[linear-gradient(180deg,var(--accent-spark),color-mix(in_oklab,var(--accent-spark)_35%,transparent))]"
                    : "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent-primary)_55%,transparent),color-mix(in_oklab,var(--accent-primary)_8%,transparent))]"
                }`}
                style={{ height: `${h * 0.9}%`, "--d": i } as React.CSSProperties}
              />
            ))}
          </div>
          {/* Trend line with a soft glow */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            <path
              className="sv-fade"
              d={curve}
              fill="none"
              stroke="var(--accent-spark)"
              strokeOpacity=".18"
              strokeWidth="8"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            <path
              className="sv-fade"
              d={curve}
              fill="none"
              stroke="var(--accent-spark)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="sv-pop absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--bg-surface-raised)] bg-spark shadow-[0_0_0_6px_color-mix(in_oklab,var(--accent-spark)_20%,transparent)]"
            style={{ left: `${last[0]}%`, top: `${last[1]}%`, "--d": 3 } as React.CSSProperties}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[0.58rem] tracking-[0.16em] text-fg-muted uppercase">
          <span>Before</span>
          <span className="text-spark-text">Now</span>
        </div>
      </div>

      {/* Alert going out */}
      <div className="sv-toast glass absolute bottom-[8%] left-[6%] flex w-[54%] items-center gap-3 rounded-2xl border border-subtle p-3 shadow-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.75rem] font-semibold text-fg">
            Price alert sent
          </span>
          <span className="block truncate text-[0.65rem] text-fg-secondary">
            1,240 farmers · SMS
          </span>
        </span>
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-spark text-[0.6rem] font-bold text-on-spark">
          ✓
        </span>
      </div>

      {/* The app, fully inside the card */}
      <div className="phone-ui absolute right-[6%] bottom-[6%] w-[30%] min-w-32 rotate-[4deg] rounded-[1.6rem] border border-strong bg-[var(--ph-bezel)] p-1.5 shadow-4">
        <div className="rounded-[1.3rem] p-3 text-[var(--ph-fg)] [background:var(--ph-screen)]">
          <Monogram title={null} className="h-4 w-auto text-[var(--logo-ink)]" />
          <p className="mt-3 text-[0.6rem] text-[var(--ph-muted)]">Maize · Musanze</p>
          <p className="font-display text-[1.05rem] leading-tight font-semibold">RWF 412/kg</p>
          <div className="mt-2.5 rounded-full bg-spark py-1 text-center text-[0.6rem] font-semibold text-on-spark">
            Sell today
          </div>
        </div>
      </div>
    </div>
  );
}
