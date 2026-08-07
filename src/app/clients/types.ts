export interface Post {
  id: number
  title: string
  date: string
  day: string
  type: string
  status: string
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string
}

export interface ClientConfig {
  client: {
    name: string
    tagline: string
    contact: string
    email: string
    phone: string
    products: string[]
    operations: string
    logoUrl: string
  }
  brand: {
    primary: string
    secondary: string
    accent: string
  }
  auth: {
    password: string
  }
  campaign: {
    title: string
    period: string
    platform: string
    totals: {
      posts: number
      reels: number
      carousels: number
      photos: number
      stories: number
    }
  }
  posts: Post[]
  packB: {
    title: string
    description: string
    sources: string[]
    goals: string[]
  }
  agency: {
    name: string
    tagline: string
    founders: string[]
    email: string
    phone: string
    website: string
  }
}

export type PostStatus =
  | 'Idea'
  | 'Drafting'
  | 'Needs Approval'
  | 'Needs Revision'
  | 'Approved'
  | 'Posted'

export const STATUS_PIPELINE: PostStatus[] = [
  'Idea',
  'Drafting',
  'Needs Approval',
  'Needs Revision',
  'Approved',
  'Posted',
]

export const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Reel: { bg: '#FEF2F2', text: '#DC2626', dot: '#E50914' },
  Carousel: { bg: '#F4F4F5', text: '#18181B', dot: '#27272A' },
  Photo: { bg: '#FFF1F2', text: '#E11D48', dot: '#E50914' },
  'Reel + Story': { bg: '#FEF2F2', text: '#B91C1C', dot: '#DC2626' },
  Story: { bg: '#F4F4F5', text: '#09090B', dot: '#18181B' },
}

export const TYPE_GRADIENTS: Record<string, string> = {
  Reel: 'linear-gradient(135deg, #E50914 0%, #B91C1C 100%)',
  Carousel: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
  Photo: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
  'Reel + Story': 'linear-gradient(135deg, #E50914 0%, #18181B 100%)',
  Story: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
}
