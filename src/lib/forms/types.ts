// Shared by server actions and client forms.
export type FormErrorCode = "generic" | "rateLimited" | "botCheckFailed" | "closed" | "signIn";

export type FormState = {
  status: "idle" | "success" | "error";
  ref?: string;
  /** Academy intake was full: the application went on the waitlist (FR-ACA-06). */
  waitlisted?: boolean;
  /** field → encoded message key, e.g. "tooShort:2" (translated on the client). */
  fieldErrors?: Record<string, string>;
  formError?: FormErrorCode;
  /** Echo of submitted values, so a no-JS re-render keeps what the user typed. */
  values?: Record<string, string | string[]>;
};

export const initialFormState: FormState = { status: "idle" };

/** Bump when the consent wording changes (FR-FORM-04). */
export const CONSENT_VERSION = "privacy-2026-10-v1";

/** Hidden honeypot field name — humans never see or fill it. */
export const HONEYPOT_FIELD = "website";
