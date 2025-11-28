import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalAnimations from "@/components/GlobalAnimations";
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: "NYX - AI Content Automation",
  description: "Automate Your Content Empire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GlobalAnimations />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
