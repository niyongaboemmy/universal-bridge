import {
  MARK_BLUE_PATH,
  MARK_NODES,
  MARK_VIEWBOX,
  MARK_WEDGE_PATH,
} from "@/components/brand/Monogram";

/**
 * UB's master monogram (brand/source/ub-mark.svg) as a standalone SVG string,
 * for favicons, app icons, the OG image and JSON-LD. Optional square tile.
 */
export function markSvg({
  ink = "#0145B8",
  wedge = "#FE760D",
  background,
}: { ink?: string; wedge?: string; background?: string } = {}) {
  const [x, y, w, h] = MARK_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
  const shapes = `<g fill="${ink}"><path d="${MARK_BLUE_PATH}"/>${MARK_NODES.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join("")}</g><path d="${MARK_WEDGE_PATH}" fill="${wedge}"/>`;
  if (!background) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" fill-rule="evenodd">${shapes}</svg>`;
  }
  // Square tile with ~14% padding around the mark.
  const size = w * 1.28;
  const ox = x - (size - w) / 2;
  const oy = y - (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox} ${oy} ${size} ${size}" fill-rule="evenodd"><rect x="${ox}" y="${oy}" width="${size}" height="${size}" rx="${size * 0.2}" fill="${background}"/>${shapes}</svg>`;
}
