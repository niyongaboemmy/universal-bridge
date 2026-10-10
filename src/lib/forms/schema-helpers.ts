import * as z from "zod/mini";

// zod/mini keeps the client bundle small (~3 KB vs ~17 KB for classic zod).
// Error messages are i18n keys with an optional ":arg" (see FieldError).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const requiredText = (min: number, max: number) =>
  z
    .string("required")
    .check(
      z.trim(),
      z.minLength(1, "required"),
      z.minLength(min, `tooShort:${min}`),
      z.maxLength(max, `tooLong:${max}`),
    );

export const optionalText = (max: number) =>
  z.optional(z.string().check(z.trim(), z.maxLength(max, `tooLong:${max}`)));

export const email = () =>
  z
    .string("required")
    .check(
      z.trim(),
      z.minLength(1, "required"),
      z.maxLength(254, "tooLong:254"),
      z.regex(EMAIL_RE, "email"),
    );

/** Loose check shared with the client; the server normalises to E.164 with libphonenumber. */
export const optionalPhone = () =>
  z.optional(z.string().check(z.trim(), z.regex(/^$|^[+\d\s().-]{6,20}$/, "phone")));

export const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.optional(z.union([z.literal(""), z.enum(values)]));

const truthy = z.union([z.literal(true), z.literal("on"), z.literal("true")]);

/**
 * Unticked by default; must be ticked to submit (FR-FORM-04). A refine (not a
 * union) so the client resolver reports our "consent" message, not a branch error.
 */
export const requiredConsent = () => z.unknown().check(z.refine(isChecked, "consent"));
export const optionalCheckbox = () =>
  z.optional(z.union([truthy, z.literal(false), z.literal("")]));

export const isChecked = (v: unknown) => v === true || v === "on" || v === "true";

export const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;
export const optionalUrl = () =>
  z.optional(
    z
      .string()
      .check(
        z.trim(),
        z.maxLength(300, "tooLong:300"),
        z.regex(/^$|^https?:\/\/[^\s.]+\.[^\s]{2,}$/i, "url"),
      ),
  );

/** ISO date (yyyy-mm-dd) from an <input type="date">. */
export const requiredDate = () =>
  z.string("required").check(z.minLength(1, "required"), z.regex(/^\d{4}-\d{2}-\d{2}$/, "date"));
export const optionalDate = () =>
  z.optional(z.string().check(z.regex(/^$|^\d{4}-\d{2}-\d{2}$/, "date")));

export const requiredChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values, "required");

/** Must be ticked (programme conditions, guardian consent…). */
export const mustAccept = () => z.unknown().check(z.refine(isChecked, "mustAccept"));

/** Files are checked on the server by magic bytes (ADR-004); the client only sees a FileList. */
export const fileField = () => z.optional(z.any());

export { ageOn } from "@/lib/time/age";
