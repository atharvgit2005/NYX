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
  name: "NYX Studio",
  url: SITE_URL,
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

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: "NYX Studio",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/NYX-Logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description: "AI-native content and growth studio for D2C brands in India",
  email: "nyx.studios.ai@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411047",
    addressCountry: "IN",
  },
  areaServed: [
    {
      "@type": "Country",
      name: "India",
    },
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
  sameAs: [
    "https://www.instagram.com/nyx.studios.ai/",
    "https://www.linkedin.com/company/nyx-studio-ai/",
    "https://twitter.com/nyxstudiosai",
  ],
  founder: [
    { "@type": "Person", name: "Atharv Paharia" },
    { "@type": "Person", name: "Bhavya Jain" },
  ],
};
