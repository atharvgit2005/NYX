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
  title: "NYX STUDIO | AI Content & Performance Engine",
  description: "NYX Studio is a performance-driven AI content engine. We build custom content ecosystems that scale reach and drive real growth for the next generation of brands.",
  icons: {
    icon: "/logo/logo.png",
  },
  openGraph: {
    title: "NYX STUDIO | AI Content & Performance Engine",
    description: "Automate your content empire with high-performance AI ecosystems.",
    url: "https://nyxstudio.tech",
    siteName: "NYX Studio",
    locale: "en_US",
    type: "website",
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
