import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "../page.css";

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
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-[#0E0E0E] dark:bg-black border-b-4 border-black dark:border-white/10 rounded-none">
            <Link href="/ad" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg relative">
                    <Image 
                        src="/logo/logo.png" 
                        alt="NYX Logo" 
                        fill 
                        className="object-cover"
                        sizes="40px"
                    />
                </div>
                <div className="text-3xl font-black tracking-tighter text-white dark:text-[#F5C518] font-headline uppercase">
                    NYX STUDIO
                </div>
            </Link>
            <nav className="hidden md:flex gap-8 items-center">
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/ad/work">WORK</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 px-2" href="/ad/services">SERVICES</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/ad/contact">CONTACT</Link>
            </nav>
            <Link href="/ad/contact" className="bg-[#E8441A] text-white px-6 py-2 font-headline uppercase tracking-tighter font-bold scale-100 active:scale-95 hover:bg-[#F5C518] hover:text-black transition-all duration-75 inline-block border-4 border-transparent hover:border-black">
                LET'S TALK →
            </Link>
        </header>

        <main className="pt-28">
            {/* Hero Section */}
            <section className="px-8 py-20 border-b-4 border-ink-black">
                <div className="max-w-7xl mx-auto">
                    <span className="font-label text-xs uppercase tracking-widest text-primary mb-4 block">* THE MIDNIGHT MANIFESTO / 2024</span>
                    <h1 className="font-headline text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-black tracking-tighter uppercase mb-8">OUR<br/>SERVICES</h1>
                    <p className="font-body text-xl max-w-2xl text-on-surface-variant leading-relaxed">
                        We don't do "marketing." We build cultural infrastructure. Our services are designed for brands that thrive in the shadows of the mainstream and the spotlight of the subculture.
                    </p>
                </div>
            </section>

            {/* Service Tier: Content Strategy */}
            <section className="grid grid-cols-1 md:grid-cols-12 min-h-screen border-b-4 border-ink-black">
                <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-between bg-surface-container-lowest border-b-4 md:border-b-0 border-ink-black">
                    <div>
                        <span className="font-label text-xs uppercase tracking-widest text-secondary mb-12 block">* SERVICE_01</span>
                        <h2 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-none">CONTENT<br/>STRATEGY</h2>
                    </div>
                    <div className="max-w-md mt-16 md:mt-0">
                        <p className="font-body text-lg mb-8">Architecting narratives that pierce the noise. We map the digital landscape to find the cracks where your brand can bloom.</p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary">terminal</span> Narrative Mapping
                            </li>
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary">analytics</span> Trend Forecasting
                            </li>
                            <li className="flex items-center gap-4 font-label uppercase text-sm border-b-2 border-surface-container-high pb-2">
                                <span className="material-symbols-outlined text-secondary">architecture</span> Channel Ecosystems
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="md:col-span-5 md:border-l-4 border-ink-black bg-surface-container overflow-hidden relative">
                    <img className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 min-h-[400px]" alt="abstract close-up of vintage computer screens" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABXwq6y1mvg0G27QwV6966W8eqK0iOoJNb_oze5hg77PdfzFFaM5r6UBCdIew7jsa8ToE5iazYVyQ5mnq-ZdxKE1qzVuNfCvfbUB-OxkdtPDw7D7XiXuoNJYAXa7LnPEo_ziv0c7jWFNxu35pOT6pI03dGJUPqq-MeM0k-4A412zUWp9zPnJrj4dUViF6GNuqHYjwXiy7ZamiAzi9CZCt1ZuKmkRWYzM5sQ7IAwpl0UzaFpV_ow1PcWmQ4gtKu1HtSgel18d0Xdve8" />
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                </div>
            </section>

            {/* Service Tier: Paid Social (Bento Style) */}
            <section className="bg-surface-container-low border-b-4 border-ink-black">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-5 p-8 md:p-16 border-b-4 md:border-b-0 md:border-r-4 border-ink-black flex flex-col justify-center bg-primary">
                        <span className="font-label text-xs uppercase tracking-widest text-on-primary mb-6 block">* SERVICE_02</span>
                        <h2 className="font-headline text-6xl md:text-7xl font-black tracking-tighter uppercase text-on-primary leading-none mb-6">PAID<br/>SOCIAL</h2>
                        <p className="text-on-primary-container font-medium text-lg">Precision targeting meets raw creativity. We don't buy ads; we buy attention.</p>
                    </div>
                    <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2">
                        <div className="p-12 border-b-4 md:border-b-0 md:border-r-4 border-ink-black flex flex-col gap-8 hover:bg-secondary transition-colors group">
                            <span className="material-symbols-outlined text-5xl group-hover:text-ink-black">target</span>
                            <h3 className="font-headline text-3xl font-bold uppercase group-hover:text-ink-black">ALGORITHMIC<br/>DOMINANCE</h3>
                            <p className="text-sm font-label uppercase group-hover:text-ink-black">+ SCALE FAST<br/>+ ROI FOCUSED</p>
                        </div>
                        <div className="p-12 flex flex-col gap-8 hover:bg-[#76dc83] transition-colors group">
                            <span className="material-symbols-outlined text-5xl group-hover:text-ink-black">bolt</span>
                            <h3 className="font-headline text-3xl font-bold uppercase group-hover:text-ink-black">CREATIVE<br/>TESTING</h3>
                            <p className="text-sm font-label uppercase group-hover:text-ink-black">+ HIGH VELOCITY<br/>+ DATA DRIVEN</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Tier: Creative Production (Pink Panel) */}
            <section className="bg-[#F2A7C3] p-8 md:p-16 border-b-4 border-ink-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
                    <div className="md:col-span-8">
                        <span className="font-label text-xs uppercase tracking-widest text-ink-black mb-8 block font-black">* SERVICE_03 / THE AESTHETIC ENGINE</span>
                        <h2 className="font-headline text-7xl md:text-9xl font-black tracking-tighter uppercase text-ink-black leading-[0.8] mb-0">CREATIVE<br/>PRODUCTION</h2>
                    </div>
                    <div className="md:col-span-4 pb-4">
                        <p className="text-ink-black font-body text-xl font-bold uppercase tracking-tight leading-tight">
                            High-fidelity visuals for a low-attention world. We shoot, edit, and design for the soul.
                        </p>
                    </div>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform">videocam</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">FILM &amp; MOTION</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform">camera</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">ZINE PHOTOGRAPHY</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform">auto_awesome</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">VFX / 3D ART</span>
                    </div>
                    <div className="aspect-square bg-ink-black flex flex-col items-center justify-center p-8 text-center group cursor-crosshair">
                        <span className="material-symbols-outlined text-[#F2A7C3] text-4xl mb-4 group-hover:scale-125 transition-transform">grid_view</span>
                        <span className="font-label text-white uppercase text-xs tracking-tighter">LAYOUT DESIGN</span>
                    </div>
                </div>
            </section>

            {/* Service Tier: Brand Growth */}
            <section className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-ink-black bg-surface-container-highest">
                <div className="p-8 md:p-20 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-ink-black">
                    <div className="mb-20">
                        <span className="font-label text-xs uppercase tracking-widest text-[#76dc83] mb-6 block">* SERVICE_04</span>
                        <h2 className="font-headline text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none">BRAND<br/>GROWTH</h2>
                    </div>
                    <p className="font-body text-lg leading-relaxed opacity-80">
                        Scaling is an art form. We provide the operational backbone and strategic foresight to move your brand from "niche favorite" to "cultural staple" without losing the edge that made you famous.
                    </p>
                    <div className="mt-12">
                        <Link href="/ad/contact" className="w-full md:w-auto bg-[#76dc83] text-ink-black px-12 py-6 font-headline text-2xl font-black uppercase tracking-tighter hover:bg-[#ffd65b] hover:translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all inline-block text-center border-4 border-black">
                            INQUIRE NOW →
                        </Link>
                    </div>
                </div>
                <div className="grid grid-rows-3 bg-surface">
                    <div className="border-b-4 border-ink-black p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">01 / RETENTION SYSTEMS</h4>
                        <span className="material-symbols-outlined">north_east</span>
                    </div>
                    <div className="border-b-4 border-ink-black p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">02 / PARTNERSHIP OUTREACH</h4>
                        <span className="material-symbols-outlined">north_east</span>
                    </div>
                    <div className="p-8 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer group">
                        <h4 className="font-headline text-3xl font-bold uppercase group-hover:translate-x-4 transition-transform">03 / PERFORMANCE OPS</h4>
                        <span className="material-symbols-outlined">north_east</span>
                    </div>
                </div>
            </section>

            {/* Final CTA Block */}
            <section className="py-32 px-8 text-center bg-surface">
                <h3 className="font-headline text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-black tracking-tighter uppercase mb-12">READY TO<br/>MANIFEST?</h3>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <Link className="px-10 py-5 bg-white text-ink-black font-headline text-xl font-bold uppercase tracking-tighter hover:bg-primary transition-all border-4 border-black" href="/ad/work">VIEW WORK →</Link>
                    <Link className="px-10 py-5 border-4 border-white text-white font-headline text-xl font-bold uppercase tracking-tighter hover:bg-white hover:text-ink-black transition-all" href="/ad">OUR PROCESS →</Link>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none relative z-10">
            <Link href="/ad" className="flex items-center gap-3">
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
                <Link className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="/ad/work">ARCHIVE</Link>
            </div>
            <div className="font-body text-xs uppercase tracking-widest text-[#E8441A] dark:text-[#ffb4a2]">
                © 2024 NYX STUDIO * THE MIDNIGHT MANIFESTO
            </div>
        </footer>
      </div>
    </>
  );
}
