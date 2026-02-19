import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import GlobalAnimations from "@/components/GlobalAnimations";
import AuthProvider from '@/components/AuthProvider'

const quicksand = Quicksand({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NYX - AI Content Automation",
  description: "Automate Your Content Empire",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={quicksand.className}>
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
