/**
 * NFR-SEC-05 staff password policy (NIST SP 800-63B style): length over
 * composition rules, plus a blocklist and no reuse of the person's own details.
 */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const COMMON = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd",
  "qwerty",
  "qwertyuiop",
  "letmein",
  "welcome",
  "admin",
  "administrator",
  "changeme",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "universalbridge",
  "universal-bridge",
  "kigali",
  "rwanda",
  "123456789012",
  "111111111111",
]);

export function passwordProblem(
  password: unknown,
  context: { email?: string | null; name?: string | null } = {},
): string | null {
  if (typeof password !== "string") return "Password is required.";
  if (password.length < PASSWORD_MIN)
    return `Use at least ${PASSWORD_MIN} characters. A short sentence works well.`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || COMMON.has(lower.replace(/[^a-z0-9]/g, "")))
    return "This password is too common.";
  if (/^(.)\1+$/.test(password)) return "Don't repeat a single character.";
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local))
    return "Don't include your email address.";
  for (const part of (context.name ?? "").toLowerCase().split(/\s+/)) {
    if (part.length >= 4 && lower.includes(part)) return "Don't include your name.";
  }
  return null;
}
