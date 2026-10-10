// Lazy schema registry for the form engine: zod loads on first interaction.
export const schemaLoaders = {
  academy: () => import("@/features/academy/schema").then((m) => m.academySchema),
  internship: () => import("@/features/academy/schema").then((m) => m.internshipSchema),
  job: () => import("@/features/careers/schema").then((m) => m.jobSchema),
  partner: () => import("@/features/partners/schema").then((m) => m.partnerSchema),
  event: () => import("@/features/events/schema").then((m) => m.eventSchema),
  newsletter: () => import("@/features/newsletter/schema").then((m) => m.newsletterSchema),
} as const;

export type SchemaKey = keyof typeof schemaLoaders;
