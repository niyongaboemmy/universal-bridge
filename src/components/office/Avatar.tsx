import { cn } from "@/lib/utils";

const HUES = ["#0145b8", "#fe760d", "#0f8a6a", "#7a4de0", "#c2410c", "#0e7490", "#be185d"];

type AvatarDoc = { url?: string | null; sizes?: { small?: { url?: string | null } } } | null;

export function avatarUrl(a: unknown): string | null {
  if (!a || typeof a !== "object") return null;
  const doc = a as AvatarDoc;
  return doc?.sizes?.small?.url || doc?.url || null;
}

export const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");

/** Profile picture, or initials on a colour picked from the name (stable per person). */
export function Avatar({
  name,
  image,
  size = 32,
  className,
}: {
  name: string;
  image?: unknown;
  size?: number;
  className?: string;
}) {
  const url = avatarUrl(image);
  const hue = HUES[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % HUES.length];
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- small, already-resized upload
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        className,
      )}
      style={{ width: size, height: size, background: hue, fontSize: size * 0.38 }}
    >
      {initials(name || "?")}
    </span>
  );
}
