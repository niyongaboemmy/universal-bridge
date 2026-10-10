import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Intakes, Programs, TeamMembers } from "./collections/Academy";
import { Applications } from "./collections/Applications";
import { AuditLog } from "./collections/AuditLog";
import { Jobs } from "./collections/Careers";
import { Categories, Events, Hubs, Posts, PressItems } from "./collections/Content2";
import { Certificates } from "./collections/Certificates";
import { PrivateFiles } from "./collections/PrivateFiles";
import { Subscribers } from "./collections/Subscribers";
import { CaseStudies } from "./collections/CaseStudies";
import { Industries } from "./collections/Industries";
import { Pages } from "./collections/Pages";
import { Products } from "./collections/Products";
import { Services } from "./collections/Services";
import { Clients, Faqs, Stats, Technologies, Testimonials } from "./collections/taxonomy";
import { Leads } from "./collections/Leads";
import { Employees, PageViews, Projects } from "./collections/Company";
import { Media } from "./collections/Media";
import { Outbox } from "./collections/Outbox";
import { Avatars, ensureSystemRoles, Roles } from "./collections/Roles";
import { Users } from "./collections/Users";
import { Members } from "./collections/Members";
import { Notifications } from "./collections/Notifications";
import { Openings } from "./collections/Openings";
import { SystemSettings } from "./globals/SystemSettings";
import { ubEmailAdapter } from "./lib/email/payload-adapter";
import { storagePlugins } from "./lib/storage";
import { Announcement } from "./globals/Announcement";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · UB Admin" },
    // Browser extensions (e.g. Scribe) add attributes to <html> before React loads;
    // this only ignores differences on <html> itself, as on the website and the office.
    suppressHydrationWarning: true,
    // ADM-01: SSO buttons on the login screen; link to two-step verification in the nav.
    components: {
      afterLogin: ["@/components/admin/SsoButtons#SsoButtons"],
      afterNavLinks: ["@/components/admin/SecurityLink#SecurityLink"],
      views: {
        privacy: { Component: "@/components/admin/PrivacyView#PrivacyView", path: "/privacy" },
      },
    },
  },
  collections: [
    Pages,
    Services,
    Industries,
    CaseStudies,
    Products,
    Hubs,
    Posts,
    Categories,
    Events,
    PressItems,
    Programs,
    Intakes,
    Jobs,
    TeamMembers,
    Testimonials,
    Faqs,
    Stats,
    Technologies,
    Clients,
    Media,
    Leads,
    Employees,
    Projects,
    PageViews,
    Openings,
    Applications,
    PrivateFiles,
    Certificates,
    Subscribers,
    Users,
    Members,
    Roles,
    Avatars,
    Notifications,
    Outbox,
    AuditLog,
  ],
  globals: [Navigation, SiteSettings, Announcement, SystemSettings],
  editor: lexicalEditor(),
  email: ubEmailAdapter,
  plugins: [...storagePlugins()],
  secret: process.env.PAYLOAD_SECRET ?? "",
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Dev pushes schema changes automatically; staging/prod use migrations (pnpm db:migrate).
    push: process.env.NODE_ENV !== "production" && process.env.PAYLOAD_PUSH !== "0",
    migrationDir: path.resolve(dirname, "migrations"),
    // The cPanel server applies pending migrations on start: its bundle has no
    // Payload CLI (docs/DEPLOYMENT.md). Never during `next build`, which would
    // migrate (or stop at a prompt on) whatever database the build points at.
    ...(process.env.PAYLOAD_MIGRATE_ON_START === "1" ? { prodMigrations: migrations } : {}),
  }),
  // CMS-05: per-field localisation with English fallback.
  localization: {
    locales: [
      { code: "en", label: "English" },
      { code: "fr", label: "Français" },
      { code: "rw", label: "Ikinyarwanda" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  sharp,
  graphQL: { disable: true },
  telemetry: false,
  // Built-in roles (super, editor, …, visitor, applicant) exist on every database.
  onInit: async (payload) => {
    try {
      await ensureSystemRoles(payload);
    } catch (err) {
      payload.logger.warn({ err }, "Could not create the built-in roles yet (run migrations).");
    }
  },
});
