/**
 * /feed.xml — RSS 2.0 feed for the public site.
 *
 * Why exist when we already have /sitemap.xml?
 *   - Perplexity, Bing, and several niche crawlers index RSS more
 *     aggressively than sitemaps. A feed is the fastest path to
 *     "Perplexity finds your latest update within 24h".
 *   - llms.txt is static — RSS is live. New brand partners flow into
 *     the feed at approve time without a redeploy.
 *
 * Content shape:
 *   - The four canonical marketing pages (home, work, services, contact)
 *     as stable entries so the feed never looks empty.
 *   - Recent ACTIVE BrandPartners as time-series items, ordered by
 *     approvedAt desc. Public-safe: name + slug only, no PII.
 *
 * Cache: 1h s-maxage + stale-while-revalidate so this stays cheap on
 * Vercel even if a bot polls aggressively.
 */
import prisma from '@/lib/prismadb'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'
// Allow ISR-style caching at the edge.
export const revalidate = 3600

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: Date
  guid: string
}

const STATIC_ITEMS: FeedItem[] = [
  {
    title: 'NYX Studio — AI-powered content for D2C brands in India',
    link: `${SITE_URL}/`,
    description:
      'AI-native content and growth studio for D2C brands. Cinematic reels, paid creative, influencer ops — all under one roof. Currently onboarding Q3 2026 brand partners.',
    pubDate: new Date('2026-01-01T00:00:00Z'),
    guid: `${SITE_URL}/#home`,
  },
  {
    title: 'Our work — D2C creative portfolio',
    link: `${SITE_URL}/work`,
    description:
      'Food films, product campaigns, and cinematic reels built for D2C brands. Every frame designed to stop thumbs and drive conversions.',
    pubDate: new Date('2026-01-01T00:00:00Z'),
    guid: `${SITE_URL}/work`,
  },
  {
    title: 'Services and pricing',
    link: `${SITE_URL}/services`,
    description:
      'Trial Pack ₹30K/mo. Starter Pack ₹50K/mo. Growth Pack ₹80K/mo. Content strategy, paid social, creative production, brand growth.',
    pubDate: new Date('2026-01-01T00:00:00Z'),
    guid: `${SITE_URL}/services`,
  },
  {
    title: 'About NYX Studio',
    link: `${SITE_URL}/about`,
    description:
      'Co-founded in Pune by Atharv Paharia (Tech) and Bhavya Jain (Product) in 2025. The studio story, philosophy, and what we build.',
    pubDate: new Date('2026-01-01T00:00:00Z'),
    guid: `${SITE_URL}/about`,
  },
]

async function brandPartnerItems(): Promise<FeedItem[]> {
  // Defensive: BrandPartner is a Phase-4 table — try/catch in case a
  // future schema change or migration timing means the table is briefly
  // empty/absent. Never let the feed 500.
  try {
    const partners = await prisma.brandPartner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { approvedAt: 'desc' },
      take: 25,
      select: {
        clientName: true,
        clientSlug: true,
        approvedAt: true,
      },
    })
    return partners.map((p) => ({
      title: `NYX Studio onboarded ${p.clientName}`,
      // Brand portal links are auth-gated; surface the public /work
      // page as the destination instead of leaking the slug.
      link: `${SITE_URL}/work`,
      description: `${p.clientName} joined NYX Studio's roster of D2C brand partners on ${p.approvedAt.toISOString().slice(0, 10)}. See more of our work for D2C brands in India.`,
      pubDate: p.approvedAt,
      guid: `${SITE_URL}/partners#${p.clientSlug}`,
    }))
  } catch {
    return []
  }
}

function itemToXml(item: FeedItem): string {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
}

export async function GET() {
  const partnerItems = await brandPartnerItems()
  const items = [...partnerItems, ...STATIC_ITEMS]
  const lastBuildDate = (
    items.reduce((acc, i) => (i.pubDate > acc ? i.pubDate : acc), items[0].pubDate)
  ).toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NYX Studio</title>
    <link>${SITE_URL}</link>
    <description>AI-native content and growth studio for D2C brands in India. Updates from the studio: new brand partners, services, and writing.</description>
    <language>en-IN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.map(itemToXml).join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
