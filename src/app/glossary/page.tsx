import type { Metadata } from 'next'
import Link from 'next/link'
import SchemaOrg from '@/components/SchemaOrg'
import {
  SITE_URL,
  breadcrumbSchema,
  createMarketingMetadata,
  organizationSchema,
} from '@/lib/seo'
import { MobileNav } from '../components/MobileNav'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import '../page.css'

export const metadata: Metadata = createMarketingMetadata({
  title: 'D2C content marketing glossary — terms every brand should know',
  description:
    'Plain-English definitions for the metrics, formats, and frameworks NYX Studio uses to plan and measure D2C content campaigns. Hook rate, ROAS, CAC, thumb-stop ratio and more.',
  path: '/glossary',
  openGraphTitle: 'D2C content marketing glossary | NYX Studio',
  openGraphDescription:
    'The metrics and terms every D2C founder should understand before briefing a content agency.',
})

interface Term {
  /** URL-safe slug used for anchor links and term URLs. */
  slug: string
  /** Display term — what readers see. */
  term: string
  /** One-sentence definition that can stand alone as an AI snippet. */
  definition: string
  /** Optional expansion shown below the definition. */
  context?: string
}

// ── The glossary itself ────────────────────────────────────────────────
// Each entry doubles as a Schema.org DefinedTerm, so AI engines can
// retrieve the prose as a self-contained answer ("what is hook rate?").
// Keep `definition` to one sentence — that's the citation surface.
const TERMS: Term[] = [
  {
    slug: 'hook-rate',
    term: 'Hook rate',
    definition:
      'The percentage of viewers who watch past the first 3 seconds of a video — a leading indicator of whether a reel will earn paid distribution.',
    context:
      'On Meta, anything above ~30% on cold traffic is healthy. NYX targets 40%+ on tier-1 creatives.',
  },
  {
    slug: 'thumb-stop-ratio',
    term: 'Thumb-stop ratio',
    definition:
      'The share of a feed audience that stops scrolling on a piece of content long enough to register the brand — measured as 3-second views divided by impressions.',
    context:
      'A close cousin of hook rate, but feed-scoped. Used as a creative diagnostic, not a campaign KPI.',
  },
  {
    slug: 'roas',
    term: 'ROAS (Return on Ad Spend)',
    definition:
      'Revenue generated per rupee of ad spend, calculated as attributed revenue divided by ad spend over a defined window.',
    context:
      'For D2C in India, a sustainable Meta ROAS depends on AOV — fashion brands often run at 2.5×, premium food at 3.5×+.',
  },
  {
    slug: 'cac',
    term: 'CAC (Customer Acquisition Cost)',
    definition:
      'The total marketing and sales cost to acquire one paying customer over a given period.',
    context:
      'Always pair CAC with LTV. A high CAC is fine if LTV is several multiples higher; a low CAC means nothing if customers never re-purchase.',
  },
  {
    slug: 'ltv',
    term: 'LTV (Lifetime Value)',
    definition:
      'The total gross profit a brand expects from one customer across the entire customer relationship.',
    context:
      'For young D2C brands, use a 12-month proxy LTV — anything longer is too noisy to act on.',
  },
  {
    slug: 'aov',
    term: 'AOV (Average Order Value)',
    definition:
      'The mean revenue per order, calculated as total revenue divided by order count over a period.',
    context:
      'Bundles, upsells, and threshold-based free-shipping are the three highest-leverage AOV moves for D2C brands.',
  },
  {
    slug: 'cpm',
    term: 'CPM (Cost per Mille)',
    definition:
      'The cost to deliver one thousand impressions of an ad — the primary auction-driven cost on Meta and TikTok.',
    context:
      'Indian D2C CPMs on Meta typically sit between ₹80 and ₹400 depending on audience, category, and creative quality.',
  },
  {
    slug: 'cpc',
    term: 'CPC (Cost per Click)',
    definition:
      'The cost per outbound click an ad generates, calculated as ad spend divided by clicks.',
    context:
      'A diagnostic metric, not a goal — chasing low CPC without watching conversion rate is a fast path to wasted spend.',
  },
  {
    slug: 'creative-refresh-cadence',
    term: 'Creative refresh cadence',
    definition:
      'The frequency at which a brand introduces new ad creatives to combat audience fatigue and CPM creep.',
    context:
      'NYX standard: refresh top-of-funnel creative every 7–14 days on Meta, slower on TikTok where evergreens compound.',
  },
  {
    slug: 'attribution-window',
    term: 'Attribution window',
    definition:
      'The time window in which a click or view on an ad is credited with a downstream conversion.',
    context:
      'Meta defaults to 7-day-click + 1-day-view. Shortening this is the fastest way to understand incrementality without an MMM build.',
  },
  {
    slug: 'd2c',
    term: 'D2C (Direct-to-Consumer)',
    definition:
      'A retail model in which a brand sells directly to end customers — usually via its own website or marketplaces — without a wholesale or distributor layer.',
    context:
      "India's modern D2C wave began around 2015 with brands like boAt and Mamaearth, accelerated post-2020 by Shopify, Razorpay, and Meta CAPI adoption.",
  },
  {
    slug: 'reel',
    term: 'Reel',
    definition:
      'A short-form vertical video (15–90 seconds) distributed on Instagram, Facebook, and YouTube Shorts, designed to maximise organic reach and watch time.',
    context:
      'Reels are the dominant top-of-funnel format for D2C brands in 2026 because Meta still over-distributes them in feed and Explore.',
  },
]

