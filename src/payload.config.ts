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
import { Media } from "./collections/Media";
import { Outbox } from "./collections/Outbox";
import { Users } from "./collections/Users";
import { ubEmailAdapter } from "./lib/email/payload-adapter";
import { storagePlugins } from "./lib/storage";
import { Announcement } from "./globals/Announcement";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · UB Admin" },
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
    Applications,
    PrivateFiles,
    Certificates,
    Subscribers,
    Users,
    Outbox,
    AuditLog,
  ],
  globals: [Navigation, SiteSettings, Announcement],
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
});
