import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LazyOpeningEditor as OpeningEditor } from "@/components/office/lazy";
import { PageHeader } from "@/components/office/ui";
import { requirePermission } from "@/features/office/session";

export const metadata = { title: "New opening" };

export default async function NewOpening({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requirePermission("openings.manage");
  const { kind } = await searchParams;
  return (
    <div className="office-page grid gap-5">
      <Link
        href="/office/openings"
        className="inline-flex items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Openings
      </Link>
      <PageHeader title="New opening" subtitle="Saved as a draft until you set it to open." />
      <OpeningEditor
        opening={{ kind: kind ?? "academy", status: "draft" }}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
      />
    </div>
  );
}
