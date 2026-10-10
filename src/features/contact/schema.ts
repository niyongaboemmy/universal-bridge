import * as z from "zod/mini";
import {
  email,
  optionalCheckbox,
  optionalEnum,
  optionalPhone,
  optionalText,
  requiredConsent,
  requiredText,
} from "@/lib/forms/schema-helpers";

// SRS §7.2 project inquiry + FR-CON-02 department routing. One schema for
// client and server (FR-FORM-01).
export const DEPARTMENTS = [
  "sales",
  "academy",
  "careers",
  "partnerships",
  "press",
  "support",
] as const;
export const BUDGETS = ["lt5k", "5to15k", "15to50k", "50to150k", "gt150k", "unsure"] as const;
export const TIMELINES = ["asap", "1to3m", "3to6m", "exploring"] as const;
export const SOURCES = ["search", "linkedin", "social", "referral", "event", "other"] as const;

export const contactSchema = z.object({
  department: z.enum(DEPARTMENTS, "required"),
  name: requiredText(2, 120),
  email: email(),
  company: optionalText(160),
  country: optionalText(2),
  phoneCountry: optionalText(2),
  phone: optionalPhone(),
  services: z.optional(z.array(z.string().check(z.maxLength(60))).check(z.maxLength(12))),
  budgetRange: optionalEnum(BUDGETS),
  timeline: optionalEnum(TIMELINES),
  message: requiredText(20, 5000),
  source: optionalEnum(SOURCES),
  product: optionalText(80),
  consent: requiredConsent(),
  marketing: optionalCheckbox(),
});

export type ContactData = z.output<typeof contactSchema>;
