/**
 * UI/UX §5.2 / NFR-A11Y-04: every alias text/background pair must pass
 * WCAG AA (4.5:1 body, 3:1 large text & UI). Reads the token CSS directly.
 */
import { readFileSync } from "node:fs";

const css = (f: string) => readFileSync(`src/styles/tokens/${f}`, "utf8");
const global = css("global.css");
const ramp = new Map<string, string>();
for (const m of global.matchAll(/--(ub-[a-z]+-\d+):\s*(#[0-9a-f]{6})/gi))
  ramp.set(m[1]!, m[2]!.toLowerCase());

function aliases(file: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of css(file).matchAll(/--([a-z-]+):\s*var\(--(ub-[a-z]+-\d+)\)/gi)) {
    const hex = ramp.get(m[2]!);
    if (hex) out.set(m[1]!, hex);
  }
  return out;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

// [foreground, background, minimum ratio]
const PAIRS: [string, string, number][] = [
  ["text-primary", "bg-canvas", 4.5],
  ["text-primary", "bg-surface", 4.5],
  ["text-primary", "bg-surface-raised", 4.5],
  ["text-secondary", "bg-canvas", 4.5],
  ["text-secondary", "bg-surface", 4.5],
  ["text-muted", "bg-canvas", 4.5],
  ["text-muted", "bg-surface", 4.5],
  ["accent-primary", "bg-canvas", 4.5],
  ["accent-primary", "bg-surface", 4.5],
  ["on-accent", "accent-primary", 4.5],
  ["on-accent", "accent-primary-hover", 4.5],
  ["accent-spark-text", "bg-canvas", 4.5],
  ["accent-spark-text", "bg-surface", 4.5],
  ["on-spark", "accent-spark", 4.5],
  ["focus-ring", "bg-canvas", 3],
  ["focus-ring", "bg-surface", 3],
  ["danger", "bg-surface", 4.5],
  ["success", "bg-surface", 4.5],
];

let failures = 0;
for (const theme of ["alias.light.css", "alias.dark.css"]) {
  const tokens = aliases(theme);
  for (const [fg, bg, min] of PAIRS) {
    const a = tokens.get(fg);
    const b = tokens.get(bg);
    if (!a || !b) continue;
    const ratio = contrast(a, b);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(
      `${ok ? "✓" : "✗"} ${theme.padEnd(16)} ${fg.padEnd(18)} on ${bg.padEnd(18)} ${ratio.toFixed(2)}:1 (min ${min})`,
    );
  }
}
if (failures) {
  console.error(`\n${failures} contrast failure(s).`);
  process.exit(1);
}
