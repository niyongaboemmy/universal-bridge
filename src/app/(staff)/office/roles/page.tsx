import { sql } from "@payloadcms/db-postgres";
import { PageHeader } from "@/components/office/ui";
import { LazyRoleMatrix as RoleMatrix } from "@/components/office/lazy";
import type { RoleRow } from "@/components/office/RoleMatrix";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";

export const metadata = { title: "Roles & permissions" };

export default async function Roles() {
  const user = await requireArea("roles");
  const p = await payload();
  const [roles, staff, members] = await Promise.all([
    p.find({ collection: "roles", limit: 100, depth: 0, sort: "createdAt", pagination: false }),
    p.db.drizzle.execute(
      sql`select roles_id as id, count(*)::int as n from users_rels where path = 'roles' group by 1`,
    ),
    p.db.drizzle.execute(sql`select role_id as id, count(*)::int as n from members group by 1`),
  ]);
  const people = new Map<number, number>();
  for (const r of [...staff.rows, ...members.rows] as { id: number; n: number }[])
    people.set(r.id, (people.get(r.id) ?? 0) + r.n);
  const rows: RoleRow[] = roles.docs.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug ?? "",
    description: r.description,
    color: r.color,
    audience: r.audience,
    system: r.system,
    permissions: r.permissions ?? [],
    people: people.get(r.id) ?? 0,
  }));

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Roles & permissions"
        subtitle="What each role can open and change. Changes apply at the person's next page load."
      />
      <RoleMatrix roles={rows} canEdit={allowed(user, "roles.manage")} />
    </div>
  );
}
