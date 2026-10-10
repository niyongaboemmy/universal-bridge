// Company facts from SRS §2.1. Contact channels follow the OI-03/OI-12
// defaults in docs/IMPLEMENTATION-PLAN.md §14 until UB confirms them.
export const siteSettings = {
  email: "hello@universalbridge.rw",
  phones: [
    { label: "Office", number: "+250782634364" },
    { label: "Academy", number: "+250781299528" },
  ],
  whatsapp: { enabled: true, number: "+250782634364" },
  address: {
    street: "11 KN 89 St, Nyabugogo–Muhima Road",
    building: "Maison Voisin Building, 1st floor",
    district: "Nyarugenge",
    city: "Kigali",
    country: "Rwanda",
    landmark: "Opposite King Sports Ltd",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Maison+Voisin+Building+KN+89+St+Kigali",
    lat: -1.9441,
    lng: 30.0557,
  },
  officeHours: {
    openHour: 8,
    closeHour: 17,
    days: ["1", "2", "3", "4", "5"] as ("1" | "2" | "3" | "4" | "5")[],
  },
  social: [
    {
      network: "linkedin" as const,
      url: "https://www.linkedin.com/company/universal-bridge-ltd-2333ba1aa",
    },
    { network: "facebook" as const, url: "https://www.facebook.com/RwandaUniversalBridgeLtd" },
    { network: "instagram" as const, url: "https://www.instagram.com/universal_bridge_ltd" },
    { network: "x" as const, url: "https://x.com/UniversalBridg2" },
  ],
  legalName: "Universal Bridge Ltd",
  foundingYear: 2019,
};
