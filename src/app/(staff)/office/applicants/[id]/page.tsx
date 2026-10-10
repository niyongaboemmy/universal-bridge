/* eslint-disable @next/next/no-html-link-for-pages -- the admin is a separate root layout. */
import { ArrowLeft, ExternalLink, FileText, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationControls, NoteForm } from "@/components/office/controls";
import { fmtDate, timeAgo, titleCase } from "@/components/office/format";
import { Card, PageHeader, Pill, STATUS_TONE, btn, btnPrimary } from "@/components/office/ui";
import { APPLICATION_STATUSES } from "@/collections/Applications";
import { staffUsers } from "@/features/office/data";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Application, PrivateFile } from "@/payload-types";

export const metadata = { title: "Applicant" };

const show = (v: unknown): string =>
  Array.isArray(v)
    ? v.map(show).join(", ")
    : v && typeof v === "object"
      ? JSON.stringify(v)
      : v === true
        ? "Yes"
        : v === false
          ? "No"
          : String(v ?? "");

export default async function ApplicantDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireArea("applicants");
  const p = await payload();
  const app = (await p
    .findByID({
      collection: "applications",
      id: Number((await params).id),
      depth: 1,
      user,
      overrideAccess: false,
    })
    .catch(() => null)) as Application | null;
  if (!app) notFound();
  const users = await staffUsers();
  const files = (app.files ?? []).filter((f): f is PrivateFile => typeof f === "object");
  const answers = Object.entries((app.data ?? {}) as Record<string, unknown>).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined,
  );
  const phone = app.phone?.replace(/[^\d+]/g, "");
  const linked = [
    typeof app.program === "object" && app.program ? ["Program", app.program.title] : null,
    typeof app.intake === "object" && app.intake ? ["Intake", fmtDate(app.intake.startDate)] : null,
    typeof app.job === "object" && app.job ? ["Role", app.job.title] : null,
    typeof app.event === "object" && app.event ? ["Event", app.event.title] : null,
  ].filter(Boolean) as [string, string][];
  return (
    <div className="grid gap-6">
      <Link
        href={`/office/applicants?type=${app.type}`}
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Applicants
      </Link>
      <PageHeader
        title={app.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{app.ref}</span>
            <Pill tone="blue">{titleCase(app.type)}</Pill>
            <Pill tone={STATUS_TONE[app.status]}>
              {app.status === "review" ? "under review" : app.status}
            </Pill>
            <span>applied {timeAgo(app.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <a
              href={`mailto:${app.email}?subject=${encodeURIComponent(`Your application ${app.ref}`)}`}
              className={btnPrimary}
            >
              <Mail className="size-4" aria-hidden /> Email
            </a>
            {phone && (
              <a
                href={`https://wa.me/${phone.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className={btn}
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            )}
            <a href={`/admin/collections/applications/${app.id}`} className={btn}>
              <ExternalLink className="size-4" aria-hidden /> Admin
            </a>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          <Card title={app.subject || "Application"}>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ["Email", app.email],
                ["Phone", app.phone],
                ...linked,
                ...answers.map(([k, v]) => [
                  titleCase(k.replace(/([A-Z])/g, " $1").toLowerCase()),
                  show(v),
                ]),
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-[0.75rem] text-fg-muted">{k}</dt>
                    <dd className="text-body-sm break-words whitespace-pre-line">{v as string}</dd>
                  </div>
                ))}
            </dl>
            {app.consent?.guardian && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--bg-sunken)] px-3 py-2 text-body-sm">
                <ShieldAlert className="size-4 text-[var(--accent-spark-text)]" aria-hidden /> Under
                18 · guardian: {app.consent.guardian}
              </p>
            )}
          </Card>
          {files.length > 0 && (
            <Card title="Documents">
              <ul className="grid gap-2">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-subtle px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-body-sm">
                      <FileText className="size-4 shrink-0 text-accent" aria-hidden />
                      <span className="truncate">{f.filename}</span>
                    </span>
                    {f.scanStatus === "clean" || f.scanStatus === "skipped" ? (
                      <a
                        href={f.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-body-sm font-medium text-accent"
                      >
                        Open
                      </a>
                    ) : (
                      <Pill tone={f.scanStatus === "infected" ? "red" : "orange"}>
                        {f.scanStatus === "infected" ? "quarantined" : "scanning"}
                      </Pill>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title={`Team notes (${app.notes?.length ?? 0})`}>
            <ol className="mb-4 grid gap-3">
              {(app.notes ?? []).map((n, i) => (
                <li key={n.id ?? i} className="rounded-xl bg-[var(--bg-sunken)] p-3">
                  <p className="text-body-sm whitespace-pre-line">{n.body}</p>
                  <p className="mt-1 text-[0.75rem] text-fg-muted">
                    {typeof n.author === "object" && n.author
                      ? n.author.name || n.author.email
                      : "Staff"}{" "}
                    · {timeAgo(n.at)}
                  </p>
                </li>
              ))}
            </ol>
            <NoteForm id={app.id} kind="application" />
          </Card>
        </div>
        <Card title="Review" className="h-fit xl:sticky xl:top-6">
          <ApplicationControls
            id={app.id}
            status={app.status}
            statuses={APPLICATION_STATUSES}
            rating={app.rating}
            assignee={typeof app.assignee === "object" ? app.assignee?.id : app.assignee}
            users={users}
            notify={app.notifyApplicant !== false}
          />
        </Card>
      </div>
    </div>
  );
}
