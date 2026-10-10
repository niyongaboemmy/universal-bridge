import { siteUrl } from "@/lib/utils";

// SEO-04 JSON-LD builders.
export function organizationLd(s: {
  legalName?: string | null;
  email?: string | null;
  phones?: { number: string }[] | null;
  social?: { url: string }[] | null;
  address?: {
    street?: string | null;
    city?: string | null;
    country?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
  foundingYear?: number | null;
}) {
  const org = {
    "@type": ["Organization", "LocalBusiness"],
    "@id": siteUrl("/#organization"),
    name: s.legalName ?? "Universal Bridge Ltd",
    url: siteUrl("/"),
    logo: siteUrl("/brand/ub-mark.svg"),
    foundingDate: s.foundingYear ? String(s.foundingYear) : undefined,
    email: s.email ?? undefined,
    telephone: s.phones?.[0]?.number,
    sameAs: s.social?.map((x) => x.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address?.street ?? undefined,
      addressLocality: s.address?.city ?? "Kigali",
      addressCountry: "RW",
    },
    geo: s.address?.lat
      ? { "@type": "GeoCoordinates", latitude: s.address.lat, longitude: s.address.lng }
      : undefined,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: s.email ?? undefined,
      availableLanguage: ["en", "fr", "rw"],
    },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        "@id": siteUrl("/#website"),
        url: siteUrl("/"),
        name: org.name,
        publisher: { "@id": org["@id"] },
        inLanguage: ["en", "fr", "rw"],
      },
    ],
  };
}

export function serviceLd(s: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    url: s.url,
    provider: { "@id": siteUrl("/#organization") },
    areaServed: "Worldwide",
  };
}

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function productLd(p: {
  name: string;
  description?: string | null;
  url: string;
  externalUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    description: p.description ?? undefined,
    url: p.externalUrl ?? p.url,
    applicationCategory: "BusinessApplication",
    publisher: { "@id": siteUrl("/#organization") },
  };
}
