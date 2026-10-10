import * as z from "zod/mini";
import {
  email,
  mustAccept,
  optionalEnum,
  optionalPhone,
  optionalText,
  requiredChoice,
  requiredConsent,
  requiredText,
} from "@/lib/forms/schema-helpers";

export const TIERS = ["associate", "partner", "strategic"] as const;
export const PARTNER_GENDERS = ["female", "male", "other", "undisclosed"] as const;

// SRS §7.2 Partner / agent application.
export const partnerSchema = z.object({
  name: requiredText(2, 120),
  email: email(),
  phoneCountry: optionalText(2),
  phone: optionalPhone(),
  gender: optionalEnum(PARTNER_GENDERS),
  location: requiredText(2, 120),
  profession: requiredText(2, 120),
  tier: requiredChoice(TIERS),
  network: requiredText(20, 2000),
  acceptsConditions: mustAccept(),
  consent: requiredConsent(),
});
