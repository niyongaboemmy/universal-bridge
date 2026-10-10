import Link from "next/link";
import type { ServerProps } from "payload";
import { hasRole, type Role } from "@/access/roles";
import { mfaMode } from "@/lib/auth/mfa-proof";

/** Admin nav: two-step verification for everyone (ADM-01), privacy requests for super admins (ADM-09). */
export function SecurityLink({ user }: ServerProps) {
  const isSuper = hasRole(user as { roles?: Role[] } | null, "super");
  const mfa = mfaMode() !== "off";
  const canEdit = hasRole(user as { roles?: Role[] } | null, "editor", "academy", "hr", "sales");
  return (
    <div style={{ marginTop: "1rem", display: "grid", gap: "0.25rem" }}>
      {canEdit && (
        // CMS-07: open the site in live-edit mode (a full page load: different root layout).
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/api/live-edit/enable?path=/" className="nav__link">
          <span className="nav__link-label">Edit site live</span>
        </a>
      )}
      {isSuper && (
        <Link href="/admin/privacy" className="nav__link">
          <span className="nav__link-label">Privacy requests</span>
        </Link>
      )}
      {mfa && (
        <>
          {/* /staff is a separate root layout: a full page load on purpose. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/staff/mfa" className="nav__link">
            <span className="nav__link-label">Two-step verification</span>
          </a>
        </>
      )}
    </div>
  );
}
