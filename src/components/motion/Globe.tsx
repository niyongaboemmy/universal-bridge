export type Place = { name: string; lat: number; lng: number };

/**
 * UI/UX §10.5 Kigali → World: a dotted globe centred on Kigali, with arcs to the
 * markets UB serves.
 *
 * Two layers: a pre-rendered frame of the same globe for the current theme
 * (static, ~50 KB, lazy) and
 * the live WebGL globe (cobe, drawn by lib/fx/globe) that fades in over it on
 * capable devices. Without WebGL, under reduced motion or Lite mode, visitors
 * still see the globe — just still. The list beside it carries the same facts
 * for screen readers.
 */
export function Globe({ places, className }: { places: Place[]; className?: string }) {
  return (
    <div
      data-fx="globe"
      data-globe
      data-places={JSON.stringify(places)}
      aria-hidden
      className={className}
    >
      <div className="relative aspect-square w-full">
        {/* Pre-rendered frames, one per theme (only the visible one is fetched). */}
        {(["dark", "light"] as const).map((tone) => (
          // eslint-disable-next-line @next/next/no-img-element -- static brand asset with srcset; next/image adds nothing here
          <img
            key={tone}
            src={`/brand/globe-kigali${tone === "light" ? "-light" : ""}-560.webp`}
            srcSet={`/brand/globe-kigali${tone === "light" ? "-light" : ""}-560.webp 560w, /brand/globe-kigali${tone === "light" ? "-light" : ""}-1120.webp 1120w`}
            sizes="(min-width: 1024px) 560px, 100vw"
            alt=""
            loading="lazy"
            decoding="async"
            width={560}
            height={560}
            className={`globe-fallback globe-fallback--${tone} absolute inset-0 size-full`}
          />
        ))}
        <canvas className="globe-canvas absolute inset-0 size-full cursor-grab touch-pan-y" />
      </div>
    </div>
  );
}
