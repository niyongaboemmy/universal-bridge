// Permission catalog: every feature of the office, the CMS and member accounts.
// Roles (the `roles` collection) are named bundles of these keys; `super` holds all of them.
// Plain data, safe to import from client components.

export type PermissionGroup = "office" | "admin" | "content" | "member";

export const PERMISSIONS = [
  // Company office
  { key: "office.overview", group: "office", label: "Overview dashboard" },
  { key: "requests.view", group: "office", label: "Service requests · view" },
  { key: "requests.manage", group: "office", label: "Service requests · move & edit" },
  { key: "demos.view", group: "office", label: "Demo requests · view" },
  { key: "demos.manage", group: "office", label: "Demo requests · move & edit" },
  { key: "messages.view", group: "office", label: "Messages · view" },
  { key: "messages.manage", group: "office", label: "Messages · reply & close" },
  { key: "applicants.academy", group: "office", label: "Trainee applicants" },
  { key: "applicants.internship", group: "office", label: "Internship applicants" },
  { key: "applicants.job", group: "office", label: "Job applicants" },
  { key: "applicants.partner", group: "office", label: "Partner & agent applicants" },
  { key: "applicants.event", group: "office", label: "Event sign-ups" },
  { key: "openings.view", group: "office", label: "Openings · view" },
  { key: "openings.manage", group: "office", label: "Openings · create & edit" },
  { key: "projects.view", group: "office", label: "Projects · view" },
  { key: "projects.manage", group: "office", label: "Projects · create & edit" },
  { key: "people.view", group: "office", label: "Employees · view" },
  { key: "people.manage", group: "office", label: "Employees · create & edit" },
  { key: "analytics.view", group: "office", label: "Website analytics" },
  { key: "subscribers.view", group: "office", label: "Newsletter subscribers" },
  // Administration
  { key: "users.manage", group: "admin", label: "Staff accounts" },
  { key: "members.manage", group: "admin", label: "Member accounts" },
  { key: "roles.manage", group: "admin", label: "Roles & permissions" },
  { key: "settings.manage", group: "admin", label: "System settings" },
  { key: "privacy.manage", group: "admin", label: "Privacy requests" },
  { key: "audit.view", group: "admin", label: "Audit log" },
  { key: "data.export", group: "admin", label: "CSV exports" },
  { key: "cms.access", group: "admin", label: "Open the CMS" },
  // Website content
  { key: "content.site", group: "content", label: "Pages, services, posts & menus" },
  { key: "content.academy", group: "content", label: "Programs, intakes & certificates" },
  { key: "content.careers", group: "content", label: "Job posts" },
  { key: "content.team", group: "content", label: "Team members" },
  { key: "content.media", group: "content", label: "Media library" },
  { key: "content.announcement", group: "content", label: "Announcement bar" },
  { key: "content.liveEdit", group: "content", label: "Edit the live site" },
  // Member accounts (people who register on the website)
  { key: "member.profile", group: "member", label: "Own profile" },
  { key: "member.apply", group: "member", label: "Apply to openings" },
  { key: "member.applications", group: "member", label: "Track own applications" },
] as const satisfies readonly { key: string; group: PermissionGroup; label: string }[];

export type Permission = (typeof PERMISSIONS)[number]["key"];
export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key) as Permission[];

export const PERMISSION_GROUPS: Record<PermissionGroup, string> = {
  office: "Company office",
  admin: "Administration",
  content: "Website content",
  member: "Member accounts",
};

const OFFICE_BASE: Permission[] = [
  "office.overview",
  "analytics.view",
  "cms.access",
  "data.export",
];

/** Built-in roles, created at start-up when missing. Their permissions stay editable. */
export const SYSTEM_ROLES: {
  slug: string;
  name: string;
  audience: "staff" | "member";
  color: string;
  description: string;
  permissions: Permission[];
}[] = [
  {
    slug: "super",
    name: "Super admin",
    audience: "staff",
    color: "orange",
    description: "Everything, including accounts, roles and settings.",
    permissions: PERMISSION_KEYS.filter((k) => !k.startsWith("member.")),
  },
  {
    slug: "editor",
    name: "Editor",
    audience: "staff",
    color: "blue",
    description: "Website content and event sign-ups.",
    permissions: [
      ...OFFICE_BASE,
      "applicants.event",
      "subscribers.view",
      "content.site",
      "content.careers",
      "content.team",
      "content.media",
      "content.announcement",
      "content.liveEdit",
    ],
  },
  {
    slug: "academy",
    name: "Academy",
    audience: "staff",
    color: "violet",
    description: "Trainees, interns, events, programs and certificates.",
    permissions: [
      ...OFFICE_BASE,
      "applicants.academy",
      "applicants.internship",
      "applicants.event",
      "openings.view",
      "openings.manage",
      "content.academy",
      "content.media",
      "content.announcement",
      "content.liveEdit",
    ],
  },
  {
    slug: "hr",
    name: "HR",
    audience: "staff",
    color: "green",
    description: "Employees, job and internship applicants, job posts.",
    permissions: [
      ...OFFICE_BASE,
      "applicants.internship",
      "applicants.job",
      "openings.view",
      "openings.manage",
      "projects.view",
      "people.view",
      "people.manage",
      "content.careers",
      "content.team",
      "content.media",
      "content.liveEdit",
    ],
  },
  {
    slug: "sales",
    name: "Sales",
    audience: "staff",
    color: "amber",
    description: "Service and demo requests, messages, partners and projects.",
    permissions: [
      ...OFFICE_BASE,
      "requests.view",
      "requests.manage",
      "demos.view",
      "demos.manage",
      "messages.view",
      "messages.manage",
      "applicants.partner",
      "projects.view",
      "projects.manage",
      "subscribers.view",
      "content.liveEdit",
    ],
  },
  {
    slug: "visitor",
    name: "Visitor",
    audience: "member",
    color: "slate",
    description: "Registered on the website; can apply to openings.",
    permissions: ["member.profile", "member.apply"],
  },
  {
    slug: "applicant",
    name: "Applicant",
    audience: "member",
    color: "teal",
    description: "Has applied at least once; can follow their applications.",
    permissions: ["member.profile", "member.apply", "member.applications"],
  },
];

export const ROLE_COLORS = ["blue", "orange", "violet", "green", "amber", "teal", "rose", "slate"];
