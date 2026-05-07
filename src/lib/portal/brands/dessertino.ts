/**
 * Dessertino brand config — colours, social handle, Pack B, agency block.
 * To onboard a new partner, copy this file to `[slug].ts` and update fields.
 * The portal page resolves the active brand config via `getBrandConfig(slug)`.
 */
import type { BrandConfig } from '../brand-config'

export const dessertinoBrand: BrandConfig = {
  slug: 'dessertino',
  client: {
    name: 'Dessertino',
    tagline: 'Shakes and More',
    contact: 'Priyanka Baheti',
    email: 'ca.priyankabaheti@gmail.com',
    phone: '+91 96046 60660',
    products: [
      'Thick Shakes',
      'Ice Cream',
      'Waffles',
      'Pizza',
      'Burgers',
      'Fries',
      'Coffee',
    ],
    operations: 'Dine-in + Delivery (Swiggy/Zomato)',
    socialHandle: '@dessertino.pune',
    avatarLetter: 'D',
  },
  brand: {
    primary: '#E91E8C', // Hot pink
    secondary: '#00AEEF', // Sky blue
    accent: '#1A2A5E', // Navy
  },
  campaign: {
    title: 'Trial Pack A',
    period: 'May 5–15, 2026',
    platform: 'Instagram',
    monthLabel: 'May 2026',
    monthYear: 2026,
    monthIndex: 4, // 0-indexed (4 = May)
    referenceToday: '2026-05-05',
  },
  packB: {
    title: 'In-Store Screen Content',
    description:
      'Hero shots from selected posts repurposed for in-store vertical screen loops.',
    sources: [
      'Post #2 (Top 5 Shakes) — Best-seller loop',
      'Post #4 (Signature Shake) — Premium product still',
      'Post #7 (BTS) — Process footage to trigger cravings',
    ],
    goals: ['Increase AOV', 'Drive impulse purchases at point of sale'],
  },
  agency: {
    name: 'NYX Studio',
    tagline: 'AI-Powered Content Studio',
    email: 'nyx.studios.ai@gmail.com',
    website: 'https://nyxstudio.tech',
  },
}
