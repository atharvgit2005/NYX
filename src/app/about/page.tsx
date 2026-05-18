import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SchemaOrg from "@/components/SchemaOrg";
import {
  aboutPageSchema,
  atharvSchema,
  bhavyaSchema,
  breadcrumbSchema,
  createMarketingMetadata,
  organizationSchema,
  speakableSchema,
} from "@/lib/seo";
import { MobileNav } from "../components/MobileNav";
import "../page.css";

export const metadata: Metadata = createMarketingMetadata({
  title: "About NYX Studio — AI-native content studio for D2C brands in India",
  description:
    "NYX Studio is an AI-native content and growth studio for D2C brands in India. Founded by Atharv Paharia and Bhavya Jain in Pune. Cinematic films, paid creative, influencer ops.",
  path: "/about",
  openGraphTitle: "About NYX Studio — AI-native content for D2C brands",
  openGraphDescription:
    "Pune-based studio building cinematic films, paid creative, and influencer ops for India's direct-to-consumer brands. Founded 2025 by Atharv Paharia and Bhavya Jain.",
});

// Speakable: voice answer engines read the about-prose section aloud
// when asked "who is NYX Studio". Tight CSS selectors keep nav and
// chrome out of the spoken snippet.
const aboutSpeakable = speakableSchema([".about-lede", ".about-fact"]);

