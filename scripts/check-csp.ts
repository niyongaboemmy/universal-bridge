// NFR-SEC-08: every third-party origin in the CSP must be approved in docs/third-parties.md.
import { readFileSync } from "node:fs";
import { THIRD_PARTY_ORIGINS } from "../src/lib/security/csp";

const doc = readFileSync("docs/third-parties.md", "utf8");
const missing = Object.values(THIRD_PARTY_ORIGINS).filter((origin) => !doc.includes(origin));
if (missing.length) {
  console.error(`✗ Not approved in docs/third-parties.md: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`✓ csp: ${Object.keys(THIRD_PARTY_ORIGINS).length} third-party origins, all approved`);
