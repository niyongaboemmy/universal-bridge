/** Age in whole years on `on` (default today). Zod-free, safe for client bundles. */
export function ageOn(dob: string, on: Date = new Date()): number {
  const d = new Date(`${dob}T00:00:00Z`);
  let age = on.getUTCFullYear() - d.getUTCFullYear();
  const m = on.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < d.getUTCDate())) age--;
  return age;
}
