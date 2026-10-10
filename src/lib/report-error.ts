/**
 * NFR-REL-05: server errors to Sentry over its HTTP envelope API (no SDK, no
 * client JavaScript). Only the error, route and release are sent: no request
 * bodies, cookies, headers or query strings (privacy by design).
 */
type Context = { path?: string; method?: string; kind?: string };

function parseDsn(dsn: string) {
  const u = new URL(dsn);
  const projectId = u.pathname.replace(/^\//, "");
  return { key: u.username, host: u.host, protocol: u.protocol, projectId };
}

export async function reportError(error: unknown, ctx: Context = {}) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const { key, host, protocol, projectId } = parseDsn(dsn);
    const err = error instanceof Error ? error : new Error(String(error));
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "node",
      level: "error",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      transaction: ctx.path?.split("?")[0],
      tags: { method: ctx.method, kind: ctx.kind },
      exception: {
        values: [
          {
            type: err.name,
            value: err.message.slice(0, 500),
            stacktrace: {
              frames: (err.stack ?? "")
                .split("\n")
                .slice(1, 30)
                .reverse()
                .map((l) => ({ function: l.trim().slice(0, 200) })),
            },
          },
        ],
      },
    };
    const body = `${JSON.stringify({ event_id: eventId, dsn })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;
    await fetch(
      `${protocol}//${host}/api/${projectId}/envelope/?sentry_key=${key}&sentry_version=7`,
      {
        method: "POST",
        headers: { "content-type": "application/x-sentry-envelope" },
        body,
        signal: AbortSignal.timeout(3000),
      },
    );
  } catch {
    // Reporting must never throw.
  }
}
