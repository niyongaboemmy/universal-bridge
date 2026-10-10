/**
 * CNT-02: zero placeholder text. Scans UI messages and seed content for
 * "lorem", "ipsum", "TODO", "placeholder" (as content, not as a form attribute
 * name). With --db it also scans every text column in the CMS database.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const BANNED = /\b(lorem|ipsum|todo|tbd|xxx+|placeholder text|saul goodman|sara wilsson)\b/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function scanStrings(value: unknown, where: string, hits: string[]) {
  if (typeof value === "string") {
    if (BANNED.test(value)) hits.push(`${where}: "${value.slice(0, 80)}"`);
  } else if (Array.isArray(value)) value.forEach((v, i) => scanStrings(v, `${where}[${i}]`, hits));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) {
      // Form `placeholder` attributes are allowed as keys; their values are still scanned.
      scanStrings(v, `${where}.${k}`, hits);
    }
}

async function main() {
  const hits: string[] = [];
  for (const file of walk("src/i18n/messages"))
    scanStrings(JSON.parse(readFileSync(file, "utf8")), file, hits);
  for (const file of walk("scripts/seed-data").filter((f) => /\.(json|ts)$/.test(f))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (BANNED.test(line.replace(/\/\/.*$/, "")))
          hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
      });
  }
  if (process.argv.includes("--db") && process.env.DATABASE_URL) {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const cols = await client.query(
      `select table_name, column_name from information_schema.columns
       where table_schema = 'public' and data_type in ('character varying','text','jsonb')
       and table_name not like 'payload_%' and table_name not in ('users','outbox','leads','applications')`,
    );
    for (const { table_name, column_name } of cols.rows) {
      const res = await client.query(
        `select "${column_name}"::text as v from "${table_name}" where "${column_name}"::text ~* $1 limit 5`,
        [BANNED.source.replace(/\\b/g, "\\y")],
      );
      for (const row of res.rows)
        hits.push(`db ${table_name}.${column_name}: "${String(row.v).slice(0, 80)}"`);
    }
    await client.end();
  }
  if (hits.length) {
    console.error(`✗ Placeholder content found (CNT-02):\n  ${hits.join("\n  ")}`);
    process.exit(1);
  }
  console.log("✓ content: no placeholder text");
}

main();
