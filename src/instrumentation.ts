import type { Instrumentation } from "next";

/** Server start: configuration check (NFR-MNT-06). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { checkEnv } = await import("./lib/env");
  const { errors, warnings } = checkEnv();
  // Real deployments only: local production builds (localhost) and CI keep running.
  const local = /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const production =
    process.env.NODE_ENV === "production" &&
    !local &&
    process.env.VERCEL_ENV !== "preview" &&
    process.env.CI !== "true";
  for (const w of warnings) if (production) console.warn(`[env] ${w}`);
  if (errors.length && production && process.env.ALLOW_INSECURE_ENV !== "1") {
    throw new Error(`[env] Configuration problems:\n- ${errors.join("\n- ")}`);
  }
}

/** Every server-side request error goes to the error tracker (NFR-REL-05). */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { reportError } = await import("./lib/report-error");
  await reportError(error, { path: request.path, method: request.method, kind: context.routeType });
};
