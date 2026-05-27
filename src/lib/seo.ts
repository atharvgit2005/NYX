import type { Metadata } from "next";

export const SITE_URL = "https://www.nyxstudio.tech";

export const defaultOgImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "NYX Studio - We make brands impossible to scroll past",
};

type MarketingMetadataInput = {
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};

export function createMarketingMetadata({
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
  twitterTitle,
  twitterDescription,
}: MarketingMetadataInput): Metadata {
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      siteName: "NYX Studio",
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url: canonical,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle ?? openGraphTitle ?? title,
      description: twitterDescription ?? openGraphDescription ?? description,
      images: [defaultOgImage.url],
    },
  };
}

/**
 * WebSite + SearchAction — eligible for the Sitelinks Search Box in
 * Google SERPs. The SearchAction `target` doesn't have to point at a
 * real internal search; pointing /work at a `?q=` param gives Google
 * a stable surface to render the search box against.
 */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  name: "NYX Studio",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}#organization` },
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/work?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * BreadcrumbList helper — takes an ordered list of crumbs (root last)
 * and returns the schema object ready to drop into <SchemaOrg>.
 *
 *   breadcrumbSchema([
 *     { name: 'Home',  path: '/' },
 *     { name: 'Work',  path: '/work' },
 *   ])
 */
export function breadcrumbSchema(
  crumbs: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.path === "/" ? SITE_URL : `${SITE_URL}${c.path}`,
    })),
  };
}

/**
 * Founder Person schemas — full E-E-A-T payload.
 *
 * Why this exists separately from `organizationSchema.founder`:
 *   • The /about page references each Person by `@id` so the same entity
 *     graph is consistent across the site (Person → worksFor → Org).
 *   • Answer engines (ChatGPT, Perplexity, Gemini, Copilot) read jobTitle,
 *     sameAs, knowsAbout, and image to decide *who* to cite for D2C content
 *     queries — not just *which org*.
 */
export const atharvSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#atharv`,
  name: "Atharv Paharia",
  givenName: "Atharv",
  familyName: "Paharia",
  jobTitle: "Co-Founder & Tech Lead",
  description:
    "Co-founder of NYX Studio. Leads the AI engineering, content production pipeline, and video automation systems that power the studio's D2C output.",
  image: `${SITE_URL}/founders/atharv.jpg`,
  url: `${SITE_URL}/about#atharv`,
  worksFor: { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "NYX Studio" },
  knowsAbout: [
    "AI-generated video",
    "Content production pipelines",
    "Direct-to-consumer marketing",
    "Brand films",
    "Performance creative",
  ],
  sameAs: [
    "https://www.linkedin.com/in/atharv-paharia-468276272/",
  ],
};

export const bhavyaSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#bhavya`,
  name: "Bhavya Jain",
  givenName: "Bhavya",
  familyName: "Jain",
  jobTitle: "Co-Founder & Product Lead",
  description:
    "Co-founder of NYX Studio. Leads brand strategy, product, and the partner-facing systems that translate D2C founder briefs into shipping content campaigns.",
  image: `${SITE_URL}/founders/bhavya.jpg`,
  url: `${SITE_URL}/about#bhavya`,
  worksFor: { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "NYX Studio" },
  knowsAbout: [
    "Direct-to-consumer brand strategy",
    "Product design for creative agencies",
    "Influencer marketing operations",
    "Indian D2C ecosystem",
    "Content calendar systems",
  ],
  sameAs: [
    "https://www.linkedin.com/in/bhavya-jain-10963b33a/",
  ],
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_URL}#organization`,
  name: "NYX Studio",
  legalName: "NYX Studio",
  alternateName: "NYX",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/NYX-Logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "AI-native content and growth studio for D2C brands in India. We build cinematic films, paid creative, influencer ops, and content automation for direct-to-consumer brands selling in India.",
  slogan: "We make brands impossible to scroll past.",
  foundingDate: "2025",
  foundingLocation: {
    "@type": "Place",
    name: "Pune, India",
  },
  email: "nyx.studios.ai@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411047",
    addressCountry: "IN",
  },
  // Centroid of Pune — gives "agency near me" / "Pune content agency"
  // queries a coordinate to rank against. Approximate, not the office
  // pin: we're not a walk-in business and don't want a Maps pin.
  geo: {
    "@type": "GeoCoordinates",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  areaServed: [
    {
      "@type": "Country",
      name: "India",
    },
  ],
  // Surfaces the three Service tiers as a structured catalog Google can
  // render as a sitelinks block. Prices are the published rack rates on
  // /services — keep in sync if those change.
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "NYX Studio packages",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Trial Pack",
        description:
          "30-day pilot: content strategy, 4 reels, 4 statics, 1 carousel. For D2C brands testing a content engine.",
        price: "30000",
        priceCurrency: "INR",
        url: `${SITE_URL}/services#trial`,
        eligibleRegion: { "@type": "Country", name: "India" },
      },
      {
        "@type": "Offer",
        name: "Starter Pack",
        description:
          "Monthly retainer: content strategy, 8 reels, 6 statics, paid social management, full creative ops.",
        price: "50000",
        priceCurrency: "INR",
        url: `${SITE_URL}/services#starter`,
        eligibleRegion: { "@type": "Country", name: "India" },
      },
      {
        "@type": "Offer",
        name: "Growth Pack",
        description:
          "Monthly retainer: end-to-end content + paid social + influencer ops + brand growth — for brands scaling past ₹1Cr/mo.",
        price: "80000",
        priceCurrency: "INR",
        url: `${SITE_URL}/services#growth`,
        eligibleRegion: { "@type": "Country", name: "India" },
      },
    ],
  },
  knowsAbout: [
    "Direct-to-consumer marketing",
    "AI-generated video",
    "Brand films",
    "Performance creative",
    "Influencer marketing in India",
    "Indian D2C content strategy",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "nyx.studios.ai@gmail.com",
      areaServed: "IN",
      availableLanguage: ["en"],
    },
  ],
  // Public profiles we control. Answer engines validate the entity against
  // every URL in this list — keep it accurate (don't list dead handles).
  sameAs: [
    "https://www.instagram.com/nyx.studios.ai/",
    "https://www.linkedin.com/company/nyx-studio-ai/",
  ],
  founder: [
    { "@id": `${SITE_URL}/about#atharv` },
    { "@id": `${SITE_URL}/about#bhavya` },
  ],
};

/**
 * Speakable schema marker — tells voice answer engines (Google Assistant,
 * Alexa, Siri snippets) which CSS selectors on the page contain the
 * answer-ready prose. Pair with a regular content schema, do not stand alone.
 *
 *   speakableSchema(['.faq-question', '.faq-answer'])
 *
 * Selectors are CSS, not XPath. Mark only the *answer* prose, not surrounding
 * navigation, headers, or boilerplate.
 */
export function speakableSchema(cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

/**
 * AboutPage schema — anchors the /about route and links back to the
 * Organization entity. AEO-favoured: AI Overview and Perplexity often
 * cite the /about page for "who is X" queries.
 */
export const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE_URL}/about`,
  mainEntity: { "@id": `${SITE_URL}#organization` },
  about: { "@id": `${SITE_URL}#organization` },
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}#website` },
};
