import * as z from "zod/mini";
import {
  email,
  fileField,
  optionalDate,
  optionalPhone,
  optionalText,
  optionalUrl,
  requiredConsent,
  requiredText,
} from "@/lib/forms/schema-helpers";

// SRS §7.2 Job application (also the open application when `job` is empty).
export const jobSchema = z.object({
  job: optionalText(20),
  roleInterest: optionalText(160),
  name: requiredText(2, 120),
  email: email(),
  phoneCountry: optionalText(2),
  phone: optionalPhone(),
  location: requiredText(2, 120),
  linkedin: optionalUrl(),
  portfolio: optionalUrl(),
  cv: fileField(),
  coverNote: requiredText(40, 4000),
  earliestStart: optionalDate(),
  consent: requiredConsent(),
});
