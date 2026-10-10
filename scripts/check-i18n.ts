/**
 * README rule: a UI key added to en.json must exist in fr.json and rw.json,
 * and ICU placeholders ({name}) must match. Fails CI otherwise.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

type Tree = { [key: string]: string | Tree };
const dir = path.resolve("src/i18n/messages");
const load = (locale: string) =>
  JSON.parse(readFileSync(path.join(dir, `${locale}.json`), "utf8")) as Tree;

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(full, value);
    else for (const [k, v] of flatten(value, full)) out.set(k, v);
  }
  return out;
}

// Top-level ICU argument names, e.g. {count, plural, …} → count, {year} → year.
export function placeholders(message: string): string[] {
  const names = new Set<string>();
  let depth = 0;
  for (let i = 0; i < message.length; i++) {
    const ch = message[i];
    if (ch === "{") {
      if (depth === 0) {
        const match = /^\{\s*([a-zA-Z0-9_]+)/.exec(message.slice(i));
        if (match?.[1]) names.add(match[1]);
      }
      depth++;
    } else if (ch === "}") depth--;
  }
  return [...names].sort();
}

const en = flatten(load("en"));
let failures = 0;
for (const locale of ["fr", "rw"]) {
  const other = flatten(load(locale));
  for (const [key, value] of en) {
    const translated = other.get(key);
    if (translated === undefined) {
      console.error(`✗ ${locale}: missing key "${key}"`);
      failures++;
    } else if (placeholders(value).join() !== placeholders(translated).join()) {
      console.error(
        `✗ ${locale}: placeholders differ for "${key}" (${placeholders(value)} vs ${placeholders(translated)})`,
      );
      failures++;
    }
  }
  for (const key of other.keys()) {
    if (!en.has(key)) {
      console.error(`✗ ${locale}: extra key "${key}" not in en.json`);
      failures++;
    }
  }
}
if (failures) {
  console.error(`\n${failures} i18n problem(s).`);
  process.exit(1);
}
console.log(`✓ i18n: ${en.size} keys present in en, fr, rw with matching placeholders`);
