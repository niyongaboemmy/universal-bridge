// zod-free option lists, safe to import in client components.
export const GENDERS = ["female", "male", "other", "undisclosed"] as const;
export const EDUCATION = ["secondary", "tvet", "diploma", "bachelor", "master"] as const;
export const STATUSES = ["student", "employed", "unemployed", "other"] as const;
export const MODES = ["online", "in-person", "hybrid"] as const;
export const TRACKS = ["software", "design", "marketing", "hardware", "data"] as const;
export const YEARS = ["1", "2", "3", "4", "graduate"] as const;
export const SOURCES = ["search", "linkedin", "social", "referral", "event", "other"] as const;
