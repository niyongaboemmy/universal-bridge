import { ArrowLeft, Mail, Phone } from "lucide-react";
import { nowMs } from "@/lib/time/office-hours";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/office/controls";
import { fmtDate, titleCase } from "@/components/office/format";
import { Card, PageHeader, Pill, STATUS_TONE, btn } from "@/components/office/ui";
import { listEmployees } from "@/features/office/data";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Employee, Project } from "@/payload-types";

export const metadata = { title: "Employee" };

export default async function EmployeeDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireArea("people");
  const id = Number((await params).id);
  const p = await payload();
  const e = (await p
    .findByID({ collection: "employees", id, depth: 1, user, overrideAccess: false })
    .catch(() => null)) as Employee | null;
  if (!e) notFound();
  const [all, projects] = await Promise.all([
    listEmployees(user),
    p.find({
      collection: "projects",
      where: { or: [{ team: { contains: id } }, { owner: { equals: id } }] },
      depth: 0,
      limit: 50,
      overrideAccess: true,
    }),
  ]);
  const reports = all.filter(
    (x) => (typeof x.manager === "object" ? x.manager?.id : x.manager) === id,
  );
  const years = ((nowMs() - new Date(e.startDate).getTime()) / (365.25 * 86400000)).toFixed(1);
  return (
    <div className="grid gap-6">
      <Link
        href="/office/people"
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Employees
      </Link>
      <PageHeader
        title={e.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {e.jobTitle} · <Pill tone="blue">{titleCase(e.department)}</Pill>
            <Pill tone={STATUS_TONE[e.status] ?? "green"}>{e.status}</Pill>
            <span>
              {titleCase(e.employment)} · {years} years
            </span>
          </span>
        }
        actions={
          <>
            <a href={`mailto:${e.email}`} className={btn}>
              <Mail className="size-4" aria-hidden /> Email
            </a>
            {e.phone && (
              <a href={`tel:${e.phone}`} className={btn}>
                <Phone className="size-4" aria-hidden /> Call
              </a>
            )}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card title="Details">
          <EmployeeForm
            managers={all.map((x) => ({ id: x.id, name: x.name }))}
            employee={{ ...e, manager: typeof e.manager === "object" ? e.manager?.id : e.manager }}
          />
        </Card>
        <div className="grid h-fit gap-6">
          <Card title="Projects">
            {(projects.docs as Project[]).length ? (
              <ul className="grid gap-2">
                {(projects.docs as Project[]).map((pr) => (
                  <li key={pr.id}>
                    <Link
                      href={`/office/projects/${pr.id}`}
                      className="flex items-center justify-between gap-2 text-body-sm hover:text-accent"
                    >
                      {pr.name} <Pill tone={STATUS_TONE[pr.status]}>{pr.status}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-fg-muted">Not on a project.</p>
            )}
          </Card>
          <Card title="Team">
            <dl className="grid gap-3 text-body-sm">
              <div>
                <dt className="text-[0.75rem] text-fg-muted">Reports to</dt>
                <dd>
                  {typeof e.manager === "object" && e.manager ? (
                    <Link href={`/office/people/${e.manager.id}`} className="text-accent">
                      {e.manager.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[0.75rem] text-fg-muted">Direct reports</dt>
                <dd>{reports.length ? reports.map((r) => r.name).join(", ") : "—"}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] text-fg-muted">Started</dt>
                <dd>{fmtDate(e.startDate)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
