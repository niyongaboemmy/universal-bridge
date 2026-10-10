/** "+250782634364" → "+250 782 634 364" (display only; links keep E.164). */
export function formatPhone(e164: string): string {
  const m = /^\+(250|254|255|256|257|243)(\d{3})(\d{3})(\d{3})$/.exec(e164);
  if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  return e164.replace(/^(\+\d{1,3})(\d+)$/, "$1 $2");
}
