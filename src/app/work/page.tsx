import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WorkAnimations } from "../components/WorkAnimations";
import "../page.css";

export const metadata: Metadata = {
  title: "WORK | NYX STUDIO",
};

export default function AdWorkPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Work+Sans:wght@300..600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="font-body selection:bg-secondary selection:text-black min-h-screen relative w-full overflow-hidden bg-[#131313] text-[#e5e2e1]">
        {/* TopAppBar */}
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-[#0E0E0E] dark:bg-black border-b-4 border-black dark:border-white/10 rounded-none">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center relative">
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
            <div className="hidden md:flex gap-12 items-center">
                <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 transition-all duration-75" href="/work">WORK</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/services">SERVICES</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/contact">CONTACT</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/automate">AUTOMATE</Link>
            </div>
            <Link href="/contact" className="bg-[#ffb4a2] px-6 py-2 text-black font-headline font-bold uppercase tracking-tighter border-4 border-black hover:bg-[#F5C518] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000000] transition-all duration-75 inline-block">
                LET'S TALK →
            </Link>
        </nav>

                {/* Canvas Background */}
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
            <div className="absolute inset-0 noise-texture"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest via-[#0e0e0e] to-[#1a0a05]"></div>
        </div>

        <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto">
            <WorkAnimations />
            {/* Hero Header */}
            <header className="mb-24 relative">
                <div className="absolute -top-12 -left-12 text-[#E8441A] opacity-20 text-[15rem] font-black select-none pointer-events-none">WORK</div>
                <h1 className="text-[clamp(4rem,15vw,12rem)] font-headline font-black leading-[0.8] tracking-tighter uppercase relative reveal-text">
                    <span className="block">SELECTED</span>
                    <span className="text-[#E8441A] block">WORK</span>
                </h1>
                <div className="flex items-center gap-4 mt-8">
                    <span className="w-12 h-1 bg-[#F5C518]"></span>
                    <p className="font-label text-secondary uppercase tracking-[0.3em]">* THE MIDNIGHT MANIFESTO VOL. 01</p>
                </div>
            </header>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(300px,auto)]">
                {/* Project 01 */}
                <div className="bento-card md:col-span-8 group relative overflow-hidden bento-border bg-[#1c1b1b] transition-all duration-300 hover:bg-[#ffb4a2]">
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <span className="bg-black text-white px-3 py-1 font-label text-xs uppercase">* EDITORIAL DESIGN</span>
                    </div>
                    <div className="h-full w-full min-h-[500px] flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-12 flex flex-col justify-between">
                            <div>
                                <span className="font-headline text-6xl text-[#E8441A] group-hover:text-black transition-colors">01</span>
                                <h2 className="font-headline text-5xl font-bold uppercase mt-4 group-hover:text-black transition-colors">AETHER CAMPAIGN</h2>
                            </div>
                            <p className="font-body text-lg max-w-xs group-hover:text-black/80 transition-colors">A transcendental visual narrative exploring the intersection of digital decay and classical form.</p>
                        </div>
                        <div className="md:w-1/2 bg-black relative overflow-hidden">
                            <img alt="Abstract 3D ethereal shapes" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUulpU6A18uD617RCZzVXDqIUjobuCegAV8QeieIojg4Ug5Ou0q9HOFnRt22x3t6Jnwnvsgti1A8pU_AQ5jeMaFScgEBUmJlC3DmBOcSZZ35LKN4OkiEsnBcRodWd2RjTdfIHGEyp6O7mGseUCLMpFY6IDmpn18KwZp6bHpUKW3jqRS1g8JPBmYxbKFqotQMqFkfS7SPDHwjnxBcR5OhSdnS0it5ztzIb-6bZQP5bdKY23EufgxkgVnokXnpbmGPRm4RnysFOUY8hZ"/>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-4xl text-black">arrow_outward</span>
                    </div>
                </div>

                {/* Project 02 */}
                <div className="bento-card md:col-span-4 group relative overflow-hidden bento-border bg-[#2a2a2a] transition-all duration-300 hover:bg-[#ffd65b]">
                    <div className="p-8 h-full flex flex-col">
                        <div className="mb-8">
                            <span className="bg-black text-white px-3 py-1 font-label text-xs uppercase">* DIGITAL PRODUCT</span>
                        </div>
                        <div className="flex-grow">
                            <span className="font-headline text-4xl text-[#F5C518] group-hover:text-black">02</span>
                            <h2 className="font-headline text-4xl font-bold uppercase mt-2 group-hover:text-black">NEON DRIFT</h2>
                        </div>
                        <div className="mt-8 border-t-4 border-black pt-4 group-hover:border-black/20">
                            <img alt="Cyberpunk interface detail" className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe_U5eQsxm3jSjWOJbvS_KSc3GlVbkTO85DDrnsntltDCJzn_fTT0-lceUbyOw3r9U07XwOUBprqY6jtEqA4sj7Zhy-C9iHq2XcHz1doI0rWyHCKfCaAefk0T0-TUzbXqZXxGYmTU11nuaadBVvyipXoeSd-2BOAEEaGset_qhm_rv-UG61PtYcQXohRVjFPwRbuM4PpRfCyls9x-V0a9ORCDUg5WA0afkgKRiUnwvbND-hgcBNjTuJGvbNU17VfpEVxHFcvGXBmn0"/>
                        </div>
                    </div>
                </div>

                {/* Project 03 */}
                <div className="bento-card md:col-span-5 group relative overflow-hidden bento-border bg-[#0e0e0e] transition-all duration-300 hover:bg-[#3da452]">
                    <div className="h-full flex flex-col">
                        <div className="relative h-64 overflow-hidden">
                            <img alt="Luxury fashion model" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-125 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD01ISdydSb0bf_FjOM3nFO0t6L45k4m7mkUyvD1g_zhXuLomfJYFF8zS3uOhky9tSqDGS6W_fBzpxG9a0Q86UwKACOXvs6xRJ4ZvmpwuxD0x_TjSsZMI4SAhx4ILibW758Jvq_AtqqXr7--LAVdDyFkJAOBRKH39gTlnjWzpOTn-tFDibDaN3CccPnp1Nutk788psPLE8woNup34C2M0K4-QFO_LfQirskdE3TmKm1jLfDYj9PdSUPZdPyNvN2qHpuDiXJfeSzNXNN"/>
                        </div>
                        <div className="p-8 flex-grow flex flex-col justify-between">
                            <div>
                                <span className="font-headline text-4xl text-[#76dc83] group-hover:text-white">03</span>
                                <h2 className="font-headline text-4xl font-bold uppercase mt-2 group-hover:text-white">VELVET REBEL</h2>
                            </div>
                            <div className="mt-4">
                                <span className="font-label text-xs uppercase text-stone-500 group-hover:text-white/70 tracking-widest">* ART DIRECTION</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project 04 */}
                <div className="bento-card md:col-span-7 group relative overflow-hidden bento-border bg-black transition-all duration-300 hover:invert">
                    <div className="absolute inset-0 opacity-20">
                        <img alt="Grid pattern" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKnuy_y4OrZ1ySjpUZ--ba4Fo3H9_2UTfC-wTc-G9VE9mXCCNEqHzjV9sRIOseoTFcI-WsU9ILF0nRpZOBUj-hrYwBKF8gmNjBt7h22VHFrWdYdCENyMR-XAEuHASp_1bR5qSDAVHBvV4g6DExy2K3Gkk5E2WDqxtmQiZAQE7975Lnq9-P1b5jgOn3aJgLFxRkk0HpDgzl-RUL7Zb9jnNEMeg7uyCEiO2IT5KK0Q6hSlnm-QOlnbSWR0MW2wCPThUTSOeAl90Uuqu0"/>
                    </div>
                    <div className="relative z-10 p-12 h-full flex flex-col justify-center items-center text-center">
                        <span className="font-headline text-9xl text-white drop-shadow-2xl">04</span>
                        <h2 className="font-headline text-6xl font-black uppercase mt-4 text-white">SHADOW ARCHIVE</h2>
                        <p className="font-body text-white/60 mt-6 max-w-md tracking-wider uppercase text-sm">Experimental data visualization mapping the unseen digital footprints of urban environments.</p>
                        <div className="mt-12">
                            <button className="border-4 border-white text-white px-10 py-4 font-headline font-bold uppercase hover:bg-white hover:text-black transition-all">
                                ENTER THE VOID →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Project CTA */}
            <section className="mt-32 mb-12 border-4 border-black bg-[#ffb4a2] p-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                    <span className="material-symbols-outlined text-9xl text-black/10 group-hover:text-black/20 transition-colors">add_circle</span>
                </div>
                <div className="relative z-10">
                    <h3 className="font-headline text-[clamp(2.5rem,8vw,6rem)] font-black leading-tight uppercase text-black reveal-text">
                        <span className="block">YOUR PROJECT IS</span>
                        <span className="text-white group-hover:text-[#ffd65b] transition-colors block leading-tight mt-2">NEXT IN LINE</span>
                    </h3>
                    <div className="mt-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <p className="font-body text-xl text-black font-medium max-w-xl">We are currently accepting new partners for the Q3-Q4 broadcast cycle. Let's build something that demands attention.</p>
                        <Link className="bg-black text-white px-12 py-6 text-2xl font-headline font-bold uppercase group-hover:translate-x-4 transition-transform zine-shadow" href="/contact">
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
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none relative z-10">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center relative border border-white/20">
                    <Image 
                        src="/logo/logo.png" 
                        alt="NYX Logo" 
                        fill 
                        className="object-cover"
                        sizes="32px"
                    />
                </div>
                <div className="text-xl font-bold text-white font-headline uppercase">
                    NYX STUDIO
                </div>
            </Link>
            <div className="flex flex-wrap justify-center gap-8">
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">INSTAGRAM</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.linkedin.com/in/atharv-paharia-468276272/" target="_blank">LINKEDIN</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">TWITTER</a>
                <Link className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="/work">ARCHIVE</Link>
            </div>
            <div className="font-body text-xs uppercase tracking-widest text-white">
                © 2024 NYX STUDIO * THE MIDNIGHT MANIFESTO
            </div>
        </footer>
      </div>
    </>
  );
}
