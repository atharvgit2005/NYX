/**
 * Per-brand portal configuration. Brand metadata lives in the
 * BrandConfiguration table, joined on BrandPartner. The shape returned
 * to consumers (`BrandConfig`) preserves the Phase-3 portal contract so
 * the read-only views don't need to know about the storage layer.
 *
 * Several legacy fields (avatarLetter, monthLabel / monthYear /
 * monthIndex / referenceToday, campaign.period) are derived in this
 * module rather than stored — they come straight off campaignStart.
 */
import prisma from '@/lib/prismadb'
import type {
  BrandConfiguration,
  BrandPartner,
  PackageType,
  Platform,
} from '@prisma/client'

export interface BrandConfig {
  slug: string
  client: {
    name: string
    tagline: string
    contact: string
    email: string
    phone: string
    products: string[]
    operations: string
    socialHandle: string
    avatarLetter: string
  }
  brand: {
    primary: string
    secondary: string
    accent: string
  }
  campaign: {
    title: string
    period: string
    /** Human-readable label of the primary platform — kept for the
     *  Phase 3 portal layout that displays one platform name. */
    platform: string
    /** Full platform array (Phase 5 follow-up). Use this when forms /
     *  filters need the canonical enum list. */
    platforms: Platform[]
    monthLabel: string
    monthYear: number
    monthIndex: number
    referenceToday: string
  }
  packB: {
    title: string
    description: string
    sources: string[]
    goals: string[]
  }
  agency: {
    name: string
    tagline: string
    email: string
    website: string
  }
}

// ── adapter: BrandConfiguration row → BrandConfig (legacy shape) ────────

function adapt(
  partner: Pick<BrandPartner, 'clientSlug' | 'clientName' | 'email'>,
  cfg: BrandConfiguration,
): BrandConfig {
  const start = cfg.campaignStart
  const end = cfg.campaignEnd

  return {
    slug: partner.clientSlug,
    client: {
      name: cfg.brandName,
      tagline: cfg.tagline ?? '',
      contact: cfg.clientContactName ?? '',
      email: partner.email,
      phone: cfg.clientPhone ?? '',
      products: cfg.products,
      operations: cfg.operations ?? '',
      socialHandle: deriveSocialHandle(cfg),
      avatarLetter: (cfg.brandName || partner.clientName).charAt(0).toUpperCase(),
    },
    brand: {
      primary: cfg.primaryColor,
      secondary: cfg.secondaryColor,
      accent: cfg.accentColor ?? cfg.secondaryColor,
    },
    campaign: {
      title: packageTypeLabel(cfg.packageType),
      period: formatPeriod(start, end),
      platform: primaryPlatformLabel(cfg.platforms),
      platforms: cfg.platforms.length ? cfg.platforms : ['INSTAGRAM'],
      monthLabel: start.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      monthYear: start.getUTCFullYear(),
      monthIndex: start.getUTCMonth(),
      referenceToday: start.toISOString().slice(0, 10),
    },
    packB: {
      title: cfg.packBEnabled ? cfg.packBTitle ?? '' : '',
      description: cfg.packBEnabled ? cfg.packBDescription ?? '' : '',
      sources: cfg.packBEnabled ? cfg.packBSourceLabels : [],
      goals: cfg.packBEnabled ? cfg.packBGoals : [],
    },
    agency: {
      name: cfg.agencyContactName ?? 'NYX Studio',
      tagline: 'AI-Powered Content Studio',
      email: cfg.agencyContactEmail ?? 'hello@nyxstudio.in',
      website: 'https://nyxstudio.in',
    },
  }
}

function deriveSocialHandle(cfg: BrandConfiguration): string {
  const ig = cfg.instagramHandle?.replace(/^@/, '')
  if (ig) return '@' + ig
  const tt = cfg.tiktokHandle?.replace(/^@/, '')
  if (tt) return '@' + tt
  return ''
}

function packageTypeLabel(t: PackageType): string {
  switch (t) {
    case 'TRIAL':
      return 'Trial Pack'
    case 'MONTHLY_RETAINER':
      return 'Monthly Retainer'
    case 'CUSTOM':
      return 'Custom Engagement'
  }
}

function primaryPlatformLabel(platforms: Platform[]): string {
  if (platforms.length === 0) return 'Instagram'
  if (platforms.includes('INSTAGRAM')) return 'Instagram'
  if (platforms.includes('TIKTOK')) return 'TikTok'
  return platforms[0]
}

function formatPeriod(start: Date, end: Date): string {
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()

  if (sameMonth) {
    const month = start.toLocaleDateString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    })
    return `${month} ${start.getUTCDate()}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  }
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
}

// ── public resolver ─────────────────────────────────────────────────────

export async function getBrandConfig(slug: string): Promise<BrandConfig | null> {
  const partner = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    include: { configuration: true },
  })

  if (!partner?.configuration) return null
  return adapt(partner, partner.configuration)
}
