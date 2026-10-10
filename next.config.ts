import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { legacyRedirects } from "./src/lib/seo/legacy-redirects";
import { buildCsp, securityHeaders } from "./src/lib/security/csp";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second production build run beside the dev server (bundle checks).
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // cPanel deploys ship a self-contained server.js bundle (docs/DEPLOYMENT.md).
  // Off by default: `next start` refuses to run a standalone build.
  ...(process.env.NEXT_OUTPUT === "standalone"
    ? {
        output: "standalone" as const,
        // Cache and revalidated tags on disk, shared by Passenger's processes and
        // kept across idle restarts (deploy/cpanel/cache-handler.cjs).
        cacheHandler: path.resolve(dirname, "deploy/cpanel/cache-handler.cjs"),
        cacheMaxMemorySize: 0,
      }
    : {}),
  // Local uploads and dev mail (personal data) must never be traced into a bundle.
  outputFileTracingExcludes: { "/*": [".data/**/*"] },
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/api/media/file/**" },
      { pathname: "/brand/**" },
      { pathname: "/images/**" },
    ],
  },
  turbopack: { root: path.resolve(dirname) },
  experimental: {
    // CVs and portfolios up to 5 MB go through server actions (FR-FORM-08).
    serverActions: { bodySizeLimit: "6mb" },
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  async redirects() {
    return [
      ...legacyRedirects.map((r) => ({ ...r, statusCode: 301 as const })),
      { source: "/index.php", destination: "/", statusCode: 301 as const },
      // Section roots without their own page (breadcrumbs and hand-typed URLs).
      ...["", "/fr", "/rw"].flatMap((p) => [
        { source: `${p}/company`, destination: `${p}/company/about`, statusCode: 308 as const },
        { source: `${p}/legal`, destination: `${p}/legal/privacy`, statusCode: 308 as const },
      ]),
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders({ dev }) },
      {
        // Public pages: strict static CSP (ADR-006). Admin and API are excluded.
        source: "/((?!admin|api).*)",
        headers: [{ key: "Content-Security-Policy", value: buildCsp({ dev }) }],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
