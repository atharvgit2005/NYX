import type { Metadata } from "next";
import { Outfit, Barlow_Condensed } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL('https://nyxstudio.tech'),
  title: {
    default: "NYX STUDIO | AI-Powered Content Studio",
    template: "%s | NYX Studio"
  },
  description: "AI-powered content studio helping D2C brands grow through content production, paid media, and influencer marketing.",
  icons: {
    icon: "/logo/logo.png",
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
    title: "NYX Studio",
    description: "AI-Powered Content Studio for D2C Brands",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: './',
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${barlowCondensed.variable}`}>
      <body className="font-sans antialiased">
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
