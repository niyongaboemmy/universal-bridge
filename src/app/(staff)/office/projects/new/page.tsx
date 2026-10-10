import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectForm } from "@/components/office/controls";
import { Card, PageHeader } from "@/components/office/ui";
import { listEmployees } from "@/features/office/data";
import { requirePermission } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";

export const metadata = { title: "New project" };

export default async function NewProject({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const user = await requirePermission("projects.manage");
  const leadId = Number((await searchParams).lead);
  const lead = leadId
    ? await (
        await payload()
      )
        .findByID({ collection: "leads", id: leadId, depth: 0, user, overrideAccess: false })
        .catch(() => null)
    : null;
  const employees = await listEmployees(user).catch(() => []);
  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href="/office/projects"
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Projects
      </Link>
      <PageHeader
        title="New project"
        subtitle={lead ? `From ${lead.ref} · ${lead.name}` : undefined}
      />
      <Card>
        <ProjectForm
          leadId={lead?.id}
          employees={employees
            .filter((e) => e.status !== "left")
            .map((e) => ({ id: e.id, name: e.name }))}
          project={
            lead
              ? ({
                  id: 0,
                  name: `${lead.company || lead.name} project`,
                  kind: "client",
                  status: "planning",
                  health: "on-track",
                  client: lead.company || lead.name,
                  summary: lead.message?.slice(0, 400),
                  budget: lead.value,
                  currency: lead.currency,
                } as never)
              : undefined
          }
        />
      </Card>
    </div>
  );
}
