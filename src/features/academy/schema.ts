import * as z from "zod/mini";
import {
  ageOn,
  email,
  fileField,
  isChecked,
  optionalCheckbox,
  optionalEnum,
  optionalPhone,
  optionalText,
  optionalUrl,
  requiredChoice,
  requiredConsent,
  requiredDate,
  requiredText,
} from "@/lib/forms/schema-helpers";
import { EDUCATION, GENDERS, MODES, SOURCES, STATUSES, TRACKS, YEARS } from "./options";

// SRS §7.2 Academy application. One schema for client and server (FR-FORM-01).
export const academySchema = z
  .object({
    intake: z.string("required").check(z.minLength(1, "required")),
    name: requiredText(2, 120),
    email: email(),
    phoneCountry: optionalText(2),
    phone: optionalPhone(),
    dateOfBirth: requiredDate(),
    gender: optionalEnum(GENDERS), // PRV-07: optional
    country: optionalText(2),
    district: optionalText(80),
    educationLevel: requiredChoice(EDUCATION),
    currentStatus: requiredChoice(STATUSES),
    preferredMode: requiredChoice(MODES),
    motivation: requiredText(40, 3000),
    source: optionalEnum(SOURCES),
    guardianName: optionalText(120),
    guardianConsent: optionalCheckbox(),
    consent: requiredConsent(),
  })
  .check(
    // PRV-08: under-18s need a named parent/guardian who agrees.
    z.superRefine((d, ctx) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dateOfBirth)) return;
      const age = ageOn(d.dateOfBirth);
      if (age < 10 || age > 100)
        ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "date" });
      if (age < 18) {
        if (!d.guardianName || d.guardianName.trim().length < 2)
          ctx.addIssue({ code: "custom", path: ["guardianName"], message: "under18Guardian" });
        if (!isChecked(d.guardianConsent))
          ctx.addIssue({ code: "custom", path: ["guardianConsent"], message: "under18Guardian" });
      }
    }),
  );

// SRS §7.2 Internship application.
export const internshipSchema = z.object({
  track: requiredChoice(TRACKS),
  name: requiredText(2, 120),
  email: email(),
  phoneCountry: optionalText(2),
  phone: optionalPhone(),
  institution: requiredText(2, 160),
  fieldOfStudy: requiredText(2, 120),
  yearOfStudy: requiredChoice(YEARS),
  availability: requiredDate(),
  cv: fileField(),
  portfolio: optionalUrl(),
  motivation: requiredText(40, 3000),
  consent: requiredConsent(),
});
