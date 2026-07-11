import type { Metadata } from "next";
import Link from "next/link";
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
                        <div className="mt-16 w-full border-4 border-black bg-[#0d0d0d] select-none shadow-[6px_6px_0px_#000000]">
                            {/* Header row */}
                            <div className="border-b-4 border-black px-6 py-4 bg-[#090909] flex items-center">
                                <span className="w-2.5 h-2.5 rounded-none bg-[#D83C14] mr-3"></span>
                                <p className="font-headline text-[10px] sm:text-xs font-black tracking-[0.2em] text-neutral-400 uppercase">
                                    PARTNERS_&amp;_COLLABORATORS
                                </p>
                            </div>

                            {/* Cards grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                                {/* Dessertino */}
                                <div className="p-8 flex flex-col items-center justify-center text-center bg-transparent group min-h-[160px] hover:bg-[#121212] transition-colors duration-300">
                                    <div className="mb-4 h-12 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 40 40" className="h-10 w-10 fill-none stroke-current" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="11" y="13" width="18" height="21" rx="2" />
                                            <line x1="20" y1="13" x2="20" y2="34" />
                                            <line x1="25" y1="13" x2="29" y2="5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <span className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-white transition-colors duration-300">
                                        DESSERTINO
                                    </span>
                                </div>

                                {/* Habibs */}
                                <div className="p-8 flex flex-col items-center justify-center text-center bg-transparent group min-h-[160px] hover:bg-[#121212] transition-colors duration-300">
                                    <div className="mb-4 h-12 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 40 40" className="h-10 w-10 fill-none stroke-current" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                                            {/* Stylized scissors/beauty motif */}
                                            <circle cx="15" cy="28" r="5" />
                                            <circle cx="25" cy="28" r="5" />
                                            <line x1="17" y1="24" x2="23" y2="8" />
                                            <line x1="23" y1="24" x2="17" y2="8" />
                                        </svg>
                                    </div>
                                    <span className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-white transition-colors duration-300">
                                        HABIBS
                                    </span>
                                </div>

                                {/* Newton School */}
                                <div className="p-8 flex flex-col items-center justify-center text-center bg-transparent group min-h-[160px] hover:bg-[#121212] transition-colors duration-300">
                                    <div className="mb-4 h-12 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 40 40" className="h-10 w-10 fill-none stroke-current" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="20,5 33,12 33,28 20,35 7,28 7,12" />
                                            <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" className="font-sans font-black text-base fill-current stroke-none">N</text>
                                        </svg>
                                    </div>
                                    <span className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-white transition-colors duration-300">
                                        NEWTON SCHOOL
                                    </span>
                                </div>

                                {/* Add Brand / Many More */}
                                <div className="p-8 flex flex-col items-center justify-center text-center bg-transparent group min-h-[160px] hover:bg-[#121212] transition-colors duration-300 cursor-pointer">
                                    <div className="mb-4 h-12 flex items-center justify-center text-neutral-600 group-hover:text-white transition-colors">
                                        <svg viewBox="0 0 40 40" className="h-10 w-10 fill-none stroke-current" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="20" cy="20" r="12" />
                                            <line x1="20" y1="14" x2="20" y2="26" />
                                            <line x1="14" y1="20" x2="26" y2="20" />
                                        </svg>
                                    </div>
                                    <span className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-600 group-hover:text-white transition-colors duration-300">
                                        + ADD BRAND
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
