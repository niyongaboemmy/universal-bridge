/**
 * NFR-PERF-03: first-load JS ≤ 120 KB gzip on marketing pages.
 * Measures what a browser actually downloads: fetches each page from a running
 * production server, collects every <script src> (skipping `nomodule`
 * polyfills modern browsers never fetch), Brotli-compresses them as the CDN
 * does, and sums them. The framework itself (React + Next) is ~105 KB of this.
 * Usage: tsx scripts/check-bundle.ts [baseUrl] (default http://localhost:3000)
 */
import { brotliCompressSync } from "node:zlib";

const BASE = process.argv[2] ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";
// ADR-007 proposes 150 KB Brotli total (framework floor ≈ 114 KB).
const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB ?? 150);
export const MARKETING_PAGES = [
  "/",
  "/fr",
  "/contact",
  "/services",
  "/services/ai-data",
  "/work",
  "/products/nyambika-design",
  "/book",
  "/academy",
  "/academy/programs/full-stack-web-development",
  "/academy/apply",
  "/academy/internships",
  "/academy/verify",
  "/company/careers",
  "/company/partners",
  "/company/about",
  "/company/leadership",
  "/company/events/ub-hackathon-2024",
  "/labs",
  "/labs/coding-hub",
  "/insights",
  "/insights/building-web-apps-for-3g",
  "/legal/privacy",
];

async function firstLoadKb(path: string): Promise<{ kb: number; scripts: number } | null> {
  const res = await fetch(BASE + path);
  if (res.status === 404) return null;
  const html = await res.text();
  const tags = [...html.matchAll(/<script([^>]*)>/g)]
    .map((m) => m[1]!)
    .filter((attrs) => !/nomodule/i.test(attrs));
  const srcs = [
    ...new Set(tags.map((attrs) => /src="([^"]+)"/.exec(attrs)?.[1]).filter(Boolean) as string[]),
  ];
  let bytes = 0;
  for (const src of srcs) {
    const body = Buffer.from(await (await fetch(new URL(src, BASE))).arrayBuffer());
    bytes += brotliCompressSync(body).length;
  }
  return { kb: bytes / 1024, scripts: srcs.length };
}

async function main() {
  let failed = false;
  for (const path of MARKETING_PAGES) {
    const result = await firstLoadKb(path);
    if (!result) {
      console.log(`- ${path.padEnd(12)} not built yet, skipped`);
      continue;
    }
    const ok = result.kb <= BUDGET_KB;
    failed ||= !ok;
    console.log(
      `${ok ? "✓" : "✗"} ${path.padEnd(12)} ${result.kb.toFixed(1)} KB brotli in ${result.scripts} scripts (budget ${BUDGET_KB})`,
    );
  }
  if (failed) process.exit(1);
}

main();