export default function AboutPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          aboutPageSchema,
          organizationSchema,
          atharvSchema,
          bhavyaSchema,
          aboutSpeakable,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      <div className="bg-[#0E0E0E] text-[#e5e2e1] font-body selection:bg-primary selection:text-ink-black min-h-screen relative w-full overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 bg-[#0E0E0E] dark:bg-black border-b-4 border-black dark:border-white/10 rounded-none">
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
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/work">WORK</Link>
            <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/services">SERVICES</Link>
            <Link className="font-headline uppercase tracking-tighter font-bold text-[#E8441A] border-b-4 border-[#E8441A] pb-1 px-2" href="/about">ABOUT</Link>
            <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/contact">CONTACT</Link>
            <Link className="font-headline uppercase tracking-tighter font-bold text-white hover:text-[#F5C518] transition-all duration-75 px-2" href="/portal">PORTAL</Link>
          </nav>
          <Link href="/contact" className="bg-[#E8441A] text-white px-3 md:px-6 py-1 md:py-2 font-headline uppercase tracking-tighter font-bold text-[0.75rem] md:text-base scale-100 active:scale-95 hover:bg-[#F5C518] hover:text-black transition-all duration-75 inline-block border-4 border-transparent hover:border-black whitespace-nowrap">
            LET&apos;S TALK →
          </Link>
        </header>

        <main className="pt-[72px] md:pt-28 pb-[72px] md:pb-0">
          {/* Hero */}
          <section className="relative px-4 sm:px-6 md:px-8 py-14 md:py-20 border-b-4 border-ink-black overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <span className="font-label text-xs uppercase tracking-widest text-primary mb-4 block">* THE STUDIO / EST. 2025</span>
              <h1 className="font-headline text-huge font-black tracking-tighter uppercase mb-6 md:mb-8">
                WE BUILD<br />WHAT WE&apos;D<br />SCROLL FOR.
              </h1>
              <p className="about-lede font-body text-base md:text-xl max-w-3xl text-on-surface-variant leading-relaxed">
                NYX Studio is an AI-native content and growth studio for
                direct-to-consumer brands selling in India. We build cinematic
                brand films, performance creative, content automation
                pipelines, and influencer operations — under one roof,
                priced for founders, shipped at the velocity AI now makes
                possible. Based in Pune, Maharashtra.
              </p>
            </div>
          </section>

          {/* Story */}
          <section className="bg-surface-container-lowest border-b-4 border-ink-black py-16 md:py-24 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <span className="font-label text-xs uppercase tracking-widest text-secondary block">* THE THESIS</span>
              <h2 className="font-headline text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                CONTENT VELOCITY IS THE D2C MOAT.
              </h2>
              <p className="about-fact font-body text-base md:text-lg leading-relaxed text-white/80">
                NYX Studio was founded in 2025 by Atharv Paharia and Bhavya
                Jain. The premise was simple: every D2C founder we knew was
                bottlenecked on content velocity, not strategy. They knew
                what to make. They couldn&apos;t make it fast enough, cheaply
                enough, or consistently enough to compound.
              </p>
              <p className="about-fact font-body text-base md:text-lg leading-relaxed text-white/80">
                Generative AI changed the math. AI-generated product films
                are now indistinguishable from a five-figure live shoot for
                roughly 70% of social-media use cases — and they ship in
                48-72 hours instead of two weeks. That single shift means a
                small team can deliver the cadence a large agency used to
                charge a fortune for.
              </p>
              <p className="about-fact font-body text-base md:text-lg leading-relaxed text-white/80">
                NYX is the studio built around that shift. Cinematic film,
                paid creative, and influencer ops under one roof — priced
                for D2C founders doing ₹50L+ MRR who&apos;ve outgrown freelance
                Fridays.
              </p>
            </div>
          </section>

          {/* Founders */}
          <section className="bg-[#0E0E0E] border-b-4 border-ink-black py-16 md:py-24 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10 md:mb-16">
                <span className="text-secondary font-headline font-bold text-base md:text-xl uppercase tracking-widest">* THE FOUNDERS</span>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase font-headline leading-none mt-4 text-white">
                  TWO OPERATORS,<br />ONE STUDIO.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Atharv */}
                <article id="atharv" className="border-4 border-white p-6 md:p-8 bg-black">
                  <div className="w-32 h-32 mb-6 border-4 border-white overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-300">
                    <Image
                      src="/founders/atharv.jpg"
                      alt="Atharv Paharia, Co-Founder and Tech Lead at NYX Studio"
                      width={600}
                      height={750}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase font-headline tracking-tighter text-white mb-2">
                    ATHARV PAHARIA
                  </h3>
                  <p className="text-[#E8441A] font-bold uppercase tracking-widest text-sm mb-6">* CO-FOUNDER &amp; TECH LEAD</p>
                  <p className="about-fact font-body text-sm md:text-base leading-relaxed text-white/80 mb-6">
                    Atharv leads AI engineering, the content production
                    pipeline, and the video automation systems that let the
                    studio ship at agency-grade velocity with a small team.
                    Knows where AI helps, where it doesn&apos;t, and how to
                    glue both ends together.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/atharv-paharia-468276272/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-4 border-white p-3 hover:bg-[#E8441A] hover:border-[#E8441A] transition-colors rounded-none"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-white">LINKEDIN ↗</span>
                    </a>
                  </div>
                </article>

                {/* Bhavya */}
                <article id="bhavya" className="border-4 border-white p-6 md:p-8 bg-black">
                  <div className="w-32 h-32 mb-6 border-4 border-white overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-300">
                    <Image
                      src="/founders/bhavya.jpg"
                      alt="Bhavya Jain, Co-Founder and Product Lead at NYX Studio"
                      width={600}
                      height={750}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase font-headline tracking-tighter text-white mb-2">
                    BHAVYA JAIN
                  </h3>
                  <p className="text-[#E8441A] font-bold uppercase tracking-widest text-sm mb-6">* CO-FOUNDER &amp; PRODUCT LEAD</p>
                  <p className="about-fact font-body text-sm md:text-base leading-relaxed text-white/80 mb-6">
                    Bhavya leads brand strategy, product, and the
                    partner-facing systems that translate D2C founder briefs
                    into shipping content campaigns. Lives close to the
                    Indian D2C ecosystem and decides what NYX makes next.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/bhavya-jain-10963b33a/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-4 border-white p-3 hover:bg-[#E8441A] hover:border-[#E8441A] transition-colors rounded-none"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-white">LINKEDIN ↗</span>
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Quick facts strip — AEO-favoured: declarative, citable */}
          <section className="bg-surface-container-low border-b-4 border-ink-black py-16 md:py-24 px-4 sm:px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <span className="font-label text-xs uppercase tracking-widest text-primary mb-4 block">* QUICK FACTS</span>
              <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-10 md:mb-12">
                AT A GLANCE
              </h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-ink-black">
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Founded</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">2025</dd>
                </div>
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Headquartered in</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">Pune, Maharashtra, India</dd>
                </div>
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Founders</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">Atharv Paharia, Bhavya Jain</dd>
                </div>
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Vertical focus</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">D2C — food, beverage, lifestyle, beauty, apparel</dd>
                </div>
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Geography</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">India</dd>
                </div>
                <div className="border-b-4 border-ink-black pb-4">
                  <dt className="font-label text-xs uppercase tracking-widest text-ink-black/60 mb-2">Pricing range</dt>
                  <dd className="about-fact font-headline text-2xl md:text-3xl font-bold">₹30,000 – ₹80,000 / month</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 md:py-32 px-4 sm:px-6 md:px-8 text-center bg-surface border-b-4 border-black">
            <h3 className="font-headline text-[clamp(2.25rem,10vw,8rem)] leading-[0.9] font-black tracking-tighter uppercase mb-8 md:mb-12">
              READY TO<br />MANIFEST?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
              <Link
                className="px-6 md:px-10 py-4 md:py-5 bg-white text-ink-black font-headline text-base md:text-xl font-bold uppercase tracking-tighter hover:bg-primary transition-all border-4 border-black"
                href="/work"
              >
                VIEW WORK →
              </Link>
              <Link
                className="px-6 md:px-10 py-4 md:py-5 border-4 border-white text-white font-headline text-base md:text-xl font-bold uppercase tracking-tighter hover:bg-white hover:text-ink-black transition-all"
                href="/contact"
              >
                START A PROJECT →
              </Link>
            </div>
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
            <div className="text-xl font-bold text-white font-headline uppercase">NYX STUDIO</div>
          </Link>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.instagram.com/nyx.studios.ai/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
            <a className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="https://www.linkedin.com/company/nyx-studio-ai/" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <Link className="font-body text-xs uppercase tracking-widest text-gray-500 hover:text-[#F5C518] transition-colors" href="/work">ARCHIVE</Link>
          </div>
          <p className="font-headline text-[0.75rem] uppercase tracking-wider text-white/60">
            © 2026 NYX Studio
          </p>
        </footer>
        <MobileNav />
      </div>
    </>
  );
}
