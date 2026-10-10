// Option lists without zod, so the form can render before validation code loads.
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

export type ContactInput = {
  department: (typeof DEPARTMENTS)[number];
  name: string;
  email: string;
  company?: string;
  country?: string;
  phoneCountry?: string;
  phone?: string;
  services?: string[];
  budgetRange?: "" | (typeof BUDGETS)[number];
  timeline?: "" | (typeof TIMELINES)[number];
  message: string;
  source?: "" | (typeof SOURCES)[number];
  product?: string;
  consent?: unknown;
  marketing?: unknown;
};
