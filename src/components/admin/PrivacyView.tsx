import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { hasRole, type Role } from "@/access/roles";
import { PrivacyTool } from "./PrivacyTool";

/** ADM-09: /admin/privacy, inside the admin chrome. Super admins only. */
export function PrivacyView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult;
  const allowed = hasRole(req.user as { roles?: Role[] } | null, "super");
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1 style={{ marginTop: "2rem" }}>Privacy requests</h1>
        {allowed ? <PrivacyTool /> : <p>Only super admins can handle data-subject requests.</p>}
      </Gutter>
    </DefaultTemplate>
  );
}
