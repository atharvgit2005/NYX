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

const PARTNERS = [
  {
    name: "Dessertino",
    category: "D2C Food & Beverage",
    color: "hover:bg-[#d83c14]/10 hover:border-[#d83c14]",
    image: "/logo/Dessertino-Logo.png"
  },
  {
    name: "Habibs",
    category: "B2C Hair & Beauty",
    color: "hover:bg-[#ffd65b]/10 hover:border-[#ffd65b]",
    image: "/logo/Habibs.png"
  },
  {
    name: "Newton School",
    category: "B2B / EdTech",
    color: "hover:bg-[#00c6ff]/10 hover:border-[#00c6ff]",
    image: "/logo/Newton-School.png"
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
                        <div className="flex items-center gap-4 mt-6 md:mt-8">
                            <span className="w-8 md:w-12 h-1 bg-[#F5C518] flex-shrink-0"></span>
                            <p className="font-label text-secondary uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base">* THE MIDNIGHT MANIFESTO VOL. 01</p>
                        </div>
                    </header>

                    {/* Two-Column Layout: Bento Grid + Trusted Partner Logos */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20 md:mb-32">
                        {/* Left/Main Column: Work Grid */}
                        <div className="lg:col-span-9">
                            <WorkGrid />
                        </div>

                        {/* Right/Sidebar Column: Brand Logo Registry */}
                        <div className="lg:col-span-3 border-4 border-black bg-[#0d0d0d] p-6 relative zine-shadow select-none w-full">
                            {/* Registration marks */}
                            <div className="absolute top-2 left-2 text-[#D83C14] text-xs font-bold">+</div>
                            <div className="absolute bottom-2 right-2 text-[#D83C14] text-xs font-bold">+</div>

                            <span className="font-label text-primary uppercase text-xs tracking-widest block mb-3">* CLIENT_REGISTRY</span>
                            <h2 className="font-headline text-3xl font-black uppercase tracking-tight mb-6 border-b-4 border-black pb-4 text-white">
                                TRUSTED BY
                            </h2>

                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                {PARTNERS.map((partner) => (
                                    <div
                                        key={partner.name}
                                        className={`group border-2 border-neutral-800 bg-[#121212] p-4 flex flex-col justify-between min-h-[110px] transition-all duration-300 ${partner.color}`}
                                    >
                                        <div className="flex items-center justify-start flex-grow relative h-10 w-full">
                                            <Image
                                                src={partner.image}
                                                alt={partner.name}
                                                fill
                                                className="object-contain object-left filter brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:filter-none transition-all duration-300"
                                            />
                                        </div>
                                        <span className="font-label text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 mt-4 block">
                                            {partner.category}
                                        </span>
                                    </div>
                                ))}

                                {/* "& Many More" Card */}
                                <div className="group border-2 border-dashed border-neutral-700 bg-transparent p-4 flex flex-col justify-center items-center min-h-[110px] transition-all duration-300 hover:border-[#D83C14] hover:bg-[#D83C14]/5 text-center">
                                    <span className="font-headline text-base font-bold text-neutral-400 group-hover:text-white uppercase tracking-wider">
                                        &amp; Many More...
                                    </span>
                                </div>
                            </div>
                        </div>
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
