import type { Metadata } from "next";
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: "AI Content Automation for Brands | NYX Studio",
  description: "Automate your content workflows with NYX Studio's AI-native production pipeline. Faster output, lower cost, higher performance.",
  alternates: {
    canonical: 'https://www.nyxstudio.tech/automate',
  },
  openGraph: {
    title: "AI Content Automation for Brands | NYX Studio",
    description: "Automate your content workflows with NYX Studio's AI-native production pipeline. Faster output, lower cost, higher performance.",
    url: "https://www.nyxstudio.tech/automate",
  },
  twitter: {
    title: "AI Content Automation for Brands | NYX Studio",
    description: "Automate your content workflows with NYX Studio's AI-native production pipeline. Faster output, lower cost, higher performance.",
  },
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
