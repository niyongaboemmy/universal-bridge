import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Feature = { title: string; body?: string | null; icon?: string | null };

/**
 * Animated product phone (UI/UX audit v2 M-4): a home screen followed by one
 * screen per feature, cross-fading on a CSS loop with progress dots. Built from
 * the product's own CMS features, so it never claims UI the product doesn't
 * have. No JavaScript. Reduced motion and Lite mode show the home screen only.
 * Replaced automatically once real screenshots are uploaded.
 */
export function PhoneScreens({
  name,
  tagline,
  features,
  className,
}: {
  name: string;
  tagline?: string | null;
  features: Feature[];
  className?: string;
}) {
  const screens = features.slice(0, 3);
  const count = screens.length + 1;
  return (
    <div
      aria-hidden
      data-screens={count}
      className={cn("phone-screens phone-ui relative w-52 select-none", className)}
      style={{ "--screens": count } as React.CSSProperties}
    >
      <div className="rounded-[2.4rem] border border-strong bg-[var(--ph-bezel)] p-2.5 shadow-4">
        <div className="relative aspect-[9/17] overflow-hidden rounded-[1.9rem] [background:var(--ph-screen)] text-[var(--ph-fg)]">
          <div className="absolute inset-x-0 top-3 z-10 mx-auto h-1.5 w-14 rounded-full bg-[var(--ph-notch)]" />
          {/* Home */}
          <div
            data-home
            className="phone-screen absolute inset-0 px-4 pt-9"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <p className="font-display text-[1.05rem] font-bold">{name}</p>
            <div className="mt-1 h-1 w-10 rounded-full bg-spark" />
            {tagline && (
              <p className="mt-3 line-clamp-2 text-[0.7rem] text-[var(--ph-muted)]">{tagline}</p>
            )}
            <ul className="mt-4 space-y-2">
              {screens.map((f) => (
                <li
                  key={f.title}
                  className="flex items-center gap-2 rounded-xl bg-[var(--ph-chip)] px-3 py-2.5 text-[0.7rem] font-medium"
                >
                  <Icon name={f.icon} className="size-3.5 shrink-0 text-spark" />
                  <span className="truncate">{f.title}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* One screen per feature */}
          {screens.map((f, i) => (
            <div
              key={f.title}
              className="phone-screen absolute inset-0 flex flex-col px-4 pt-9"
              style={{ "--i": i + 1 } as React.CSSProperties}
            >
              <p className="text-[0.65rem] tracking-[0.18em] text-[var(--ph-muted)] uppercase">
                {name}
              </p>
              <span className="mt-4 flex size-11 items-center justify-center rounded-2xl bg-spark text-[var(--ub-navy-950)]">
                <Icon name={f.icon} className="size-5" />
              </span>
              <p className="mt-3 font-display text-[1rem] leading-tight font-bold">{f.title}</p>
              {f.body && (
                <p className="mt-2 line-clamp-3 text-[0.7rem] text-[var(--ph-muted)]">{f.body}</p>
              )}
              <div className="mt-auto mb-6 space-y-2">
                <div
                  className="phone-bar h-2 rounded-full bg-[var(--ph-chip)]"
                  style={{ "--w": `${55 + i * 15}%` } as React.CSSProperties}
                />
                <div className="h-2 w-2/3 rounded-full bg-[var(--ph-chip)]" />
                <div className="mt-3 rounded-full bg-spark py-2 text-center text-[0.7rem] font-semibold text-[var(--ub-navy-950)]">
                  →
                </div>
              </div>
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5">
            {Array.from({ length: count }, (_, i) => (
              <span
                key={i}
                className="phone-dot h-1 w-1 rounded-full bg-[var(--ph-notch)]"
                style={{ "--i": i } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
