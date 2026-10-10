#!/usr/bin/env bash
# Packs a standalone build into a release folder for cPanel (docs/DEPLOYMENT.md).
# Run after `NEXT_OUTPUT=standalone pnpm build`:
#
#   bash deploy/cpanel/bundle.sh release      # -> ./release, ready to tar and upload
set -euo pipefail

OUT="${1:?usage: bundle.sh <out-dir>}"
DIST="${NEXT_DIST_DIR:-.next}"
[ -f "$DIST/standalone/server.js" ] || { echo "No standalone build in $DIST (set NEXT_OUTPUT=standalone)"; exit 1; }

rm -rf "$OUT"
cp -a "$DIST/standalone" "$OUT"
cp -a public "$OUT/public"
cp -a "$DIST/static" "$OUT/$DIST/static"
mkdir -p "$OUT/deploy"
cp deploy/cpanel/app.cjs deploy/cpanel/activate.sh deploy/cpanel/cron.sh "$OUT/deploy/"

# The cPanel Node runs with symlinked paths preserved, so a package must also be
# reachable from the top-level node_modules (pnpm keeps shared ones only under
# .pnpm/node_modules, e.g. @swc/helpers used by next itself).
(
  cd "$OUT/node_modules"
  for e in .pnpm/node_modules/* .pnpm/node_modules/@*/*; do
    [ -e "$e" ] || continue
    d="${e#.pnpm/node_modules/}"
    case "$d" in
      @*/*) mkdir -p "${d%%/*}"; [ -e "$d" ] || ln -s "../.pnpm/node_modules/$d" "$d" ;;
      @*) ;;
      *) [ -e "$d" ] || [ -L "$d" ] || ln -s ".pnpm/node_modules/$d" "$d" ;;
    esac
  done
)
git rev-parse HEAD >"$OUT/REVISION" 2>/dev/null || true

# Never ship local data or secrets.
for bad in .data .env .env.local .env.production; do
  if [ -e "$OUT/$bad" ]; then echo "Refusing to bundle $bad"; exit 1; fi
done
echo "Bundled $(find "$OUT" -type f | wc -l | tr -d ' ') files ($(du -sh "$OUT" | cut -f1)) into $OUT"
