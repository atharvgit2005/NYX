import type { Metadata } from "next";
import { Outfit, Barlow_Condensed, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import GlobalAnimations from "@/components/GlobalAnimations";
import AuthProvider from '@/components/AuthProvider'

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-outfit',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nyxstudio.tech'),
  title: {
    default: "AI-Powered Content Studio for D2C Brands | NYX Studio",
    template: "%s | NYX Studio"
  },
  description: "NYX Studio is an AI-native content and growth studio for D2C brands in India. We handle paid media, creative production, influencer ops, and full-funnel strategy.",
  alternates: {
    canonical: 'https://www.nyxstudio.tech',
  },
  verification: {
    google: 'google15745e31bbfe363b',
  },
  icons: {
    icon: "/logo/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "NYX Studio",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NYX Studio - AI Powered Content Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nyxstudiosai",
    images: ["/og-image.jpg"],
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import SchemaOrg from "@/components/SchemaOrg";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NYX Studio",
  "url": "https://www.nyxstudio.tech",
  "logo": "https://www.nyxstudio.tech/logo/NYX-Logo.png",
  "description": "AI-native content and growth studio for D2C brands in India",
  "sameAs": [
    "https://www.instagram.com/nyx.studios.ai/",
    "https://www.linkedin.com/company/nyx-studio-ai/"
  ],
  "founder": [
    { "@type": "Person", "name": "Atharv Paharia" },
    { "@type": "Person", "name": "Bhavya Jain" }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${barlowCondensed.variable} ${spaceGrotesk.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased">
        <SchemaOrg schema={organizationSchema} />
        <AuthProvider>
          <ThemeProvider>
            <GlobalAnimations />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
