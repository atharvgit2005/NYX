import type { Metadata } from "next";
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: 'AI Content Automation for D2C Brands',
  description:
    'NYX Studio\'s AI pipeline automates end-to-end content production — scripts, voiceovers, video, and distribution. Scale your content output without scaling your team.',
  openGraph: {
    title: 'AI Content Automation for D2C Brands | NYX Studio',
    description:
      'Automate scripts, voiceovers, video, and distribution. Scale content without scaling headcount.',
    url: 'https://www.nyxstudio.tech/automate',
  },
  twitter: {
    title: 'AI Content Automation for D2C Brands | NYX Studio',
    description:
      'Automate scripts, voiceovers, video, and distribution. Scale content without scaling headcount.',
  },
  alternates: {
    canonical: 'https://www.nyxstudio.tech/automate',
  },
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
