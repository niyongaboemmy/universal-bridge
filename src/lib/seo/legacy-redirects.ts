// SRS §5.3 — legacy URLs from the old site, kept alive with 301s.
// Hash URLs (/#about, /#services) can't reach the server; see LegacyHashRedirect.
export const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/team", destination: "/company/leadership" },
  { source: "/agents", destination: "/company/partners" },
  { source: "/application", destination: "/academy/apply" },
  { source: "/internship", destination: "/academy/internships" },
  { source: "/online_trainings", destination: "/academy/programs?mode=online" },
  { source: "/physical_trainings", destination: "/academy/programs?mode=in-person" },
];

export const legacyHashRedirects: Record<string, string> = {
  "#about": "/company/about",
  "#services": "/services",
  "#team": "/company/leadership",
  "#contact": "/contact",
};
