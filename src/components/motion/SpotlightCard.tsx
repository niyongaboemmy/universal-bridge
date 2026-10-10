import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft light follows the pointer inside the card (UI/UX §17.6), via lib/fx/spotlight. */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-fx="spotlight" className={cn("spotlight relative", className)}>
      {children}
    </div>
  );
}
