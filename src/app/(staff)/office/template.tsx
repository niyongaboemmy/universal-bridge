import type { ReactNode } from "react";

/** Re-mounts on every navigation, so each page fades in (reduced motion: instant). */
export default function OfficeTemplate({ children }: { children: ReactNode }) {
  return <div className="office-page">{children}</div>;
}
