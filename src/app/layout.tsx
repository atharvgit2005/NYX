import type { Metadata, Viewport } from "next";
import { Outfit, Barlow_Condensed, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import GlobalAnimations from "@/components/GlobalAnimations";
import AuthProvider from '@/components/AuthProvider'
import { ThemeProvider } from "@/components/ThemeProvider";
import SchemaOrg from "@/components/SchemaOrg";
import { SITE_URL, defaultOgImage, organizationSchema, websiteSchema } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    // 47 chars — within Google's ~60-char SERP cutoff. Long-tail keyword
    // ("AI Content Agency India") moves to the description / OG title.
    default: 'Stop Scrolling. Start Converting. | NYX Studio',
    template: '%s | NYX Studio',
  },
  description:
    'NYX Studio builds AI-powered content systems for D2C brands in India. Cinematic reels, aggressive paid media, and influencer ops - all under one roof. Currently onboarding Q3 2026 brand partners.',
  openGraph: {
    type: 'website',
    siteName: 'NYX Studio',
    locale: 'en_IN',
    title: 'Stop Scrolling. Start Converting. | NYX Studio',
    description:
      'NYX Studio builds AI-powered content systems for D2C brands in India. Cinematic reels, aggressive paid media, and influencer ops - all under one roof.',
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Scrolling. Start Converting. | NYX Studio',
    description:
      'AI-powered content and growth studio for D2C brands in India.',
    images: [defaultOgImage.url],
  },
  alternates: {
    canonical: SITE_URL,
    // India-targeted English variant — soft signal to Google that this
    // site is the right answer for users searching from .in. Add more
    // entries here if/when we localise (e.g. en-US for global brands).
    languages: {
      'en-IN': SITE_URL,
      'x-default': SITE_URL,
    },
    // RSS auto-discovery. Lets readers + Perplexity/Bing find the feed
    // without a robots.txt hint, and lets browsers offer the
    // "Subscribe…" affordance when present.
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  // PWA + icons (next/metadata generates the matching <link> tags).
  // Reuses /logo/NYX-Logo.png for the larger sizes; the 64px variant
  // covers shortcut icons on Android home screens.
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/NYX-Logo-orange-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo/NYX-Logo-orange-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/logo/NYX-Logo-orange-192.png',
  },
  // Stops iOS Safari from auto-linking phone numbers in marketing copy
  // — important here since the contact page lists email but no phone.
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: 'NYX Studio',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Matches the manifest + brand canvas — sets the Android Chrome
  // address-bar tint and the iOS PWA status bar.
  themeColor: '#0e0e0e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${barlowCondensed.variable} ${spaceGrotesk.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SchemaOrg schema={[organizationSchema, websiteSchema]} />
        <AuthProvider>
          <ThemeProvider>
            <GlobalAnimations />
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
