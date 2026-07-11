import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { WorkAnimations } from "../components/WorkAnimations";
import { WorkGrid } from "../components/WorkGrid";
import "../page.css";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

import SchemaOrg from "@/components/SchemaOrg";
import { breadcrumbSchema, createMarketingMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = createMarketingMetadata({
  title: 'Work That Sells — D2C Creative Portfolio',
  description:
    'Scroll through NYX Studio\'s portfolio of food films, product campaigns, and cinematic reels built for D2C brands. Every frame designed to stop thumbs and drive conversions.',
  path: '/work',
  openGraphTitle: 'Work That Sells — D2C Creative Portfolio | NYX Studio',
  openGraphDescription:
    'Food films, product campaigns, and cinematic reels built for D2C brands.',
  twitterTitle: 'Work That Sells — D2C Creative Portfolio | NYX Studio',
  twitterDescription:
    'Food films, product campaigns, and cinematic reels built for D2C brands.',
});

const videoSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Dessertino Happiness Brand Film",
    "description": "Cinematic D2C product commercial created for Dessertino by NYX Studio.",
    "thumbnailUrl": `${SITE_URL}/og-image.jpg`,
    "uploadDate": "2026-06-15T08:00:00Z",
    "contentUrl": `${SITE_URL}/videos/dessertino_happiness.mp4`,
    "embedUrl": `${SITE_URL}/work`,
    "duration": "PT0M24S",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo/NYX-Logo-orange.png`
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Mango Jungle Product Film",
    "description": "Aggressive, high-hook product film for Mango Jungle beverage.",
    "thumbnailUrl": `${SITE_URL}/og-image.jpg`,
    "uploadDate": "2026-06-16T08:00:00Z",
    "contentUrl": `${SITE_URL}/videos/mango_jungle.mp4`,
    "embedUrl": `${SITE_URL}/work`,
    "duration": "PT0M24S",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo/NYX-Logo-orange.png`
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Mango Shower Commercial",
    "description": "Creative visual concept for Mango Shower Dessertino variant.",
    "thumbnailUrl": `${SITE_URL}/og-image.jpg`,
    "uploadDate": "2026-06-17T08:00:00Z",
    "contentUrl": `${SITE_URL}/videos/mango_shower_dessertino.mp4`,
    "embedUrl": `${SITE_URL}/work`,
    "duration": "PT0M24S",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo/NYX-Logo-orange.png`
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Brioso Unboxing Experience",
    "description": "Zine-style cinematic unboxing campaign for Brioso apparel brand.",
    "thumbnailUrl": `${SITE_URL}/og-image.jpg`,
    "uploadDate": "2026-06-18T08:00:00Z",
    "contentUrl": `${SITE_URL}/videos/brioso_unboxing.mp4`,
    "embedUrl": `${SITE_URL}/work`,
    "duration": "PT0M24S",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo/NYX-Logo-orange.png`
      }
    }
  }
];



export default function AdWorkPage() {
    return (
        <>
        <SchemaOrg
          schema={[
            ...videoSchemas,
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Work', path: '/work' },
            ]),
          ]}
        />

            <div className="font-body selection:bg-secondary selection:text-black min-h-screen relative w-full overflow-hidden bg-[#131313] text-[#e5e2e1]">
                {/* TopAppBar */}
                <SiteHeader active="work" />

                {/* Canvas Background */}
                <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
                    <div className="absolute inset-0 noise-texture"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest via-[#0e0e0e] to-[#1a0a05]"></div>
                </div>

                <main className="pt-24 md:pt-32 px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto pb-[72px] md:pb-0 overflow-x-hidden">
                    <WorkAnimations />
                    {/* Hero Header */}
                    <header className="mb-16 md:mb-24 relative">
                        <div className="absolute -top-6 md:-top-12 -left-4 md:-left-12 text-[#D83C14] opacity-20 text-[6rem] sm:text-[9rem] md:text-[15rem] font-black select-none pointer-events-none leading-none">WORK</div>
                        <h1 className="text-[clamp(2.75rem,15vw,12rem)] font-headline font-black leading-[0.8] tracking-tighter uppercase relative reveal-text">
                            <span className="block">CONCEPTS &</span>
                            <span className="text-[#D83C14] block">EARLY WORK</span>
                        </h1>
                        <div className="mt-12 pt-8 border-t-2 border-neutral-800">
                            <p className="font-label text-secondary uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm mb-6">* TRUSTED_BY</p>
                            <div className="flex flex-wrap items-center gap-6 md:gap-8">
                                {/* Dessertino Card */}
                                <div className="bg-white border-2 border-black px-5 py-2 flex items-center justify-center h-14 w-44 shadow-[4px_4px_0px_#000000] rounded-none">
                                    <div className="relative h-10 w-full">
                                        <Image
                                            src="/logo/Dessertino-Logo.png"
                                            alt="Dessertino"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Habibs Card */}
                                <div className="bg-white border-2 border-black px-5 py-2 flex items-center justify-center h-14 w-44 shadow-[4px_4px_0px_#000000] rounded-none">
                                    <div className="relative h-8 w-full">
                                        <Image
                                            src="/logo/Habibs.png"
                                            alt="Habibs"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Newton School Card */}
                                <div className="bg-white border-2 border-black px-5 py-2 flex items-center justify-center h-14 w-44 shadow-[4px_4px_0px_#000000] rounded-none overflow-hidden">
                                    <div className="relative h-8 w-full">
                                        <Image
                                            src="/logo/Newton-School.png"
                                            alt="Newton School"
                                            fill
                                            className="object-contain invert"
                                        />
                                    </div>
                                </div>

                                {/* & Many More Card */}
                                <div className="border-2 border-dashed border-neutral-700 px-6 py-2 flex items-center justify-center h-14 w-44 rounded-none select-none">
                                    <span className="font-headline text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-neutral-400">
                                        &amp; MANY MORE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Full Width Bento Grid */}
                    <div className="mb-20 md:mb-32">
                        <WorkGrid />
                    </div>

                    {/* Next Project CTA */}
                    <section className="mt-20 md:mt-32 mb-12 border-4 border-black bg-[#ffb4a2] p-6 sm:p-10 md:p-16 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 md:p-4">
                            <span aria-hidden="true" className="material-symbols-outlined !text-6xl md:!text-9xl text-black/10 group-hover:text-black/20 transition-colors">add_circle</span>
                        </div>
                        <div className="relative z-10">
                            <h2 className="font-headline text-[clamp(2rem,8vw,6rem)] font-black leading-tight uppercase text-black reveal-text">
                                <span className="block">YOUR PROJECT IS</span>
                                <span className="text-black block leading-tight mt-2">NEXT IN LINE</span>
                            </h2>
                            <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                                <p className="font-body text-base md:text-xl text-black font-medium max-w-xl">We are currently accepting new partners for the Q3-Q4 broadcast cycle. Let&apos;s build something that demands attention.</p>
                                <Link className="bg-black text-white px-6 md:px-12 py-4 md:py-6 text-lg md:text-2xl font-headline font-bold uppercase group-hover:translate-x-4 active:translate-x-1 transition-transform zine-shadow whitespace-nowrap" href="/contact">
                                    BOOK A DISCOVERY →
                                </Link>
                            </div>
                        </div>
                        {/* Registration Marks */}
                        <div className="absolute top-4 left-4 font-headline text-black text-2xl">+</div>
                        <div className="absolute bottom-4 right-4 font-headline text-black text-2xl">+</div>
                    </section>
                </main>

                {/* Footer */}
                <SiteFooter />
                <MobileNav />
            </div>
        </>
    );
}
