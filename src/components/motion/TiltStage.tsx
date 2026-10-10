import type { ReactNode } from "react";

/**
 * Pointer parallax stage (hero showcase): lib/fx/tilt writes --px/--py and
 * layers move by their own --depth in CSS. Mouse only; off under reduced motion.
 */
export function TiltStage({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-fx="tilt" className={className}>
      {children}
    </div>
  );
}
