import "server-only";

// Cloudflare's documented always-pass test secret.
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export type BotCheck = "passed" | "failed" | "missing";

/**
 * FR-FORM-03. Verifies a Turnstile token server-side. A missing token means the
 * visitor had no JavaScript (FR-FORM-10): the caller accepts the submission
 * with a stricter rate limit and flags it for review (IMPLEMENTATION-PLAN §13).
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string | null,
): Promise<BotCheck> {
  if (!token) return "missing";
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === "production" ? "failed" : "passed";
  // The test key always passes; skip the network round-trip outside production.
  if (secret === TEST_SECRET && process.env.NODE_ENV !== "production") return "passed";
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success ? "passed" : "failed";
  } catch {
    // Cloudflare unreachable: don't lose a real lead; rate limits still apply.
    return "missing";
  }
}
