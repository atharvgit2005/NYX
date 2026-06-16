import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "./components/LeadForm";
import { AdAnimations } from "./components/AdAnimations";
import "./page.css";
import { MobileNav } from "./components/MobileNav";

import { LiveHub } from "./components/LiveHub";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { createMarketingMetadata } from "@/lib/seo";

export const metadata: Metadata = createMarketingMetadata({
  title: 'Stop Scrolling. Start Converting. | NYX Studio — AI Content Agency India',
  description:
    'NYX Studio builds AI-powered content systems for D2C brands in India. Cinematic reels, aggressive paid media, and influencer ops - all under one roof. Currently onboarding Q3 2026 brand partners.',
  path: '/',
  openGraphTitle: 'Stop Scrolling. Start Converting. | NYX Studio',
  openGraphDescription:
    'NYX Studio builds AI-powered content systems for D2C brands in India.',
  twitterTitle: 'Stop Scrolling. Start Converting. | NYX Studio',
  twitterDescription:
    'NYX Studio builds AI-powered content systems for D2C brands in India.',
});

export default function AdPage() {
  return (
    <>
      {/* Main wrapper containing body-level styling to isolate from global styles */}
      <div className="bg-surface-container-lowest text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen relative w-full overflow-hidden">
        {/* TopAppBar */}
        <SiteHeader active="home" rightSlot={<LiveHub />} />

        <main className="pt-[72px] md:pt-[88px] pb-[72px] md:pb-0">
            <AdAnimations />
            {/* Hero Section */}
            <section className="relative min-h-[520px] md:min-h-[680px] bg-surface-container-lowest px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col md:flex-row items-center gap-12 md:gap-10 border-b-4 border-black overflow-hidden">
                <div className="noise-texture absolute inset-0"></div>
                <div className="z-10 w-full md:w-3/5">
                    <h1 className="font-headline font-bold text-[2.75rem] sm:text-[3.5rem] md:text-[6rem] leading-[0.9] tracking-[-0.04em] md:tracking-[-0.05em] uppercase mb-8 md:mb-12 reveal-text">
                        <span className="block">We make brands</span>
                        <span className="text-primary-container block">impossible</span>
                        <span className="block">to scroll past.</span>
                    </h1>
                    <Link href="/contact" className="bg-primary text-on-primary-fixed font-headline font-bold text-base md:text-xl px-6 md:px-10 py-4 md:py-5 uppercase border-4 border-black hover:bg-[#ffd65b] hover:shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all inline-flex items-center gap-3 md:gap-4 w-fit">
                        Book a Call <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
                {/* Camcorder viewfinder — nods to NYX's content/reel craft.
                    Decorative only; the message lives in the <h1>. */}
                <div className="relative w-full md:w-2/5 flex justify-center items-center" aria-hidden="true">
                    <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px] aspect-[4/5] border-4 border-black shadow-[10px_10px_0_#000] overflow-hidden">
                        {/* scene: warm brand gradient + grain + scanlines */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a3c] via-[#D83C14] to-[#3c0700]"></div>
                        <div className="noise-texture absolute inset-0" style={{ opacity: 0.18 }}></div>
                        <div className="absolute inset-0 hero-scanlines"></div>
                        {/* cinematic vignette for depth */}
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(0,0,0,0.55) 100%)' }}></div>

                        {/* viewfinder corner brackets */}
                        <span className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-white/90"></span>
                        <span className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-white/90"></span>
                        <span className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-white/90"></span>
                        <span className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-white/90"></span>

                        {/* HUD top row */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start text-white" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            <span className="flex items-center gap-2 text-xs font-black tracking-[0.2em]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b3b] hero-rec"></span> REC
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-right leading-snug">NYX_STUDIO<br />CAM&nbsp;01</span>
                        </div>

                        {/* center play */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-20 h-20 rounded-full border-4 border-white/90 flex items-center justify-center text-white text-3xl pl-1.5">▶</span>
                        </div>

                        {/* HUD bottom row */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            <span className="text-[10px] font-bold tracking-[0.15em] leading-snug">00:00:24:18<br />15.06.2026</span>
                            <span className="text-[10px] font-black tracking-widest border-2 border-white/90 px-1.5 py-0.5">HD</span>
                        </div>
                    </div>

                    {/* sticker badge — kept inside the edge on mobile to avoid clipping */}
                    <div className="absolute -top-3 right-2 md:-right-4 bg-[#ffd65b] border-4 border-black px-3 py-1 -rotate-6 shadow-[4px_4px_0_#000] font-headline font-black text-black text-xs sm:text-sm uppercase tracking-tight whitespace-nowrap">
                        ✷ Scroll-Stopper
                    </div>
                </div>
            </section>

            {/* SEO Copy Block */}
            <section className="bg-surface-container-lowest px-4 sm:px-6 md:px-8 py-8">
                <p className="text-sm text-on-surface/60 max-w-2xl font-body leading-relaxed">
                    NYX Studio is an AI-native creative and growth agency built for D2C brands in India. We combine cinematic content production, performance marketing, and influencer strategy into one integrated system — designed to move fast and scale faster.
                </p>
            </section>

            {/* Marquee */}
            <section aria-hidden="true" className="bg-primary-container border-b-4 border-black py-4 md:py-6 flex items-center overflow-hidden">
                <div className="marquee-container">
                    <div className="marquee-content flex gap-6 md:gap-12 text-black font-headline font-bold uppercase text-base md:text-2xl tracking-widest items-center pr-6 md:pr-12">
                        <span>Content Strategy</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Paid Ads</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Creative Production</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Influencer Marketing</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Analytics</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Growth Strategy</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        {/* Duplicate for infinite effect */}
                        <span>Content Strategy</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Paid Ads</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Creative Production</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Influencer Marketing</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Analytics</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                        <span>Growth Strategy</span> <span className="text-2xl md:text-4xl text-surface-container-lowest">•</span>
                    </div>
                </div>
            </section>

            {/* Status Bar */}
            <section className="bg-[#ffd65b] border-b-4 border-black py-8 md:py-12 px-4 sm:px-6 md:px-8 text-center">
                <p className="font-headline font-black text-2xl md:text-5xl text-black uppercase tracking-tighter max-w-7xl mx-auto">
                    Selectively onboarding our first brand partners. Limited spots, Q3 2026.
                </p>
            </section>

            {/* Services Bento */}
            <section className="p-4 sm:p-6 md:p-16 bg-surface-dim">
                <div className="mb-10 md:mb-16">
                    <p className="font-label text-primary uppercase font-bold mb-4 tracking-tighter">* OUR_CAPABILITIES</p>
                    <h2 className="font-headline text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight reveal-text">
                        <span className="block">Full Spectrum</span>
                        <span className="block">Growth Architecture</span>
                    </h2>
                </div>
                <div className="bento-grid">
                    {/* Card 1: Green */}
                    <div className="bento-card col-span-12 md:col-span-7 bg-tertiary border-4 border-black p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span aria-hidden="true" className="material-symbols-outlined !text-6xl text-black">ads_click</span>
                            <p className="font-label text-black/40 font-bold">*01</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-4xl md:text-6xl font-black text-black uppercase mb-4 leading-none break-words">PAID MEDIA</h3>
                            <p className="text-black font-medium text-base md:text-lg max-w-md">Aggressive performance scaling across TikTok, Meta, and Google. We turn clicks into culture.</p>
                        </div>
                    </div>
                    {/* Card 2: Orange */}
                    <div className="bento-card col-span-12 md:col-span-5 bg-primary-container border-4 border-black p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span aria-hidden="true" className="material-symbols-outlined !text-6xl text-black">movie_edit</span>
                            <p className="font-label text-black/40 font-bold">*02</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-4xl md:text-5xl font-black text-black uppercase mb-4 leading-none break-words hyphens-auto" lang="en">CONTENT PRODUCTION</h3>
                            <p className="text-black font-medium text-base md:text-lg">High-octane visual assets designed for the 3-second hook era.</p>
                        </div>
                    </div>
                    {/* Card 3: White/Grey */}
                    <div className="bento-card col-span-12 md:col-span-5 bg-on-surface border-4 border-black p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span aria-hidden="true" className="material-symbols-outlined !text-6xl text-black">groups</span>
                            <p className="font-label text-black/40 font-bold">*03</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-4xl md:text-5xl font-black text-black uppercase mb-4 leading-none break-words">INFLUENCER OPS</h3>
                            <p className="text-black font-medium text-base md:text-lg">Strategic matchmaking that bypasses the &quot;ad&quot; filter.</p>
                        </div>
                    </div>
                    {/* Card 4: Pink */}
                    <div className="bento-card col-span-12 md:col-span-7 bg-[#F2A7C3] border-4 border-black p-6 md:p-8 flex flex-col justify-between min-h-[300px] md:min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span aria-hidden="true" className="material-symbols-outlined !text-6xl text-black">analytics</span>
                            <p className="font-label text-black/40 font-bold">*04</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-4xl md:text-6xl font-black text-black uppercase mb-4 leading-none break-words">STRATEGY &amp; AUDIT</h3>
                            <p className="text-black font-medium text-base md:text-lg max-w-md">Data-driven roadmaps that expose competitors&apos; weaknesses and exploit market gaps.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why NYX Section */}
            <section className="relative bg-on-surface py-20 md:py-32 px-4 sm:px-6 md:px-8 overflow-hidden border-y-4 border-black">
                {/* Organic Blob Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] max-w-full bg-[#F2A7C3] opacity-20 blur-[100px] rounded-full manifesto-glow"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-black text-center">
                    <p className="font-label uppercase font-black text-base md:text-xl mb-6 md:mb-8 tracking-tighter">THE MANIFESTO</p>
                    <div className="space-y-8 md:space-y-12">
                        <h2 className="font-headline text-4xl sm:text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter reveal-text">
                            <span className="block">AI-NATIVE.</span>
                            <span className="block">CULTURALLY SHARP.</span>
                            <span className="block">BUILT FOR SPEED.</span>
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 manifesto-pills">
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* NO BLOAT</div>
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* NO POLITE BS</div>
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* JUST GROWTH</div>
                        </div>
                        <p className="text-black font-label font-bold uppercase tracking-tight opacity-80 max-w-2xl mx-auto mt-12">
                            Currently building our first client roster — if you&apos;re reading this, you&apos;re early.
                        </p>
                    </div>
                </div>
                {/* Registration Marks */}
                <div className="absolute top-10 left-10 text-black/20"><span aria-hidden="true" className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute top-10 right-10 text-black/20"><span aria-hidden="true" className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute bottom-10 left-10 text-black/20"><span aria-hidden="true" className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute bottom-10 right-10 text-black/20"><span aria-hidden="true" className="material-symbols-outlined !text-4xl">add</span></div>
            </section>

            {/* Lead Capture */}
            <section className="bg-primary-container px-4 sm:px-6 md:px-8 py-16 md:py-24 flex flex-col items-center justify-center text-black">
                <h2 className="font-headline text-4xl sm:text-5xl md:text-8xl font-black uppercase mb-8 md:mb-12 text-center tracking-tighter reveal-text"><span className="block">Ready to grow?</span></h2>
                <div className="cta-form w-full flex justify-center"><LeadForm /></div>
                <p className="mt-8 font-label uppercase tracking-widest text-xs md:text-sm font-bold opacity-70 text-center">* NO SPAM. JUST STRATEGY.</p>
            </section>
        </main>

        {/* Footer */}
        <SiteFooter />
        <MobileNav />
      </div>
    </>
  );
}
