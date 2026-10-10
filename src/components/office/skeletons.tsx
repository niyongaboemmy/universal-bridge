/** Loading shapes for office pages: shown at once on navigation while data loads. */
export function BoardSkeleton({ cards = 5, columns = 5 }: { cards?: number; columns?: number }) {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="Loading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-2">
          <div className="office-skeleton h-7 w-56" />
          <div className="office-skeleton h-4 w-80 max-w-full" />
        </div>
        <div className="office-skeleton h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="office-skeleton h-20" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="office-skeleton h-10 min-w-56 flex-1" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="office-skeleton h-10 w-36" />
        ))}
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: columns }, (_, c) => (
          <div key={c} className="grid w-72 shrink-0 content-start gap-2 rounded-2xl border border-subtle p-2">
            <div className="office-skeleton h-6 w-28" />
            {Array.from({ length: 3 - (c % 2) }, (_, i) => (
              <div key={i} className="office-skeleton h-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="Loading">
      <div className="office-skeleton h-4 w-24" />
      <div className="office-skeleton h-8 w-72 max-w-full" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          <div className="office-skeleton h-64" />
          <div className="office-skeleton h-40" />
        </div>
        <div className="grid content-start gap-4">
          <div className="office-skeleton h-52" />
          <div className="office-skeleton h-32" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="Loading">
      <div className="grid gap-2">
        <div className="office-skeleton h-7 w-56" />
        <div className="office-skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="office-skeleton h-24" />
        ))}
      </div>
      <div className="office-skeleton h-10" />
      <div className="grid gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="office-skeleton h-14" />
        ))}
      </div>
    </div>
  );
}
