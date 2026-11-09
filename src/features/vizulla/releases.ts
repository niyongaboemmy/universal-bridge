import "server-only";
import { unstable_cache } from "next/cache";
import { parseChecksums, platformOfAsset, type PlatformId } from "./platforms";

/**
 * The latest Vizulla Browser release, read from GitHub Releases. The Vizulla
 * repository is private, so the server reads it with a read-only token
 * (VIZULLA_GITHUB_TOKEN) and hands each visitor a short-lived signed download
 * link; the token never reaches the browser. Without a token this works only
 * if the repository is public.
 */

const REPO = process.env.VIZULLA_RELEASES_REPO || "niyongaboemmy/vizulla-browser";
const API = "https://api.github.com";

export type VizullaInstaller = {
  platform: PlatformId;
  name: string;
  size: number;
  sha256: string | null;
};

export type VizullaRelease = {
  version: string;
  publishedAt: string;
  installers: VizullaInstaller[];
};

type GhAsset = { id: number; name: string; size: number; browser_download_url: string };
type GhRelease = { tag_name: string; published_at: string; draft: boolean; assets: GhAsset[] };

function headers(accept = "application/vnd.github+json"): HeadersInit {
  const token = process.env.VIZULLA_GITHUB_TOKEN;
  return {
    accept,
    "user-agent": "universal-bridge-website",
    "x-github-api-version": "2022-11-28",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchLatest(): Promise<GhRelease & { sums: Record<string, string> }> {
  const res = await fetch(`${API}/repos/${REPO}/releases/latest`, {
    headers: headers(),
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub releases: HTTP ${res.status}`);
  const release = (await res.json()) as GhRelease;
  const sumsAsset = release.assets.find((a) => a.name === "SHA256SUMS.txt");
  let sums: Record<string, string> = {};
  if (sumsAsset) {
    // The asset endpoint redirects to a signed URL; fetch drops the token on that hop.
    const r = await fetch(`${API}/repos/${REPO}/releases/assets/${sumsAsset.id}`, {
      headers: headers("application/octet-stream"),
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (r.ok) sums = Object.fromEntries(parseChecksums(await r.text()));
  }
  return { ...release, sums };
}

// Ten minutes: a new release shows up quickly without calling GitHub per visitor.
// A failed call throws, so nothing is cached and the next request tries again.
const latestCached = unstable_cache(fetchLatest, ["vizulla-latest-release", REPO], {
  revalidate: 600,
  tags: ["vizulla-release"],
});

async function latestRaw() {
  try {
    return await latestCached();
  } catch (err) {
    console.warn(`[vizulla] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/** The latest release's installers, or null when GitHub can't be reached. */
export async function getVizullaRelease(): Promise<VizullaRelease | null> {
  const raw = await latestRaw();
  if (!raw) return null;
  const installers = raw.assets.flatMap((a): VizullaInstaller[] => {
    const platform = platformOfAsset(a.name);
    return platform
      ? [{ platform, name: a.name, size: a.size, sha256: raw.sums[a.name] ?? null }]
      : [];
  });
  if (!installers.length) return null;
  return { version: raw.tag_name.replace(/^v/, ""), publishedAt: raw.published_at, installers };
}

const DOWNLOAD_HOSTS = /^(?:[\w-]+\.)*(?:github\.com|githubusercontent\.com)$/;

/**
 * Where to send a visitor for `platform`'s installer: a signed GitHub URL that
 * expires in about an hour (private repository), or the public download URL.
 */
export async function downloadUrlFor(platform: PlatformId): Promise<string | null> {
  const raw = await latestRaw();
  const asset = raw?.assets.find((a) => platformOfAsset(a.name) === platform);
  if (!asset) return null;
  if (!process.env.VIZULLA_GITHUB_TOKEN) return asset.browser_download_url;
  const res = await fetch(`${API}/repos/${REPO}/releases/assets/${asset.id}`, {
    headers: headers("application/octet-stream"),
    redirect: "manual",
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  const location = res.headers.get("location");
  if (res.status < 300 || res.status >= 400 || !location) return null;
  try {
    const url = new URL(location);
    return url.protocol === "https:" && DOWNLOAD_HOSTS.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
