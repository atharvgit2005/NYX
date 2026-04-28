import type { Metadata } from "next";
import { Outfit, Barlow_Condensed, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import GlobalAnimations from "@/components/GlobalAnimations";
import AuthProvider from '@/components/AuthProvider'
import { ThemeProvider } from "@/components/ThemeProvider";
import SchemaOrg from "@/components/SchemaOrg";

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
    default: 'Stop Scrolling. Start Converting. | NYX Studio — AI Content Agency India',
    template: '%s | NYX Studio',
  },
  description:
    'NYX Studio builds AI-powered content systems for D2C brands in India. Cinematic reels, aggressive paid media, and influencer ops — all under one roof. Currently onboarding Q3 2026 brand partners.',
  openGraph: {
    type: 'website',
    siteName: 'NYX Studio',
    title: 'Stop Scrolling. Start Converting. | NYX Studio',
    description:
      'NYX Studio builds AI-powered content systems for D2C brands in India. Cinematic reels, aggressive paid media, and influencer ops — all under one roof.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NYX Studio — We make brands impossible to scroll past',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Scrolling. Start Converting. | NYX Studio',
    description:
      'AI-powered content and growth studio for D2C brands in India.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.nyxstudio.tech',
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NYX Studio",
  "url": "https://www.nyxstudio.tech",
  "logo": "https://www.nyxstudio.tech/logo/NYX-Logo.png",
  "description": "AI-native content and growth studio for D2C brands in India",
  "sameAs": [
    "https://www.instagram.com/nyx.studios.ai/",
    "https://www.linkedin.com/company/nyx-studio-ai/",
    "https://twitter.com/nyxstudiosai"
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
