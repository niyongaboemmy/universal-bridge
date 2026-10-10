import { Media } from "@/components/ui/Media";
import type { Media as MediaDoc, TeamMember } from "@/payload-types";

/**
 * Instructors (FR-ACA-03) and lab teams (FR-LAB-01): photo or initial, name,
 * role, short bio. FR-TEAM-03: no personal contact details, only LinkedIn.
 */
export function PeopleList({
  people,
  title,
}: {
  people: (number | TeamMember)[] | null | undefined;
  title: string;
}) {
  const list = (people ?? []).filter((p): p is TeamMember => typeof p === "object");
  if (!list.length) return null;
  return (
    <section>
      <h2 className="font-display text-heading-lg">{title}</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {list.map((p) => (
          <li key={p.id} className="flex gap-4 rounded-2xl border border-subtle bg-surface p-5">
            {p.photo && typeof p.photo === "object" ? (
              <Media
                media={p.photo as MediaDoc}
                sizes="56px"
                className="size-14 shrink-0 rounded-full"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-heading-md text-accent"
              >
                {p.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-semibold">
                {p.linkedinUrl ? (
                  <a
                    href={p.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    {p.name}
                  </a>
                ) : (
                  p.name
                )}
              </p>
              {p.title && <p className="text-body-sm text-fg-secondary">{p.title}</p>}
              {p.bio && <p className="mt-2 line-clamp-4 text-body-sm text-fg-secondary">{p.bio}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
