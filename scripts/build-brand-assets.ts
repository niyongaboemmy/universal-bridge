// Writes favicon + public mark from the single source of truth (markSvg).
import { writeFileSync } from "node:fs";
import { markSvg } from "../src/lib/brand/mark-svg";

writeFileSync("public/brand/ub-mark.svg", markSvg());
// public/brand/original-logo.svg is UB's master file and is never overwritten.
writeFileSync("public/brand/ub-mark-white.svg", markSvg({ ink: "#FFFFFF" }));
writeFileSync("src/app/icon.svg", markSvg({ background: "#FFFFFF" }));
console.log("✓ brand assets written");
