// UI/UX §14.3 + IX-06 Lite mode: heavy effects only on capable devices.
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

export function isLiteMode(): boolean {
  if (typeof window === "undefined") return true;
  if (document.documentElement.dataset.lite === "on") return true;
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return true;
  // Same rule as the head script in layout.tsx: only a genuine 2G link. Chrome
  // often estimates ordinary Wi-Fi as "3g", which used to keep the circuit and
  // globe off for most visitors; their code is a few KB and loads on desktop only.
  return connection?.effectiveType ? /2g/.test(connection.effectiveType) : false;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function canUseRichEffects(options: { minWidth?: number; webgl?: boolean } = {}): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion() || isLiteMode()) return false;
  if (options.minWidth && !window.matchMedia(`(min-width: ${options.minWidth}px)`).matches)
    return false;
  if ((navigator.hardwareConcurrency ?? 2) < 4) return false;
  if (options.webgl && !document.createElement("canvas").getContext("webgl2")) return false;
  return true;
}
