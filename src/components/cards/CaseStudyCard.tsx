import { ArrowUpRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { Badge } from "@/components/ui/Badge";
import type { CaseStudy } from "@/payload-types";
import { cn } from "@/lib/utils";

export function clientLabel(cs: Pick<CaseStudy, "client">) {
  return cs.client?.anonymised ? (cs.client.label ?? "") : (cs.client?.name ?? "");
}

/** Case-study card (UI/UX §12.4): image, client, industry chip, big result number. */
export function CaseStudyCard({
  cs,
  href,
  industry,
  large,
}: {
  cs: CaseStudy;
  href: string;
  industry?: string;
  large?: boolean;
}) {
  const headline = cs.results?.[0];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-surface shadow-1 transition-[transform,box-shadow] duration-[var(--dur-base)] hover:-translate-y-1 hover:shadow-3">
      <div
        className={cn("night relative overflow-hidden", large ? "aspect-[16/10]" : "aspect-[16/9]")}
      >
        <Media
          media={cs.cover}
          sizes="(min-width: 1024px) 40vw, 100vw"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
          className="absolute inset-0"
        />
        {headline && (
          <div className="absolute bottom-0 left-0 m-4 rounded-lg bg-black/55 px-4 py-3 text-white backdrop-blur-sm">
            <p className="font-display text-heading-lg leading-none">{headline.value}</p>
            <p className="mt-1 text-body-sm text-white/85">{headline.label}</p>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-body-sm text-fg-secondary">
          <span>{clientLabel(cs)}</span>
          {industry && <Badge tone="accent">{industry}</Badge>}
        </div>
        <h3 className="mt-3 font-display text-heading-md">
          <a href={href} className="after:absolute after:inset-0">
            {cs.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-fg-secondary">{cs.summary}</p>
        <ArrowUpRight
          aria-hidden
          className="mt-auto size-5 self-end pt-4 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </article>
  );
}
