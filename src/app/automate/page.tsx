import type { Metadata } from "next";
import LandingPage from '@/components/LandingPage';
import { createMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = createMarketingMetadata({
  title: 'AI Content Automation for D2C Brands',
  description:
    'NYX Studio\'s AI pipeline automates end-to-end content production - scripts, voiceovers, video, and distribution. Scale your content output without scaling your team.',
  path: '/automate',
  openGraphTitle: 'AI Content Automation for D2C Brands | NYX Studio',
  openGraphDescription:
    'Automate scripts, voiceovers, video, and distribution. Scale content without scaling headcount.',
  twitterTitle: 'AI Content Automation for D2C Brands | NYX Studio',
  twitterDescription:
    'Automate scripts, voiceovers, video, and distribution. Scale content without scaling headcount.',
});

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
