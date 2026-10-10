/* eslint-disable @next/next/no-html-link-for-pages -- the admin is a separate root layout. */
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Milestones, ProjectForm } from "@/components/office/controls";
import { fmtDate, fmtMoney, titleCase } from "@/components/office/format";
import { Card, PageHeader, Pill, STATUS_TONE, btn } from "@/components/office/ui";
import { listEmployees } from "@/features/office/data";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Project } from "@/payload-types";

export const metadata = { title: "Project" };

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireArea("projects");
  const project = (await (
    await payload()
  )
    .findByID({
      collection: "projects",
      id: Number((await params).id),
      depth: 1,
      user,
      overrideAccess: false,
    })
    .catch(() => null)) as Project | null;
  if (!project) notFound();
  const editable = allowed(user, "projects.manage");
  const employees = await listEmployees(user).catch(() => []);
  const team = (project.team ?? []).filter((t) => typeof t === "object");
  const lead = typeof project.lead === "object" ? project.lead : null;
  return (
    <div className="grid gap-6">
      <Link
        href="/office/projects"
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Projects
      </Link>
      <PageHeader
        title={project.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {project.code && <span className="font-mono">{project.code}</span>}
            <Pill tone="blue">{titleCase(project.kind)}</Pill>
            <Pill tone={STATUS_TONE[project.status]}>{project.status}</Pill>
            <Pill tone={STATUS_TONE[project.health]}>{project.health.replace("-", " ")}</Pill>
          </span>
        }
        actions={
          <a href={`/admin/collections/projects/${project.id}`} className={btn}>
            <ExternalLink className="size-4" aria-hidden /> Admin
          </a>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid content-start gap-6">
          <Card title="Milestones">
            {editable ? (
              <Milestones id={project.id} initial={project.milestones ?? []} />
            ) : (
              <p className="text-body-sm text-fg-secondary">
                {(project.milestones ?? []).length} milestones
              </p>
            )}
          </Card>
          {editable && (
            <Card title="Edit project">
              <ProjectForm
                employees={employees.map((e) => ({ id: e.id, name: e.name }))}
                project={{
                  ...project,
                  owner: typeof project.owner === "object" ? project.owner?.id : project.owner,
                  team: (project.team ?? []).map((t) => (typeof t === "object" ? t.id : t)),
                }}
              />
            </Card>
          )}
        </div>
        <Card title="At a glance" className="h-fit">
          <dl className="grid gap-3 text-body-sm">
            {[
              ["Client / owner", project.client],
              [
                "From request",
                lead ? (
                  <Link key="l" href={`/office/requests/${lead.id}`} className="text-accent">
                    {lead.ref} · {lead.name}
                  </Link>
                ) : null,
              ],
              ["Start", fmtDate(project.startDate)],
              ["Due", fmtDate(project.dueDate)],
              [
                "Budget",
                project.budget ? fmtMoney(project.budget, project.currency ?? "RWF") : null,
              ],
              ["Lead", typeof project.owner === "object" ? project.owner?.name : null],
              ["Team", team.map((t) => t.name).join(", ")],
              ["Progress", `${project.progress ?? 0}%`],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[0.75rem] text-fg-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {project.summary && (
            <p className="mt-4 border-t border-subtle pt-4 text-body-sm text-fg-secondary">
              {project.summary}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
