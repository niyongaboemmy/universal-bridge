import * as z from "zod/mini";
import { email, requiredConsent } from "@/lib/forms/schema-helpers";

// SRS §7.2 Newsletter: email + consent, then double opt-in.
export const newsletterSchema = z.object({ email: email(), consent: requiredConsent() });
