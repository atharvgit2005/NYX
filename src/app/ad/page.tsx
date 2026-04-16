import type { Metadata } from "next";
import Image from "next/image";
import "./page.css";

export const metadata: Metadata = {
  title: "NYX STUDIO | THE MIDNIGHT MANIFESTO",
};

export default function AdPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Main wrapper containing body-level styling to isolate from global styles */}
      <div className="bg-surface-container-lowest text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen relative w-full overflow-hidden">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full border-b-4 border-black bg-[#0E0E0E] flex justify-between items-center px-8 py-6 z-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <Image 
                        src="/logo/logo.png" 
                        alt="NYX Logo" 
                        fill 
                        className="object-cover"
                        sizes="40px"
                    />
                </div>
                <div className="text-3xl font-black tracking-tighter text-white uppercase font-headline">NYX STUDIO</div>
            </div>
            <nav className="hidden md:flex gap-8 items-center">
                <a className="text-[#E8441A] font-bold font-label uppercase tracking-wider transition-colors duration-100" href="#">HOME</a>
                <a className="text-white hover:bg-[#E8441A] hover:text-black font-label uppercase tracking-wider transition-colors duration-100 px-2" href="#">WORK</a>
                <a className="text-white hover:bg-[#E8441A] hover:text-black font-label uppercase tracking-wider transition-colors duration-100 px-2" href="#">SERVICES</a>
                <a className="text-white hover:bg-[#E8441A] hover:text-black font-label uppercase tracking-wider transition-colors duration-100 px-2" href="#">CONTACT</a>
            </nav>
            <div className="text-[#E8441A] font-headline uppercase tracking-[-0.05em] text-[1.1rem] font-bold border-2 border-[#E8441A] px-4 py-1">
                *LIVE_NOW
            </div>
        </header>

        <main className="pt-[88px]">
            {/* Hero Section */}
            <section className="relative min-h-[921px] bg-surface-container-lowest px-8 py-24 flex flex-col md:flex-row items-center border-b-4 border-black overflow-hidden">
                <div className="noise-texture absolute inset-0"></div>
                <div className="z-10 md:w-3/5">
                    <h1 className="font-headline font-bold text-[4rem] md:text-[6rem] leading-[0.9] tracking-[-0.05em] uppercase mb-12">
                        We make brands <span className="text-primary-container">impossible</span> to scroll past.
                    </h1>
                    <button className="bg-primary text-on-primary-fixed font-headline font-bold text-xl px-10 py-5 uppercase border-4 border-black hover:bg-secondary hover:shadow-[4px_4px_0px_#000000] transition-all flex items-center gap-4">
                        Book a Call <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
                <div className="relative md:w-2/5 flex justify-center items-center mt-12 md:mt-0">
                    <div className="w-64 h-64 md:w-96 md:h-96 text-primary-container animate-pulse">
                        <span className="material-symbols-outlined !text-[12rem] md:!text-[20rem]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <div className="absolute -top-10 -right-10 text-secondary hidden md:block">
                        <span className="material-symbols-outlined !text-[8rem]">emergency</span>
                    </div>
                </div>
            </section>

            {/* Marquee */}
            <section className="bg-primary-container border-b-4 border-black py-6 flex items-center overflow-hidden">
                <div className="marquee-container">
                    <div className="marquee-content flex gap-12 text-black font-headline font-bold uppercase text-2xl tracking-widest items-center pr-12">
                        <span>Content Strategy</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Paid Ads</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Creative Production</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Influencer Marketing</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Analytics</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Growth Strategy</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        {/* Duplicate for infinite effect */}
                        <span>Content Strategy</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Paid Ads</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Creative Production</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Influencer Marketing</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Analytics</span> <span className="text-4xl text-surface-container-lowest">•</span>
                        <span>Growth Strategy</span> <span className="text-4xl text-surface-container-lowest">•</span>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-secondary border-b-4 border-black py-12 px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
                    <div className="text-center md:text-left">
                        <p className="font-headline font-black text-5xl md:text-7xl text-black">320M+</p>
                        <p className="font-label uppercase tracking-widest text-black/60 font-bold">* REACH GENERATED</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="font-headline font-black text-5xl md:text-7xl text-black">4.8x</p>
                        <p className="font-label uppercase tracking-widest text-black/60 font-bold">* AVG. ROAS</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="font-headline font-black text-5xl md:text-7xl text-black">50+</p>
                        <p className="font-label uppercase tracking-widest text-black/60 font-bold">* BRANDS GROWN</p>
                    </div>
                </div>
            </section>

            {/* Services Bento */}
            <section className="p-8 md:p-16 bg-surface-dim">
                <div className="mb-16">
                    <p className="font-label text-primary uppercase font-bold mb-4 tracking-tighter">* OUR_CAPABILITIES</p>
                    <h2 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight">Full Spectrum <br/>Growth Architecture</h2>
                </div>
                <div className="bento-grid">
                    {/* Card 1: Green */}
                    <div className="col-span-12 md:col-span-7 bg-tertiary border-4 border-black p-8 flex flex-col justify-between min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined !text-6xl text-black">ads_click</span>
                            <p className="font-label text-black/40 font-bold">*01</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-6xl font-black text-black uppercase mb-4 leading-none">PAID MEDIA</h3>
                            <p className="text-black font-medium text-lg max-w-md">Aggressive performance scaling across TikTok, Meta, and Google. We turn clicks into culture.</p>
                        </div>
                    </div>
                    {/* Card 2: Orange */}
                    <div className="col-span-12 md:col-span-5 bg-primary-container border-4 border-black p-8 flex flex-col justify-between min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined !text-6xl text-black">movie_edit</span>
                            <p className="font-label text-black/40 font-bold">*02</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-5xl font-black text-black uppercase mb-4 leading-none">CONTENT PRODUCTION</h3>
                            <p className="text-black font-medium text-lg">High-octane visual assets designed for the 3-second hook era.</p>
                        </div>
                    </div>
                    {/* Card 3: White/Grey */}
                    <div className="col-span-12 md:col-span-5 bg-on-surface border-4 border-black p-8 flex flex-col justify-between min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined !text-6xl text-black">groups</span>
                            <p className="font-label text-black/40 font-bold">*03</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-5xl font-black text-black uppercase mb-4 leading-none">INFLUENCER OPS</h3>
                            <p className="text-black font-medium text-lg">Strategic matchmaking that bypasses the "ad" filter.</p>
                        </div>
                    </div>
                    {/* Card 4: Pink */}
                    <div className="col-span-12 md:col-span-7 bg-[#F2A7C3] border-4 border-black p-8 flex flex-col justify-between min-h-[400px] hover:translate-x-1 hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined !text-6xl text-black">analytics</span>
                            <p className="font-label text-black/40 font-bold">*04</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-6xl font-black text-black uppercase mb-4 leading-none">STRATEGY &amp; AUDIT</h3>
                            <p className="text-black font-medium text-lg max-w-md">Data-driven roadmaps that expose competitors' weaknesses and exploit market gaps.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why NYX Section */}
            <section className="relative bg-on-surface py-32 px-8 overflow-hidden border-y-4 border-black">
                {/* Organic Blob Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#F2A7C3] opacity-20 blur-[100px] rounded-full"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-black text-center">
                    <p className="font-label uppercase font-black text-xl mb-8 tracking-tighter">THE MANIFESTO</p>
                    <div className="space-y-12">
                        <h2 className="font-headline text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter">
                            AI-NATIVE.<br/>
                            CULTURALLY SHARP.<br/>
                            BUILT FOR SPEED.
                        </h2>
                        <div className="flex justify-center gap-4">
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* NO BLOAT</div>
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* NO POLITE BS</div>
                            <div className="bg-black text-white px-4 py-1 font-label text-sm uppercase">* JUST GROWTH</div>
                        </div>
                    </div>
                </div>
                {/* Registration Marks */}
                <div className="absolute top-10 left-10 text-black/20"><span className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute top-10 right-10 text-black/20"><span className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute bottom-10 left-10 text-black/20"><span className="material-symbols-outlined !text-4xl">add</span></div>
                <div className="absolute bottom-10 right-10 text-black/20"><span className="material-symbols-outlined !text-4xl">add</span></div>
            </section>

            {/* Lead Capture */}
            <section className="bg-primary-container px-8 py-24 flex flex-col items-center justify-center text-black">
                <h2 className="font-headline text-6xl md:text-8xl font-black uppercase mb-12 text-center tracking-tighter">Ready to grow?</h2>
                <form className="w-full max-w-2xl flex flex-col md:flex-row gap-0">
                    <input className="flex-grow bg-surface-container-lowest border-4 border-black px-6 py-5 font-headline font-bold text-white focus:outline-none focus:border-black placeholder:text-surface-variant" placeholder="ENTER YOUR EMAIL" type="email"/>
                    <button className="bg-black text-white font-headline font-bold px-10 py-5 uppercase border-4 border-black border-l-0 hover:bg-secondary hover:text-black transition-colors flex items-center justify-center gap-2" type="submit">
                        Let's Talk <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </form>
                <p className="mt-8 font-label uppercase tracking-widest text-sm font-bold opacity-70">* NO SPAM. JUST STRATEGY.</p>
            </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#0E0E0E] flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-12 w-full border-t-4 border-black z-10 relative">
            <div className="flex flex-col gap-3 mb-8 md:mb-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center relative">
                        <Image 
                            src="/logo/logo.png" 
                            alt="NYX Logo" 
                            fill 
                            className="object-cover"
                            sizes="32px"
                        />
                    </div>
                    <div className="text-2xl font-black text-white uppercase font-headline">NYX STUDIO</div>
                </div>
                <p className="font-headline text-[0.75rem] uppercase tracking-wider text-white/60">
                    ©2024 NYX STUDIO | THE MIDNIGHT MANIFESTO
                </p>
            </div>
            <div className="flex gap-12">
                <div className="flex flex-col gap-2">
                    <span className="text-[#E8441A] font-label text-[0.75rem] uppercase font-bold tracking-widest">CONNECT</span>
                    <a className="text-white font-headline text-[0.75rem] uppercase tracking-wider hover:underline decoration-4 decoration-[#E8441A]" href="#">INSTAGRAM</a>
                    <a className="text-white font-headline text-[0.75rem] uppercase tracking-wider hover:underline decoration-4 decoration-[#E8441A]" href="#">LINKEDIN</a>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[#E8441A] font-label text-[0.75rem] uppercase font-bold tracking-widest">RESOURCES</span>
                    <a className="text-white font-headline text-[0.75rem] uppercase tracking-wider hover:underline decoration-4 decoration-[#E8441A]" href="#">ARCHIVE</a>
                    <a className="text-white font-headline text-[0.75rem] uppercase tracking-wider hover:underline decoration-4 decoration-[#E8441A]" href="#">CONTACT</a>
                </div>
            </div>
        </footer>
      </div>
    </>
  );
}
