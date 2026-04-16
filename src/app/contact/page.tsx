import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "./components/ContactForm";
import { ContactAnimations } from "../components/ContactAnimations";
import "../page.css"; // Reuse the css from /ad/page.css for icons and basic styles
import { MobileNav } from "../components/MobileNav";

export const metadata: Metadata = {
  title: "NYX STUDIO | CONTACT",
};

export default function AdContactPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Main wrapper containing body-level styling to isolate from global styles */}
      <div className="bg-surface text-on-surface font-body selection:bg-secondary selection:text-on-secondary min-h-screen relative w-full overflow-hidden">
        {/* TopAppBar */}
        <canvas id="background-canvas"></canvas>
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
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75" href="/work">WORK</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75" href="/services">SERVICES</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1" href="/contact">CONTACT</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/automate">AUTOMATE</Link>
            </div>
            <Link href="/contact" className="bg-[#ffb4a2] text-black px-6 py-3 font-headline font-bold uppercase tracking-tighter border-4 border-black transition-all duration-75 hover:bg-[#F5C518] active:scale-95 inline-block">
                LET'S TALK →
            </Link>
        </nav>

                <main className="pt-24 relative z-10 pb-20 md:pb-0">
            <ContactAnimations />
            {/* Hero Section */}
            <section className="bg-[#E8441A] min-h-[614px] flex flex-col justify-end px-8 pb-16 border-b-[12px] border-black relative overflow-hidden">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="absolute -top-32 right-0 opacity-10 pointer-events-none">
                        <span className="text-[20rem] font-black leading-none font-headline tracking-tighter">NYX</span>
                    </div>
                    <p className="font-headline text-black text-xl mb-4 font-bold tracking-widest">* ESTABLISH CONTACT</p>
                    <h1 className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-black leading-[0.85] tracking-tighter text-black uppercase font-headline" id="hero-headline">
                        LET'S START THE MANIFESTO.
                    </h1>
                </div>
            </section>

            {/* Content Section: Bento Grid Layout */}
            <section className="p-8 md:p-16 bg-surface-container-lowest/80 backdrop-blur-md overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Contact Details Column (4/12) */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="border-4 border-black p-8 bg-surface-container-high relative overflow-hidden" id="intel-container">
                            <div className="form-border-draw"></div>
                            <div className="absolute top-0 right-0 p-2 text-secondary text-2xl font-bold">+</div>
                            <h2 className="text-3xl font-black mb-8 tracking-tighter uppercase font-headline text-primary">CONTACT_INTEL</h2>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-xs font-headline uppercase tracking-widest text-secondary mb-2 scramble-text" data-original="* DIRECT_LINE">* DIRECT_LINE</p>
                                    <a className="text-2xl md:text-3xl font-bold tracking-tighter hover:text-secondary transition-colors duration-75 block" href="mailto:nyx.studios.ai@gmail.com">
                                        nyx.studios.ai@gmail.com
                                    </a>
                                </div>
                                <div>
                                    <p className="text-xs font-headline uppercase tracking-widest text-secondary mb-2 scramble-text" data-original="* PHYSICAL_NODE">* PHYSICAL_NODE</p>
                                    <p className="text-xl font-medium leading-relaxed">
                                        411047 Pune Maharashtra,<br/>
                                        INDIA
                                    </p>
                                </div>
                                <div className="pt-8 border-t-4 border-black">
                                    <p className="text-xs font-headline uppercase tracking-widest text-secondary mb-4 scramble-text" data-original="* FREQUENCY_CHANNELS">* FREQUENCY_CHANNELS</p>
                                    <div className="flex flex-col gap-2">
                                        <a className="text-xl font-bold uppercase tracking-tighter hover:text-secondary flex items-center group" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">
                                            <span className="mr-4 text-xs">01/</span> INSTAGRAM <span className="ml-auto opacity-0 group-hover:opacity-100">↗</span>
                                        </a>
                                        <a className="text-xl font-bold uppercase tracking-tighter hover:text-secondary flex items-center group" href="https://www.linkedin.com/in/atharv-paharia-468276272/" target="_blank">
                                            <span className="mr-4 text-xs">02/</span> LINKEDIN <span className="ml-auto opacity-0 group-hover:opacity-100">↗</span>
                                        </a>
                                        <a className="text-xl font-bold uppercase tracking-tighter hover:text-secondary flex items-center group" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">
                                            <span className="mr-4 text-xs">03/</span> TWITTER <span className="ml-auto opacity-0 group-hover:opacity-100">↗</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 border-4 border-black bg-black relative overflow-hidden">
                            <img className="w-full h-full object-cover grayscale contrast-125 opacity-50" alt="Abstract dark grainy texture with orange geometric shapes and sharp shadows mimicking a brutalist architecture model" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfXmGMzJoLlSj1uVRt3U2cHzw3vbQEiiYaUeAGDpDenpt8dqQusy0HJivOxfkLUaOAin2EyFIWzL88IzxuaXbxSOODB6on8XLv4SeIVDgguzjti0Iac8ueelT4N47Csg4ez8jjy6EBu4l2AykZ83LlrA7FZBe9i8yAqMaMKFEwyIP33g6soITbOE9sUqdHQtFByqgdzMoybqo05NLzAVskfRn5QBKrloI-r6EJUUvbwvf8YNJrap3USnZDc_X0rlAERfK2nhgy_iva" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-4xl font-black font-headline uppercase tracking-tighter border-2 border-white px-4 py-2">NOCTURNAL_VIBE</span>
                            </div>
                        </div>
                    </div>
                    {/* Form Column (7/12) */}
                    <div className="lg:col-span-7 bg-white p-8 md:p-12 border-4 border-black shadow-[16px_16px_0px_0px_rgba(232,68,26,1)] relative" id="manifesto-form-container">
                        <div className="form-border-draw"></div>
                        <h2 className="form-element text-4xl font-black mb-12 tracking-tighter uppercase font-headline text-black opacity-0">TRANSMIT_MANIFESTO</h2>
                        <ContactForm />
                    </div>
                </div>
            </section>

            {/* Studio Atmosphere Section */}
            <section className="bg-black/90 py-24 px-8 border-y-4 border-black overflow-hidden relative min-h-[600px]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 content-relative">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square border-4 border-white/10 overflow-hidden">
                                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Dark aesthetic office interior with neon orange accents and brutalist concrete furniture in a low light setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS2FyCCpQmjR3WEFQiYi7uI-oPWJ_atBcE5gfkOlI6FjhC6QpkLjbtQSsILnTRSxGc0l_FqpMGzBS2JxeD5z2xsLICArngLFOvFa0DWT4RxXKdnncI3zowgy_aJG-CRH2IWCDlo06gzt31VIkCrmoXEARJnYAkhuNhwReZrFDWIrUEfeKoBZh-TbrFoAtsE-hzmrGt61mlN6JjhDBi30yIE2P0WBX4kZesnZfBv97CBLLYI7Xk_Eb09u6fZ7eraT_ZlmRYninAfGYt" />
                            </div>
                            <div className="aspect-square border-4 border-white/10 overflow-hidden translate-y-8">
                                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Close up of a vintage typewriter on a black desk with dramatic top lighting and harsh shadows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnoaTEhK0nkpEvRJkzpyMyp20xHIDXXDngpsNRvkT70YeGSOaIw1YeW--LlGLT0kndC7gXkOipvBiclFWxRLrIN2-NN508N4WMNfUhhFT7r9rX9tHXvQD2SOEbXM9MWFAAkND2vKDkDuqbmYA7iHL1eO9CaKGYY2T4xa3GLe1rEsnbT4IL41tJvwjPJgSN5YviSC8ABuYlfjSCaRLwHCk5CgTn6Ej1Inshif1ek-7e0z8aJ1o0Cgtz9NGEyrd7iWKZIcuWuHEn_Mpi" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2 space-y-6">
                        <span className="text-secondary font-headline font-bold text-xl uppercase">* THE_VIBE</span>
                        <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white font-headline leading-none">NOCTURNAL BY CHOICE.</h3>
                        <p className="text-on-surface-variant text-xl leading-relaxed font-body max-w-md">
                            We don't work the 9-to-5. Our best manifestos are written under the hum of neon and the silence of the midnight hour. Reach out when the sun goes down.
                        </p>
                    </div>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none z-10 relative">
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
                <div className="text-xl font-bold text-white font-body uppercase">
                    NYX STUDIO
                </div>
            </Link>
            <div className="flex gap-8 text-gray-500 font-body text-xs uppercase tracking-widest">
                <a className="hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">INSTAGRAM</a>
                <a className="hover:text-[#F5C518] transition-colors" href="https://www.linkedin.com/in/atharv-paharia-468276272/" target="_blank">LINKEDIN</a>
                <a className="hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank">TWITTER</a>
                <Link className="hover:text-[#F5C518] transition-colors" href="/work">ARCHIVE</Link>
            </div>
            <div className="text-gray-500 font-body text-xs uppercase tracking-widest">
                © 2024 NYX STUDIO * THE MIDNIGHT MANIFESTO
            </div>
        </footer>
        <MobileNav />
      </div>
    </>
  );
}
