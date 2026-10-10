/** Shown while a dashboard page loads: the shape of what's coming, shimmering. */
export default function Loading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading">
      <div className="grid gap-2">
        <div className="office-skeleton h-7 w-64" />
        <div className="office-skeleton h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="office-skeleton h-28" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="office-skeleton h-72" />
        <div className="office-skeleton h-72" />
      </div>
    </div>
  );
}
