import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WorkAnimations } from "../components/WorkAnimations";
import { WorkGrid } from "../components/WorkGrid";
import "../page.css";
import { MobileNav } from "../components/MobileNav";

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
    "contentUrl": "https://www.nyxstudio.tech/videos/dessertino_happiness.mp4",
    "url": "https://www.nyxstudio.tech/work",
    "duration": "PT19S",
    "uploadDate": "2026-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.nyxstudio.tech/logo/NYX-Logo.png"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Mango Jungle",
    "description": "Creative D2C product film by NYX Studio.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": "https://www.nyxstudio.tech/videos/mango_jungle.mp4",
    "url": "https://www.nyxstudio.tech/work",
    "duration": "PT15S",
    "uploadDate": "2026-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.nyxstudio.tech/logo/NYX-Logo.png"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Mango Shower",
    "description": "Art direction and creative production by NYX Studio for Dessertino.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": "https://www.nyxstudio.tech/videos/mango_shower_dessertino.mp4",
    "url": "https://www.nyxstudio.tech/work",
    "duration": "PT10S",
    "uploadDate": "2026-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.nyxstudio.tech/logo/NYX-Logo.png"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Brioso Unboxing",
    "description": "Product unboxing film - experience the reveal and product details.",
    "thumbnailUrl": `${SITE_URL}${defaultOgImage.url}`,
    "contentUrl": "https://www.nyxstudio.tech/videos/brioso_unboxing.mp4",
    "url": "https://www.nyxstudio.tech/work",
    "duration": "PT8S",
    "uploadDate": "2026-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "NYX Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.nyxstudio.tech/logo/NYX-Logo.png"
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
                <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 bg-[#0E0E0E] dark:bg-black border-b-4 border-black dark:border-white/10 rounded-none">
                    <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center relative flex-shrink-0">
                            <Image
                                src="/logo/NYX-Logo.png"
                                alt="NYX Studio logo"
                                width={120}
                                height={40}
                                unoptimized
                                className="h-full w-full object-contain"
                                sizes="(max-width: 768px) 32px, 40px"
                            />
                        </div>
                        <div className="text-xl md:text-3xl font-black tracking-tighter text-white dark:text-[#F5C518] font-headline uppercase whitespace-nowrap">
                            NYX STUDIO
                        </div>
                    </Link>
                    <div className="hidden md:flex gap-12 items-center">
                        <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 transition-all duration-75" href="/work">WORK</Link>
                        <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/services">SERVICES</Link>
                        <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/contact">CONTACT</Link>
                        <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/portal">PORTAL</Link>
                    </div>
                    <Link href="/contact" className="bg-[#ffb4a2] px-3 md:px-6 py-1 md:py-2 text-black font-headline font-bold text-[0.75rem] md:text-base uppercase tracking-tighter border-4 border-black hover:bg-[#F5C518] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000000] transition-all duration-75 inline-block whitespace-nowrap">
                        LET&apos;S TALK →
                    </Link>
                </nav>

                {/* Canvas Background */}
                <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
                    <div className="absolute inset-0 noise-texture"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest via-[#0e0e0e] to-[#1a0a05]"></div>
                </div>

                <main className="pt-24 md:pt-32 px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto pb-[72px] md:pb-0 overflow-x-hidden">
                    <WorkAnimations />
                    {/* Hero Header */}
                    <header className="mb-16 md:mb-24 relative">
                        <div className="absolute -top-6 md:-top-12 -left-4 md:-left-12 text-[#E8441A] opacity-20 text-[6rem] sm:text-[9rem] md:text-[15rem] font-black select-none pointer-events-none leading-none">WORK</div>
                        <h1 className="text-[clamp(2.75rem,15vw,12rem)] font-headline font-black leading-[0.8] tracking-tighter uppercase relative reveal-text">
                            <span className="block">CONCEPTS &</span>
                            <span className="text-[#E8441A] block">EARLY WORK</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-6 md:mt-8">
                            <span className="w-8 md:w-12 h-1 bg-[#F5C518] flex-shrink-0"></span>
                            <p className="font-label text-secondary uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-base">* THE MIDNIGHT MANIFESTO VOL. 01</p>
                        </div>
                    </header>

                    {/* Interactive Asymmetric Bento Grid */}
                    <WorkGrid />

                    {/* Next Project CTA */}
                    <section className="mt-20 md:mt-32 mb-12 border-4 border-black bg-[#ffb4a2] p-6 sm:p-10 md:p-16 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 md:p-4">
                            <span className="material-symbols-outlined !text-6xl md:!text-9xl text-black/10 group-hover:text-black/20 transition-colors">add_circle</span>
                        </div>
                        <div className="relative z-10">
                            <h2 className="font-headline text-[clamp(2rem,8vw,6rem)] font-black leading-tight uppercase text-black reveal-text">
                                <span className="block">YOUR PROJECT IS</span>
                                <span className="text-white group-hover:text-[#ffd65b] transition-colors block leading-tight mt-2">NEXT IN LINE</span>
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
                <footer className="w-full flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 md:px-8 py-10 md:py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center relative">
                            <Image
                                src="/logo/NYX-Logo.png"
                                alt="NYX Studio logo"
                                width={120}
                                height={40}
                                unoptimized
                                className="h-full w-full object-contain"
                                sizes="32px"
                            />
                        </div>
                        <div className="text-xl font-bold text-white font-headline uppercase">
                            NYX STUDIO
                        </div>
                    </Link>
                    <div className="flex flex-wrap justify-center gap-8">
                        <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                        <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.linkedin.com/company/nyx-studio-ai/" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
                        <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://twitter.com/nyxstudiosai" target="_blank" rel="noopener noreferrer">TWITTER</a>
                        <Link className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="/work">ARCHIVE</Link>
                    </div>
                    <div className="font-body text-xs uppercase tracking-widest text-white">
                        © 2026 NYX Studio
                    </div>
                </footer>
                <MobileNav />
            </div>
        </>
    );
}
