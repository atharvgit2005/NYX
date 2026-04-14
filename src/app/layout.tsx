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
  title: "NYX - AI Content Automation",
  description: "Automate Your Content Empire",
  icons: {
    icon: "/logo/logo.png",
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
