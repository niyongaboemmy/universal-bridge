// Pick a locale from { en, fr, rw } trees, falling back to English.
type Locale = "en" | "fr" | "rw";

export function pick(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((v) => pick(v, locale));
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("en" in obj && Object.keys(obj).every((k) => ["en", "fr", "rw"].includes(k))) {
      return (obj[locale] as string | undefined) ?? (locale === "en" ? obj.en : undefined);
    }
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, pick(v, locale)]));
  }
  return value;
}

/** Copy row ids from a saved English document onto a localized tree (Payload arrays need them). */
export function withIds(target: unknown, saved: unknown): unknown {
  if (Array.isArray(target) && Array.isArray(saved)) {
    return target.map((row, i) => withIds(row, saved[i]));
  }
  if (target && typeof target === "object" && saved && typeof saved === "object") {
    const out: Record<string, unknown> = { ...(target as object) };
    const s = saved as Record<string, unknown>;
    if (s.id && !Array.isArray(target)) out.id = s.id;
    for (const [k, v] of Object.entries(out)) if (k !== "id") out[k] = withIds(v, s[k]);
    return out;
  }
  return target;
}

/** Like pick(), but a missing translation falls back to English (for fully localized arrays/blocks). */
export function pickWithFallback(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((v) => pickWithFallback(v, locale));
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("en" in obj && Object.keys(obj).every((k) => ["en", "fr", "rw"].includes(k))) {
      return (obj[locale] as string | undefined) ?? obj.en;
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, pickWithFallback(v, locale)]),
    );
  }
  return value;
}
