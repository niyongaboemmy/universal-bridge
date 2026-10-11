/**
 * Recognise Payload errors without relying on class names: production builds minify
 * them (Payload sets `this.name = this.constructor.name`, so "LockedAuth" becomes "o").
 */
export function isLockedAuth(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; message?: string };
  // Payload's English message (these requests carry no locale): "This user is locked due to…".
  return e.name === "LockedAuth" || /\bis locked\b/i.test(e.message ?? "");
}
