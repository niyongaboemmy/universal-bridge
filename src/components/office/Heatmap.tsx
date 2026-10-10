/** Calendar heatmap (weeks × weekdays), like a contribution graph. Server-rendered. */
export function Heatmap({ days }: { days: { day: string; n: number }[] }) {
  if (!days.length) return null;
  const max = Math.max(...days.map((d) => d.n), 1);
  // Pad the start so columns are Monday-first weeks.
  const first = new Date(`${days[0]!.day}T12:00:00Z`).getUTCDay();
  const pad = (first + 6) % 7;
  const cells: ({ day: string; n: number } | null)[] = [...Array(pad).fill(null), ...days];
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const level = (n: number) => (n === 0 ? 0 : Math.ceil((n / max) * 4));
  const total = days.reduce((s, d) => s + d.n, 0);
  const active = days.filter((d) => d.n > 0).length;
  return (
    <figure>
      <div
        className="grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-[3px]"
        role="img"
        aria-label={`${total} actions on ${active} days`}
      >
        {weeks.map((w, i) => (
          <div key={i} className="grid grid-rows-7 gap-[3px]">
            {w.map((c, j) =>
              c ? (
                <span
                  key={j}
                  title={`${c.day}: ${c.n} ${c.n === 1 ? "action" : "actions"}`}
                  className="aspect-square w-full max-w-4 rounded-[3px] transition-transform hover:scale-150"
                  style={{
                    background:
                      level(c.n) === 0
                        ? "color-mix(in oklab, var(--text-primary) 9%, transparent)"
                        : `color-mix(in oklab, var(--accent-primary) ${20 + level(c.n) * 20}%, transparent)`,
                  }}
                />
              ) : (
                <span key={j} className="aspect-square w-full max-w-4" />
              ),
            )}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex items-center justify-between text-[0.75rem] text-fg-muted">
        <span>
          {total} actions · {active} active days
        </span>
        <span className="flex items-center gap-1">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="size-2.5 rounded-[3px]"
              style={{
                background:
                  l === 0
                    ? "color-mix(in oklab, var(--text-primary) 9%, transparent)"
                    : `color-mix(in oklab, var(--accent-primary) ${20 + l * 20}%, transparent)`,
              }}
            />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  );
}
