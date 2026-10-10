// NFR-MNT-02: Conventional Commits, e.g. "feat(academy): add intake waitlist".
import { readFileSync } from "node:fs";

const message = readFileSync(process.argv[2]!, "utf8").split("\n")[0] ?? "";
const pattern =
  /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\([a-z0-9-]+\))?!?: .{3,}/;
if (!pattern.test(message) && !message.startsWith("Merge ")) {
  console.error(
    `✗ Commit message must follow Conventional Commits, e.g. "feat(academy): add intake waitlist".\n  Got: "${message}"`,
  );
  process.exit(1);
}
