import type { Metadata } from "next";
import Link from "next/link";
import { WorkAnimations } from "../components/WorkAnimations";
import { WorkGrid } from "../components/WorkGrid";
import "../page.css";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

import SchemaOrg from "@/components/SchemaOrg";
import { breadcrumbSchema, createMarketingMetadata, SITE_URL, defaultOgImage } from "@/lib/seo";

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
    "name": "Dessertino Happiness",
    "description": "A delightful exploration of sweetness and joy - cinematic food film by NYX Studio.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": `${SITE_URL}/videos/dessertino_happiness.mp4`,
    "url": `${SITE_URL}/work`,
    "duration": "PT19S",
    "uploadDate": "2026-01-01",
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
    "name": "Mango Jungle",
    "description": "Creative D2C product film by NYX Studio.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": `${SITE_URL}/videos/mango_jungle.mp4`,
    "url": `${SITE_URL}/work`,
    "duration": "PT15S",
    "uploadDate": "2026-01-01",
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
    "name": "Mango Shower",
    "description": "Art direction and creative production by NYX Studio for Dessertino.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": `${SITE_URL}/videos/mango_shower_dessertino.mp4`,
    "url": `${SITE_URL}/work`,
    "duration": "PT10S",
    "uploadDate": "2026-01-01",
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
    "name": "Brioso Unboxing",
    "description": "Product unboxing film - experience the reveal and product details.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": `${SITE_URL}/videos/brioso_unboxing.mp4`,
    "url": `${SITE_URL}/work`,
    "duration": "PT8S",
    "uploadDate": "2026-01-01",
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
    color: "group-hover:bg-[#d83c14]/10 group-hover:border-[#d83c14]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#F97316] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="20" height="20" rx="3" fill="#D83C14" />
        <path d="M12 15 L18 15 L15 25 Z" fill="white" />
        <text x="35" y="26" className="font-headline font-bold text-sm tracking-tight fill-current">DESSERTINO</text>
      </svg>
    )
  },
  {
    name: "Habibs",
    category: "B2C Hair & Beauty",
    color: "group-hover:bg-[#ffd65b]/10 group-hover:border-[#ffd65b]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#ffd65b] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="27" className="font-serif italic font-extrabold text-lg tracking-[0.15em] fill-current">HABIBS</text>
      </svg>
    )
  },
  {
    name: "Newton School",
    category: "B2B / EdTech",
    color: "group-hover:bg-[#00c6ff]/10 group-hover:border-[#00c6ff]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#00c6ff] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,20 12,10 26,10 33,20 26,30 12,30" fill="#00c6ff" />
        <text x="16" y="24" className="font-sans font-black text-[10px] fill-black text-center" textAnchor="middle">N</text>
        <text x="38" y="26" className="font-sans font-black text-[10px] tracking-tighter fill-current">NEWTON SCHOOL</text>
      </svg>
    )
  },
  {
    name: "Vertex Realty",
    category: "B2B / Real Estate",
    color: "group-hover:bg-[#ff3b30]/10 group-hover:border-[#ff3b30]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#ff3b30] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 25 L15 10 L25 25 Z" fill="#D83C14" />
        <path d="M20 25 L25 18 L30 25 Z" fill="white" opacity="0.8" />
        <text x="36" y="26" className="font-headline font-black text-[10px] tracking-widest fill-current">VERTEX REALTY</text>
      </svg>
    )
  },
  {
    name: "Mango Jungle",
    category: "D2C Beverage",
    color: "group-hover:bg-[#4ade80]/10 group-hover:border-[#4ade80]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#4ade80] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="20" r="10" fill="#ffd65b" />
        <path d="M12 15 C15 15, 18 12, 18 10 C18 12, 22 15, 22 15 Z" fill="#4ade80" />
        <text x="32" y="26" className="font-headline font-black text-[10px] tracking-tight fill-current">MANGO JUNGLE</text>
      </svg>
    )
  },
  {
    name: "Brioso",
    category: "D2C Apparel & Lifestyle",
    color: "group-hover:bg-[#F2A7C3]/10 group-hover:border-[#F2A7C3]",
    svg: (
      <svg viewBox="0 0 160 40" className="h-6 w-auto text-white group-hover:text-[#F2A7C3] transition-colors fill-current" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="27" className="font-headline font-black text-lg tracking-[0.1em] fill-current">BRIOSO</text>
      </svg>
    )
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
                        <div className="lg:col-span-3 border-4 border-black bg-[#0d0d0d] p-6 relative zine-shadow select-none">
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
                                        className={`group border-2 border-neutral-800 bg-[#121212] p-4 flex flex-col justify-between min-h-[96px] transition-all duration-300 ${partner.color}`}
                                    >
                                        <div className="flex items-center justify-start flex-grow">
                                            {partner.svg}
                                        </div>
                                        <span className="font-label text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300 mt-3 block">
                                            {partner.category}
                                        </span>
                                    </div>
                                ))}
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
