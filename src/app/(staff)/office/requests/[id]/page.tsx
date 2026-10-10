/* eslint-disable @next/next/no-html-link-for-pages -- the admin is a separate root layout. */
import { ArrowLeft, ExternalLink, FolderPlus, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadControls, NoteForm } from "@/components/office/controls";
import { fmtDate, timeAgo, titleCase } from "@/components/office/format";
import { Card, PageHeader, Pill, STATUS_TONE, btn, btnPrimary } from "@/components/office/ui";
import { LEAD_STATUSES } from "@/collections/Leads";
import { leadKind, staffUsers } from "@/features/office/data";
import { officeUser } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Lead } from "@/payload-types";

export const metadata = { title: "Request" };

const BACK = {
  service: ["/office/requests", "Service requests"],
  demo: ["/office/demos", "Demo requests"],
  message: ["/office/messages", "Messages"],
} as const;

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  // Any lead kind the user may see (the collection's access scopes it).
  const user = await officeUser();
  const id = Number((await params).id);
  const p = await payload();
  const lead = (await p
    .findByID({ collection: "leads", id, depth: 1, user, overrideAccess: false })
    .catch(() => null)) as Lead | null;
  if (!lead) notFound();
  const users = await staffUsers();
  const kind = leadKind(lead);
  // Demo requests go back to their product's pipeline.
  const [backHref, backLabel] =
    kind === "demo" && lead.product
      ? [`/office/demos/${lead.product}`, `${titleCase(lead.product)} demos`]
      : BACK[kind];
  const phone = lead.phone?.replace(/[^\d+]/g, "");
  const details: [string, React.ReactNode][] = [
    ["Company", lead.company],
    ["Country", lead.country],
    ["Phone", lead.phone],
    ["Department", titleCase(lead.department)],
    ["Product", lead.product ? titleCase(lead.product) : null],
    [
      "Services",
      Array.isArray(lead.services) ? (lead.services as string[]).map(titleCase).join(", ") : null,
    ],
    ["Budget", lead.budgetRange],
    ["Timeline", lead.timeline],
    ["Heard about us", lead.source],
    ["Language", lead.tracking?.locale?.toUpperCase()],
    [
      "Campaign",
      lead.tracking?.utm
        ? Object.values(lead.tracking.utm as Record<string, string>)
            .filter(Boolean)
            .join(" · ")
        : null,
    ],
    ["Came from", lead.tracking?.referrer],
    ["Marketing consent", lead.consent?.marketing ? "Yes" : "No"],
    [
      "First reply",
      lead.firstResponseAt
        ? `${fmtDate(lead.firstResponseAt)} (${timeAgo(lead.firstResponseAt)})`
        : "Not yet",
    ],
  ];
  return (
    <div className="grid gap-6">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> {backLabel}
      </Link>
      <PageHeader
        title={lead.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{lead.ref}</span>
            <Pill tone={STATUS_TONE[lead.status]}>{lead.status}</Pill>
            <span>received {timeAgo(lead.createdAt)}</span>
          </span>
        }
        actions={
          <>
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: your request ${lead.ref}`)}`}
              className={btnPrimary}
            >
              <Mail className="size-4" aria-hidden /> Email
            </a>
            {phone && (
              <>
                <a href={`tel:${phone}`} className={btn}>
                  <Phone className="size-4" aria-hidden /> Call
                </a>
                <a
                  href={`https://wa.me/${phone.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className={btn}
                >
                  <MessageCircle className="size-4" aria-hidden /> WhatsApp
                </a>
              </>
            )}
            {kind !== "message" && lead.status === "won" && (
              <Link href={`/office/projects/new?lead=${lead.id}`} className={btn}>
                <FolderPlus className="size-4" aria-hidden /> Start a project
              </Link>
            )}
            <a href={`/admin/collections/leads/${lead.id}`} className={btn}>
              <ExternalLink className="size-4" aria-hidden /> Admin
            </a>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid content-start gap-6">
          <Card title="Message">
            <p className="text-body-sm whitespace-pre-line">{lead.message}</p>
            <p className="mt-4 text-[0.8125rem] text-fg-muted">
              <a href={`mailto:${lead.email}`} className="hover:text-accent">
                {lead.email}
              </a>
            </p>
          </Card>
          <Card title="Details">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {details
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[0.75rem] text-fg-muted">{k}</dt>
                    <dd className="text-body-sm">{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>
          <Card title={`Team notes (${lead.notes?.length ?? 0})`}>
            <ol className="mb-4 grid gap-3">
              {(lead.notes ?? []).map((n, i) => (
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
            <NoteForm id={lead.id} kind="lead" />
          </Card>
        </div>
        <Card title="Manage" className="h-fit xl:sticky xl:top-6">
          <LeadControls
            id={lead.id}
            status={lead.status}
            statuses={LEAD_STATUSES}
            assignee={typeof lead.assignee === "object" ? lead.assignee?.id : lead.assignee}
            users={users}
            value={lead.value}
            currency={lead.currency}
            nextFollowUpAt={lead.nextFollowUpAt}
          />
        </Card>
      </div>
    </div>
  );
}
