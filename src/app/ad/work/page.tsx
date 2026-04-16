import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
            <Link href="/ad" className="flex items-center gap-3">
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
                <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 transition-all duration-75" href="/ad/work">WORK</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/ad/services">SERVICES</Link>
                <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-all duration-75 px-2" href="/ad/contact">CONTACT</Link>
            </div>
            <Link href="/ad/contact" className="bg-[#ffb4a2] px-6 py-2 text-black font-headline font-bold uppercase tracking-tighter border-4 border-black hover:bg-[#F5C518] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000000] transition-all duration-75 inline-block">
                LET'S TALK →
            </Link>
        </nav>

        <main className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
            {/* Section Header */}
            <div className="mb-24 flex items-baseline gap-4">
                <span className="text-[#E8441A] font-headline font-bold text-xl">* 01</span>
                <h1 className="text-8xl md:text-[10rem] font-headline font-bold tracking-tighter leading-none uppercase text-white">
                    SELECTED<br/>WORK
                </h1>
            </div>

            {/* Bento Grid Mosaic */}
            <div className="bento-grid">
                {/* Project 01: Large Feature */}
                <div className="col-span-12 md:col-span-8 bg-[#0E0E0E] border-4 border-black group overflow-visible relative">
                    <div className="relative h-[600px] overflow-hidden">
                        <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Abstract geometric landscape" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdhgG6-cdcNkgftqkpLS2MQyZa5hy5vs5Qh6U4stw60YnBIHQK8AOXfqQWKC7bceThct6f3GsrR5iIwiWohxTlUJqQWw4lO4L8Qyd-4uFVy2PG3JGLikjFbfV1kwTTvVAqEpP5T24d_yIkQVP8-20PBqxi6jKJnU__88jNR49mVa505n0awjH_IvyGbVx4h8cEtze7IzbytrNC5q1ZUXW78jR2iuXHG0Tfyh5nYRATgv0uRCETLPn5HA9cQ09BFGBBinpz_s-4c1kW" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    <div className="p-8 relative">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#F5C518] text-black px-2 py-0.5 font-headline font-bold text-xs">* BRAND IDENTITY</span>
                            <span className="text-white/40 font-headline text-xs">/ 2024</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter leading-none uppercase text-white group-hover:text-[#E8441A] transition-colors">
                            AETHER<br/>CAMPAIGN
                        </h2>
                        {/* Breakout Element */}
                        <div className="absolute -bottom-8 -right-8 hidden md:block w-48 h-48 bg-[#E8441A] border-4 border-black p-4 z-10 flex flex-col justify-between">
                            <span className="material-symbols-outlined text-4xl text-black">north_east</span>
                            <p className="text-black font-headline font-black text-xl leading-none">VIEW CASE STUDY</p>
                        </div>
                    </div>
                </div>

                {/* Project 02: Vertical Burst */}
                <div className="col-span-12 md:col-span-4 bg-[#F5C518] border-4 border-black p-8 flex flex-col justify-between min-h-[400px]">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="bg-black text-white px-2 py-0.5 font-headline font-bold text-xs">* DIGITAL PRODUCT</span>
                        </div>
                        <h2 className="text-5xl font-headline font-bold tracking-tighter leading-tight uppercase text-black">
                            NEON<br/>DRIFT
                        </h2>
                    </div>
                    <div className="mt-8 border-t-4 border-black pt-4">
                        <p className="text-black font-body text-sm font-medium">Redefining the high-performance automotive interface for the electric age.</p>
                    </div>
                </div>

                {/* Project 03: The Void */}
                <div className="col-span-12 md:col-span-4 bg-[#0E0E0E] border-4 border-black overflow-hidden relative group">
                    <div className="aspect-square">
                        <img className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000" alt="Minimalist architectural detail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvGBldL5WgU6eSplGnsDa4GaVOnXnKifIROka8nQGMxHjJp55sdE6-7bolAJU9TR4h0kmoBMIV_vsIDTyAy0Yb9qAhIPvAKsdAltEUDzo_CCtwobPQ_HOdJ5yKv--L848FyrK82PpNYjJhkawsztwDH4Bz3Iw3P4ytbTFg9kYVFxILOXXtTOW4K47pvmYwCV9ZuRem6AkaUrROkV9qbjO0IDqTVglS5uOOJijVg5mFjp30R3GrakPofXVSkWizzQc1wfVc6S2jC6tR" />
                    </div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <span className="font-headline font-bold text-[#F2A7C3] mb-2">* EDITORIAL DESIGN</span>
                        <h2 className="text-4xl font-headline font-bold tracking-tighter uppercase text-white">THE MIDNIGHT<br/>CHRONICLES</h2>
                    </div>
                </div>

                {/* Project 04: Burnt Orange Statement */}
                <div className="col-span-12 md:col-span-8 bg-[#E8441A] border-4 border-black p-12 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                    <div className="flex-1 z-10">
                        <span className="bg-black text-[#E8441A] px-2 py-0.5 font-headline font-bold text-xs mb-6 inline-block">* ART DIRECTION</span>
                        <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tighter leading-none uppercase text-black mb-8">
                            VELVET<br/>REBEL
                        </h2>
                        <p className="max-w-md text-black font-body font-bold text-lg mb-8">A provocative visual manifesto for the avant-garde fashion house, fusing street grit with luxury precision.</p>
                        <button className="border-4 border-black px-8 py-3 font-headline font-bold text-black uppercase hover:bg-black hover:text-[#E8441A] transition-colors bg-transparent">
                            EXPLORE PROJECT →
                        </button>
                    </div>
                    {/* Breakout Visual */}
                    <div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full">
                        <img className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="Abstract painterly textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSjxkEQfMvInEY8bB1ZeH85sbvunBTO0M6t5TKjw66vwk5deJao7cXoXKPHyyUqYZqN0zb-g39_G7orUI_LwlMcDRq7pEJGl9vRrTDj6J59x52sqVTDsZ0C7PMh6ldXBl7Bgrg1muIMAPWSVVqmXNI8FoRMHtwiiO5KMPn0FkUX-WMSmRH4_UwGQ80j6YEFaJP6JabdfJzMb8InYWDVqICsqW6aUOH57jegEgD19YYMo0_B--USIKbeE31BJxLUeR-vKRFrW-QeNRw" />
                    </div>
                </div>

                {/* Project 05: Small Accent */}
                <div className="col-span-12 md:col-span-5 bg-[#0E0E0E] border-4 border-black p-8 group">
                    <div className="mb-12">
                        <img className="w-full h-64 object-cover border-4 border-black group-hover:rotate-1 transition-transform" alt="Monochrome close up" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYgQF8U4EtxeOIErA1V1jwUepv2pN4rsVvM_IhNZgDQeFzf8_f1IGpptJMpU9kEWnKJ2fqs3hjfOJZcJQZFXMg6auaOvVWUxYQ8q02zcYPHpe3svTjWj5K46TgFcP8YISGHQHLpJaKZFjkl8Yf1Z-Pvkff_j8yP8ICocfU0yH4d7EMPfBjUADXEymyyJ_LFF7QQeGecz6OzpltnBpiFMXDs56sTW25T8Uu5XBRUZGpvjJsf0Nh31mDSE7n7-7STc_7C8IOm8bvDufl" />
                    </div>
                    <span className="text-[#F5C518] font-headline font-bold">* EXPERIMENTAL</span>
                    <h2 className="text-4xl font-headline font-bold tracking-tighter uppercase mt-2 text-white">OBSCURA LABS</h2>
                </div>

                {/* Project 06: Asymmetric Text Block */}
                <div className="col-span-12 md:col-span-7 border-4 border-black bg-[#131313] p-12 relative flex flex-col justify-center">
                    <div className="absolute top-0 left-0 p-4 font-headline text-white/20 text-8xl font-black">06</div>
                    <div className="relative z-10 ml-auto max-w-xl text-right">
                        <h2 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase text-white mb-6">
                            SHADOW<br/><span className="text-[#E8441A]">ARCHIVE</span>
                        </h2>
                        <p className="text-[#e4beb5] font-body text-xl">Digital preservation of the ephemeral. A high-fidelity storage solution for contemporary digital artifacts.</p>
                    </div>
                    {/* Decoration */}
                    <div className="absolute bottom-0 left-0 p-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-4 bg-[#E8441A]"></div>
                            <div className="w-12 h-4 bg-[#F5C518]"></div>
                            <div className="w-12 h-4 bg-[#F2A7C3]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="mt-48 border-y-4 border-black py-24 flex flex-col items-center text-center">
                <h3 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase mb-12 text-white">
                    YOUR PROJECT IS<br/>NEXT IN LINE.
                </h3>
                <Link className="bg-white text-black px-12 py-6 font-headline font-black text-2xl uppercase border-4 border-black hover:bg-[#E8441A] hover:text-white transition-all transform hover:-rotate-2 inline-block" href="/ad/contact">
                    START THE BROADCAST →
                </Link>
            </div>
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 bg-[#0E0E0E] dark:bg-black border-t-4 border-black dark:border-white/10 rounded-none relative z-10">
            <Link href="/ad" className="flex items-center gap-3">
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
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="#">INSTAGRAM</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="#">LINKEDIN</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="#">TWITTER</a>
                <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="#">ARCHIVE</a>
            </div>
            <div className="font-body text-xs uppercase tracking-widest text-white">
                © 2024 NYX STUDIO * THE MIDNIGHT MANIFESTO
            </div>
        </footer>
      </div>
    </>
  );
}
