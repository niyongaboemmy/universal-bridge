import "server-only";

export type CalStatus = "ok" | "missing" | "unknown";

/**
 * Checks that the Cal.com event exists, so /book never embeds Cal's own
 * "404 — This page does not exist" (UI/UX audit P0-2). Cached for an hour with
 * the page; a network failure is "unknown" and the embed is still offered.
 */
export async function calLinkStatus(calLink: string | undefined): Promise<CalStatus> {
  if (!calLink) return "missing";
  try {
    const res = await fetch(`https://cal.com/${calLink}`, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return "missing";
    return res.ok ? "ok" : "unknown";
  } catch {
    return "unknown";
  }
}
