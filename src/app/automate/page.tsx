import type { Metadata } from "next";
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: "AI Content Automation for Brands | NYX Studio",
  description: "Automate your content workflows with NYX Studio's AI-native production pipeline. Faster output, lower cost, higher performance.",
  alternates: {
    canonical: '/automate',
  },
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
