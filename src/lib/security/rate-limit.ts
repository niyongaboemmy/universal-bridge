import "server-only";
import { createHash } from "node:crypto";

/**
 * FR-FORM-03 / NFR-SEC-04. Keys are SHA-256 hashed with a salt so no raw IP or
 * email reaches the rate-limit store (IMPLEMENTATION-PLAN §6). Uses Upstash in
 * deployed environments and an in-memory window locally.
 */
export type LimitResult = { success: boolean; remaining: number; resetMs: number };

export function hashKey(...parts: string[]): string {
  return createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? "dev"}:${parts.join(":").toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

const memory = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowSec: number): LimitResult {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;
  const hits = (memory.get(key) ?? []).filter((t) => t > windowStart);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memory.set(key, hits);
  return {
    success,
    remaining: Math.max(0, limit - hits.length),
    resetMs: (hits[0] ?? now) + windowSec * 1000 - now,
  };
}

let upstash:
  ((key: string, limit: number, windowSec: number) => Promise<LimitResult>) | null | undefined;

async function getUpstash() {
  if (upstash !== undefined) return upstash;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
    return (upstash = null);
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import("@upstash/ratelimit"),
    import("@upstash/redis"),
  ]);
  const redis = Redis.fromEnv();
  const limiters = new Map<string, InstanceType<typeof Ratelimit>>();
  upstash = async (key, limit, windowSec) => {
    const id = `${limit}/${windowSec}`;
    if (!limiters.has(id)) {
      limiters.set(
        id,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
          prefix: "ub-rl",
        }),
      );
    }
    const r = await limiters.get(id)!.limit(key);
    return { success: r.success, remaining: r.remaining, resetMs: r.reset - Date.now() };
  };
  return upstash;
}

export async function rateLimit(
  scope: string,
  identifier: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): Promise<LimitResult> {
  const key = `${scope}:${hashKey(identifier)}`;
  // Local/CI E2E runs submit many forms from one IP; production never sets this.
  const scale =
    process.env.NODE_ENV === "production" ? 1 : Number(process.env.RATE_LIMIT_SCALE ?? 1);
  limit = Math.max(1, Math.round(limit * (Number.isFinite(scale) && scale > 0 ? scale : 1)));
  const remote = await getUpstash();
  return remote ? remote(key, limit, windowSec) : memoryLimit(key, limit, windowSec);
}

/** Reset the in-memory store (tests). */
export function __resetMemoryLimits() {
  memory.clear();
}
