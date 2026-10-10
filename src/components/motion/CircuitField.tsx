/**
 * UI/UX §10.2 living circuit hero: ≤ 120 nodes on a 2D canvas. Nodes near the
 * pointer brighten and pulses travel along their traces. Drawn by
 * lib/fx/circuit (loaded on demand), only on capable desktop devices; never
 * under reduced motion or Lite mode. Decorative (aria-hidden).
 */
export function CircuitField({ className }: { className?: string }) {
  return <canvas data-fx="circuit" aria-hidden className={className} />;
}
