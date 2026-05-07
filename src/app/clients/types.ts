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
  Reel: { bg: '#FDE7F3', text: '#E91E8C', dot: '#E91E8C' },
  Carousel: { bg: '#E0F6FF', text: '#0078A8', dot: '#00AEEF' },
  Photo: { bg: '#E8EBF5', text: '#1A2A5E', dot: '#1A2A5E' },
  'Reel + Story': { bg: '#FCF0FA', text: '#C4186C', dot: '#E91E8C' },
  Story: { bg: '#FFF0F8', text: '#E91E8C', dot: '#E91E8C' },
}

export const TYPE_GRADIENTS: Record<string, string> = {
  Reel: 'linear-gradient(135deg, #E91E8C 0%, #FF6BB5 100%)',
  Carousel: 'linear-gradient(135deg, #00AEEF 0%, #5DD6FF 100%)',
  Photo: 'linear-gradient(135deg, #1A2A5E 0%, #3A5090 100%)',
  'Reel + Story': 'linear-gradient(135deg, #E91E8C 0%, #C4186C 50%, #00AEEF 100%)',
  Story: 'linear-gradient(135deg, #FF6BB5 0%, #E91E8C 100%)',
}
