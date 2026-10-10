/** FormData → plain object. `arrayKeys` are collected with getAll (checkbox groups). */
export function formDataToObject(
  formData: FormData,
  arrayKeys: string[] = [],
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION") || key === "cf-turnstile-response") continue;
    const values = formData.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = arrayKeys.includes(key) ? values : (values[0] ?? "");
  }
  for (const key of arrayKeys) out[key] ??= [];
  return out;
}

/** Flatten zod issues to { field: "messageKey[:arg]" } (first error per field). */
export function issuesToFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "_form");
    errors[field] ??= issue.message;
  }
  return errors;
}
