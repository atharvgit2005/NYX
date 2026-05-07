/**
 * Per-brand portal configuration. Each brand gets its own file under
 * `brands/[slug].ts`. The shape captures everything that varies between
 * partners: brand colours, campaign meta, the in-store Pack B copy, and
 * agency contact block.
 *
 * The DB owns content (ContentPost rows). Visual + campaign metadata
 * stays code-side because it changes per partner, not per post.
 */
import { dessertinoBrand } from './brands/dessertino'

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
    platform: string
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

const BRANDS: Record<string, BrandConfig> = {
  dessertino: dessertinoBrand,
}

export function getBrandConfig(slug: string): BrandConfig | null {
  return BRANDS[slug] ?? null
}
