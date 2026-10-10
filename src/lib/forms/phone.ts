import "server-only";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

/** FR-FORM-07: normalise to E.164, defaulting to Rwanda (+250). */
export function toE164(
  raw: string | undefined | null,
  country: string | undefined | null = "RW",
): string | null | false {
  if (!raw?.trim()) return null;
  const cc = (
    country && (getCountries() as string[]).includes(country) ? country : "RW"
  ) as CountryCode;
  const parsed = parsePhoneNumberFromString(raw, cc);
  return parsed?.isValid() ? parsed.number : false;
}

/** Calling codes for the phone country selector, computed on the server. */
export function callingCodes(): { code: string; dial: string }[] {
  return getCountries().map((code) => ({ code, dial: `+${getCountryCallingCode(code)}` }));
}
