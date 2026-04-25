import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceAnimations } from "../components/ServiceAnimations";
import "../page.css";
import { MobileNav } from "../components/MobileNav";

export const metadata: Metadata = {
  title: "SERVICES | NYX STUDIO",
};

export default function AdServicesPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Main wrapper containing body-level styling to isolate from global styles */}
      <div className="bg-[#0E0E0E] text-[#e5e2e1] font-body selection:bg-primary selection:text-ink-black min-h-screen relative w-full overflow-hidden">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 bg-[#0E0E0E] dark:bg-black border-b-4 border-black dark:border-white/10 rounded-none">
            <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg relative flex-shrink-0">
                    <Image 
                        src="/logo/logo.png" 
                        alt="NYX Logo" 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 768px) 32px, 40px"
                    />
                </div>
                <div className="text-xl md:text-3xl font-black tracking-tighter text-white dark:text-[#F5C518] font-headline uppercase whitespace-nowrap">
                    NYX STUDIO
                </div>
            </Link>
            <nav className="hidden md:flex gap-8 items-center">
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/work">WORK</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 px-2" href="/services">SERVICES</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/contact">CONTACT</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/automate">AUTOMATE</Link>
            </nav>
            <Link href="/contact" className="bg-[#E8441A] text-white px-3 md:px-6 py-1 md:py-2 font-headline uppercase tracking-tighter font-bold text-[0.75rem] md:text-base scale-100 active:scale-95 hover:bg-[#F5C518] hover:text-black transition-all duration-75 inline-block border-4 border-transparent hover:border-black whitespace-nowrap">
                LET'S TALK →
            </Link>
        </header>

                <main className="pt-28 pb-20 md:pb-0">
            <ServiceAnimations />
            {/* Hero Section */}
            <section className="relative px-8 py-20 border-b-4 border-ink-black overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-ink-black border-draw-x js-border"></div>
                <div className="max-w-7xl mx-auto">
                    <span className="font-label text-xs uppercase tracking-widest text-primary mb-4 block animate-reveal">* THE MIDNIGHT MANIFESTO / 2024</span>
                    <h1 className="font-headline text-huge font-black tracking-tighter uppercase mb-8 reveal-ink js-ink-reveal">OUR<br/>SERVICES</h1>
                    <p className="font-body text-xl max-w-2xl text-on-surface-variant leading-relaxed animate-reveal">
                                    We don't do "marketing." We build cultural infrastructure. Our services are designed for brands that thrive in the shadows of the mainstream and the spotlight of the subculture.
                    </p>
                </div>
            </section>
            
            {/* Service Tier: Content Strategy */}
            <section className="relative grid grid-cols-1 md:grid-cols-12 min-h-screen border-b-4 border-ink-black overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-ink-black border-draw-x js-border"></div>
                <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-between bg-surface-container-lowest">
                    <div>
                        <span className="font-label text-xs uppercase tracking-widest text-secondary mb-12 block animate-reveal">* SERVICE_01</span>
                        <h2 className="font-headline text-5xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-none reveal-ink js-ink-reveal break-words">CONTENT<br/>STRATEGY</h2>
                    </div>
                    <div className="max-w-md animate-reveal">
                        <p className="font-body text-lg mb-8">Architecting narratives that pierce the noise. We map the digital landscape to find the cracks where your brand can bloom.</p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary" data-icon="terminal">terminal</span> Narrative Mapping
                            </li>
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary" data-icon="analytics">analytics</span> Trend Forecasting
                            </li>
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary" data-icon="architecture">architecture</span> Channel Ecosystems
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-5 border-l-4 border-ink-black bg-surface-container overflow-hidden relative" id="three-container">
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none z-10"></div>
                </div>
            </section>

            {/* Service Tier: Paid Social */}
            <section className="relative bg-surface-container-low border-b-4 border-ink-black overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-ink-black border-draw-x js-border"></div>
                <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-5 p-8 md:p-16 border-r-4 border-ink-black flex flex-col justify-center bg-primary js-card">
                        <span className="font-label text-xs uppercase tracking-widest text-on-primary mb-6 block">* SERVICE_02</span>
                        <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase text-on-primary leading-none mb-6 reveal-ink js-ink-reveal break-words">PAID<br/>SOCIAL</h2>
                        <p className="text-on-primary-container font-medium text-lg">Precision targeting meets raw creativity. We don't buy ads; we buy attention.</p>
                    </div>
                    <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2">
                        <div className="p-12 border-b-4 md:border-b-0 md:border-r-4 border-ink-black flex flex-col gap-8 hover:bg-secondary transition-colors group js-card">
                            <span className="material-symbols-outlined text-5xl group-hover:text-ink-black" data-icon="target">target</span>
                            <h3 className="font-headline text-3xl font-bold uppercase group-hover:text-ink-black">ALGORITHMIC<br/>DOMINANCE</h3>
                            <p className="text-sm font-label uppercase group-hover:text-ink-black">+ SCALE FAST<br/>+ ROI FOCUSED</p>
                        </div>
                        <div className="p-12 flex flex-col gap-8 hover:bg-[#76dc83] transition-colors group js-card">
                            <span className="material-symbols-outlined text-5xl group-hover:text-ink-black" data-icon="bolt">bolt</span>
                            <h3 className="font-headline text-3xl font-bold uppercase group-hover:text-ink-black">CREATIVE<br/>TESTING</h3>
                            <p className="text-sm font-label uppercase group-hover:text-ink-black">+ HIGH VELOCITY<br/>+ DATA DRIVEN</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Tier: Creative Production */}
            <section className="relative bg-[#F2A7C3] p-8 md:p-16 border-b-4 border-ink-black overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-ink-black border-draw-x js-border"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
                    <div className="md:col-span-8">
                        <span className="font-label text-xs uppercase tracking-widest text-ink-black mb-8 block font-black animate-reveal">* SERVICE_03 / THE AESTHETIC ENGINE</span>
                        <h2 className="font-headline text-5xl md:text-9xl font-black tracking-tighter uppercase text-ink-black leading-[0.8] mb-0 reveal-ink js-ink-reveal break-words hyphens-auto" lang="en">CREATIVE<br/>PRODUCTION</h2>
                    </div>
                    <div className="md:col-span-4 pb-4 animate-reveal">
                        <p className="text-ink-black font-body text-xl font-bold uppercase tracking-tight leading-tight">
                            High-fidelity visuals for a low-attention world. We shoot, edit, and design for the soul.
                        </p>
                    </div>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair js-card">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform" data-icon="videocam">videocam</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">FILM &amp; MOTION</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair js-card">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform" data-icon="camera">camera</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">ZINE PHOTOGRAPHY</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair js-card">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform" data-icon="auto_awesome">auto_awesome</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">VFX / 3D ART</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair js-card">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform" data-icon="grid_view">grid_view</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">LAYOUT DESIGN</span>
                    </div>
                </div>
            </section>

            {/* Service Tier: Brand Growth */}
            <section className="relative grid grid-cols-1 md:grid-cols-2 border-b-4 border-ink-black overflow-hidden bg-surface-container-highest">
                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-ink-black border-draw-x js-border"></div>
                <div className="p-8 md:p-20 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-ink-black js-card">
                    <div className="mb-20">
                        <span className="font-label text-xs uppercase tracking-widest text-[#76dc83] mb-6 block animate-reveal">* SERVICE_04</span>
                        <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none reveal-ink js-ink-reveal break-words">BRAND<br/>GROWTH</h2>
                    </div>
                    <p className="font-body text-lg leading-relaxed opacity-80 animate-reveal">
                        Scaling is an art form. We provide the operational backbone and strategic foresight to move your brand from &quot;niche favorite&quot; to &quot;cultural staple&quot; without losing the edge that made you famous.
                    </p>
                    <div className="mt-12">
                        <Link href="/contact" className="w-full md:w-auto bg-[#76dc83] text-ink-black px-12 py-6 font-headline text-2xl font-black uppercase tracking-tighter hover:bg-[#ffd65b] hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all animate-reveal inline-block text-center border-4 border-black border-solid border-2 zine-shadow">
                            INQUIRE NOW →
                        </Link>
                    </div>
                </div>
                <div className="grid grid-rows-3 bg-surface">
                    <div className="border-b-4 border-ink-black p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group js-card">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">01 / RETENTION SYSTEMS</h4>
                        <span className="material-symbols-outlined" data-icon="north_east">north_east</span>
                    </div>
                    <div className="border-b-4 border-ink-black p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group js-card">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">02 / PARTNERSHIP OUTREACH</h4>
                        <span className="material-symbols-outlined" data-icon="north_east">north_east</span>
                    </div>
                    <div className="p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group js-card">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">03 / PERFORMANCE OPS</h4>
                        <span className="material-symbols-outlined" data-icon="north_east">north_east</span>
                    </div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="py-32 px-8 bg-[#0E0E0E] border-b-4 border-ink-black relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="font-headline text-5xl md:text-8xl font-black tracking-tighter text-white uppercase mb-4 reveal-ink js-ink-reveal">PACKAGES.</h2>
                        <p className="font-label text-xl md:text-2xl text-[#F5C518] italic animate-reveal">Every package is built to move product.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Trial Pack */}
                        <div className="flex flex-col border-4 border-[#222] bg-[#131313] text-[#e5e2e1] group hover:border-[#E8441A] transition-colors h-full js-card">
                            <div className="p-8 md:p-10 border-b-4 border-[#222] group-hover:border-[#E8441A] transition-colors">
                                <h3 className="font-label text-sm uppercase tracking-widest text-gray-400 mb-6 font-bold">TRIAL PACK</h3>
                                <div className="font-headline text-6xl font-black text-[#F5C518]">₹30K</div>
                            </div>
                            <div className="p-8 md:p-10 flex-grow">
                                <ul className="space-y-4 font-body text-[15px] leading-relaxed">
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> 15-17 High-Fidelity Posts</li>
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> Narrative Carousels</li>
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> Cinematic Reels, POV, Hooks, Food Porn</li>
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> Premium Cinematic Photography</li>
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> 1 Platform Focus (Instagram)</li>
                                    <li className="flex gap-3"><span className="text-[#E8441A] font-bold">+</span> Deep Analytics & Audience Insights</li>
                                    <li className="flex gap-3 opacity-50 mt-8 pt-4 border-t border-[#333]"><span className="text-gray-500 font-bold">-</span> NOT including: Paid Ads, Influencer Marketing</li>
                                </ul>
                            </div>
                        </div>

                        {/* Starter Pack */}
                        <div className="flex flex-col border-4 border-black bg-[#E8441A] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-transform h-full relative z-10 js-card">
                            <div className="p-8 md:p-10 border-b-4 border-black bg-[#D83810]">
                                <h3 className="font-label text-sm uppercase tracking-widest text-white/90 mb-6 font-bold">STARTER PACK</h3>
                                <div className="font-headline text-6xl font-black text-white">₹50K</div>
                            </div>
                            <div className="p-8 md:p-10 flex-grow">
                                <ul className="space-y-4 font-body text-[15px] leading-relaxed">
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> 20-25 Dynamic Reels + Posts</li>
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> Everything in Trial Pack</li>
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> Authentic UGC Sourcing</li>
                                    <li className="flex gap-3 flex-col items-start">
                                        <div className="flex gap-3 w-full"><span className="text-black font-black">+</span> <strong>Performance Marketing:</strong></div>
                                        <ul className="pl-6 space-y-2 mt-2 w-full text-white/90 text-sm">
                                            <li className="flex gap-2 items-start"><span className="opacity-70 mt-1">•</span> Hyper-local targeting</li>
                                            <li className="flex gap-2 items-start"><span className="opacity-70 mt-1">•</span> Meta Ads Engine (variable budget)</li>
                                            <li className="flex gap-2 items-start"><span className="opacity-70 mt-1">•</span> Custom Campaigns (Offers, B1G1)</li>
                                        </ul>
                                    </li>
                                    <li className="flex gap-3 mt-4"><span className="text-black font-black">+</span> <span><strong>Add-ons:</strong> Influencer Collabs, Landing Pages & Offer Messaging</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Growth Pack */}
                        <div className="flex flex-col border-4 border-black bg-[#F5C518] text-black group hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(232,68,26,1)] transition-all h-full js-card">
                            <div className="p-8 md:p-10 border-b-4 border-black bg-[#E6B610]">
                                <h3 className="font-label text-sm uppercase tracking-widest text-black/70 mb-6 font-bold">GROWTH PACK</h3>
                                <div className="font-headline text-6xl font-black text-black">₹80K</div>
                            </div>
                            <div className="p-8 md:p-10 flex-grow">
                                <ul className="space-y-4 font-body text-[15px] leading-relaxed">
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> 30-40 Dominant Reels + Posts</li>
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> Everything in Starter Pack</li>
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> Full-Scale Ecosystem Execution</li>
                                    <li className="flex gap-3"><span className="text-black font-black">+</span> Multi-Tiered Campaign Funnels</li>
                                    <li className="flex gap-3 flex-col items-start">
                                        <div className="flex gap-3 w-full"><span className="text-black font-black">+</span> <span>Curated Monthly Concepts:</span></div>
                                        <ul className="pl-6 space-y-2 mt-2 w-full text-black/80 text-sm">
                                            <li className="flex gap-2 items-start"><span className="opacity-50 mt-1">•</span> Frullato Date Night</li>
                                            <li className="flex gap-2 items-start"><span className="opacity-50 mt-1">•</span> Campus Take-over</li>
                                            <li className="flex gap-2 items-start"><span className="opacity-50 mt-1">•</span> Midnight Craving Drives</li>
                                        </ul>
                                    </li>
                                    <li className="flex gap-3 mt-4"><span className="text-black font-black">+</span> <span><strong>Add-on:</strong> WhatsApp/SMS Funnels, Loyalty Hooks, Repeat Purchase Offers</span></li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Final CTA Block */}
            <section className="py-32 px-8 text-center bg-surface border-b-4 border-black">
                <h3 className="font-headline text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-black tracking-tighter uppercase mb-12 reveal-ink js-ink-reveal">READY TO<br/>MANIFEST?</h3>
                <div className="flex flex-col md:flex-row gap-6 justify-center animate-reveal">
                    <Link className="px-10 py-5 bg-white text-ink-black font-headline text-xl font-bold uppercase tracking-tighter hover:bg-primary transition-all border-4 border-black" href="/work">VIEW WORK →</Link>
                    <Link className="px-10 py-5 border-4 border-white text-white font-headline text-xl font-bold uppercase tracking-tighter hover:bg-white hover:text-ink-black transition-all" href="/">OUR PROCESS →</Link>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none relative z-10">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-lg relative border border-white/20">
                    <Image 
                        src="/logo/logo.png" 
                        alt="NYX Logo" 
                        fill 
                        className="object-cover"
                        sizes="32px"
                    />
                </div>
                <div className="text-xl font-bold text-white font-headline uppercase">NYX STUDIO</div>
            </Link>
            <div className="flex gap-8">
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">INSTAGRAM</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.linkedin.com/in/atharv-paharia-468276272/" target="_blank">LINKEDIN</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">TWITTER</a>
                <Link className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="/work">ARCHIVE</Link>
            </div>
            <div className="font-body text-xs uppercase tracking-widest text-[#E8441A] dark:text-[#ffb4a2]">
                © 2024 NYX STUDIO * THE MIDNIGHT MANIFESTO
            </div>
        </footer>
        <MobileNav />
      </div>
    </>
  );
}
