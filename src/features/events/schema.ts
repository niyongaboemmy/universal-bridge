import * as z from "zod/mini";
import {
  email,
  optionalPhone,
  optionalText,
  requiredConsent,
  requiredText,
} from "@/lib/forms/schema-helpers";

// SRS §7.2 Event registration.
export const eventSchema = z.object({
  event: z.string("required").check(z.minLength(1, "required")),
  name: requiredText(2, 120),
  email: email(),
  phoneCountry: optionalText(2),
  phone: optionalPhone(),
  organisation: optionalText(160),
  teamName: optionalText(80),
  consent: requiredConsent(),
});