// ── Schema.org JSON-LD ──────────────────────────────────────────────────
// DefinedTermSet wraps the whole glossary; each Term emits its own
// DefinedTerm with a stable @id, so an answer engine can cite a specific
// definition by URL.
const definedTermSetSchema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${SITE_URL}/glossary#set`,
  name: 'NYX Studio — D2C content marketing glossary',
  description:
    'Plain-English definitions for the metrics, formats, and frameworks NYX Studio uses with D2C brand partners.',
  url: `${SITE_URL}/glossary`,
  hasDefinedTerm: TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    '@id': `${SITE_URL}/glossary#${t.slug}`,
    name: t.term,
    description: t.definition,
    url: `${SITE_URL}/glossary#${t.slug}`,
    inDefinedTermSet: { '@id': `${SITE_URL}/glossary#set` },
  })),
}

export default function GlossaryPage() {
  return (
    <>
      <SchemaOrg
        schema={[
          definedTermSetSchema,
          organizationSchema,
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Glossary', path: '/glossary' },
          ]),
        ]}
      />

      <div className="bg-[#0E0E0E] text-[#e5e2e1] font-body min-h-screen relative w-full overflow-hidden">
        {/* Header */}
        <SiteHeader />

        <main className="pt-28 md:pt-36 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
          <div
            className="text-xs uppercase tracking-[0.2em] text-[#D83C14] font-black mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            * GLOSSARY
          </div>
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            D2C content terms
            <br />
            <span className="text-[#D83C14]">in plain English.</span>
          </h1>
          <p className="text-[#e4beb5] text-base md:text-lg max-w-2xl mb-12">
            The metrics, formats, and frameworks we use with NYX brand partners
            — written so a founder can brief us without a marketing degree.
          </p>

          {/* Term index — anchor links so a TOC works and AI engines
              can deep-link to a specific definition. */}
          <nav
            aria-label="Glossary index"
            className="mb-12 border-l-4 border-[#D83C14] pl-6"
          >
            <div
              className="text-xs uppercase tracking-widest text-[#D83C14] font-black mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              * INDEX
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {TERMS.map((t) => (
                <li key={t.slug}>
                  <a
                    href={`#${t.slug}`}
                    className="text-[#e4beb5] hover:text-[#D83C14] underline underline-offset-4 decoration-[#5b403a] hover:decoration-[#D83C14]"
                  >
                    {t.term}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Term definitions — each as an <article> so the DOM matches
              the DefinedTerm schema 1:1. */}
          <div className="space-y-12">
            {TERMS.map((t) => (
              <article
                key={t.slug}
                id={t.slug}
                className="border-l-4 border-black pl-6 scroll-mt-32"
              >
                <h2
                  className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-2"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {t.term}
                </h2>
                <p className="text-[#e5e2e1] text-base md:text-lg leading-relaxed mb-2">
                  {t.definition}
                </p>
                {t.context && (
                  <p className="text-[#ab8981] text-sm italic leading-relaxed">
                    {t.context}
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="mt-20 border-t-4 border-[#D83C14] pt-8">
            <p className="text-[#e4beb5] text-sm mb-4">
              Want to put these to work on your brand?
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 border-4 border-black bg-[#D83C14] text-white text-sm font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] transition-all"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Talk to NYX →
            </Link>
          </div>
        </main>
        <SiteFooter />
        <MobileNav />
      </div>
    </>
  )
}
