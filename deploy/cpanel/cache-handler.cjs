/**
 * Next.js cache handler for the cPanel deploy (docs/DEPLOYMENT.md), enabled with
 * NEXT_OUTPUT=standalone in next.config.ts.
 *
 * Next's default handler keeps revalidated tags in process memory. Passenger
 * stops idle apps and may run several processes, so a CMS publish (or the
 * deploy's cache refresh) reached one process and was forgotten on restart, and
 * pages prerendered from the empty build database came back. This handler keeps
 * entries and tag revalidation times on disk, shared by every process of the
 * release. Build-time prerenders are never read through it, so the first
 * request renders from the real database.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- loaded by Next as CommonJS */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = process.env.NEXT_CACHE_DIR || path.join(process.cwd(), ".cache-handler");
const ENTRIES = path.join(ROOT, "entries");
const TAGS = path.join(ROOT, "tags");

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
// Two levels of fan-out keep directories small.
const entryFile = (key) => {
  const h = hash(key);
  return path.join(ENTRIES, h.slice(0, 2), h);
};
const tagFile = (tag) => path.join(TAGS, hash(tag));

// Entries hold Buffers (rscData, images) and Maps (segmentData) that JSON
// can't round-trip on its own.
function replacer(key, value) {
  const raw = this[key];
  if (Buffer.isBuffer(raw)) return { __t: "Buffer", v: raw.toString("base64") };
  if (raw instanceof Map) return { __t: "Map", v: [...raw.entries()] };
  return value;
}
function reviver(_key, value) {
  if (value && typeof value === "object" && typeof value.__t === "string") {
    if (value.__t === "Buffer") return Buffer.from(value.v, "base64");
    if (value.__t === "Map") return new Map(value.v);
  }
  return value;
}

function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

function revalidatedAt(tag) {
  try {
    return fs.statSync(tagFile(tag)).mtimeMs;
  } catch {
    return 0;
  }
}

function tagsOf(data, ctx) {
  const tags = new Set(ctx?.tags ?? []);
  const header = data?.headers?.["x-next-cache-tags"];
  if (typeof header === "string") for (const t of header.split(",")) if (t) tags.add(t);
  return [...tags];
}

module.exports = class FileCacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key, ctx) {
    let entry;
    try {
      entry = JSON.parse(fs.readFileSync(entryFile(key), "utf8"), reviver);
    } catch {
      return null;
    }
    const tags = [...(entry.tags ?? []), ...(ctx?.tags ?? []), ...(ctx?.softTags ?? [])];
    for (const tag of tags) {
      if (revalidatedAt(tag) >= entry.lastModified) return null;
    }
    return { value: entry.value, lastModified: entry.lastModified };
  }

  async set(key, data, ctx) {
    try {
      if (data === null) return fs.rmSync(entryFile(key), { force: true });
      const entry = { value: data, lastModified: Date.now(), tags: tagsOf(data, ctx) };
      writeAtomic(entryFile(key), JSON.stringify(entry, replacer));
    } catch (err) {
      console.error("[cache-handler] set failed", err);
    }
  }

  async revalidateTag(tags) {
    const now = new Date();
    for (const tag of [tags].flat()) {
      try {
        const file = tagFile(tag);
        fs.mkdirSync(TAGS, { recursive: true });
        fs.writeFileSync(file, tag);
        fs.utimesSync(file, now, now);
      } catch (err) {
        console.error("[cache-handler] revalidateTag failed", err);
      }
    }
  }

  resetRequestCache() {}
};
