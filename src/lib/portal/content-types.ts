/**
 * Display-label helpers and visual tokens for ContentType + PostStatus
 * enums. The DB stores SCREAMING_SNAKE values; the UI shows human-readable
 * strings ("Reel", "Carousel", "Needs Approval"). Centralised here so all
 * Phase 3 components agree on labels and colours.
 */
import type { ContentType, PostStatus } from '@prisma/client'

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  REEL: 'Reel',
  CAROUSEL: 'Carousel',
  STATIC_POST: 'Photo',
  STORY: 'Story',
  REEL_STORY: 'Reel + Story',
}

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  IDEA: 'Idea',
  DRAFTING: 'Drafting',
  NEEDS_APPROVAL: 'Needs Approval',
  NEEDS_REVISION: 'Needs Revision',
  APPROVED: 'Approved',
  POSTED: 'Posted',
}

export const POST_STATUS_PIPELINE: PostStatus[] = [
  'IDEA',
  'DRAFTING',
  'NEEDS_APPROVAL',
  'NEEDS_REVISION',
  'APPROVED',
  'POSTED',
]

export const TYPE_COLORS: Record<
  ContentType,
  { bg: string; text: string; dot: string }
> = {
  REEL: { bg: '#FEF2F2', text: '#DC2626', dot: '#E50914' },
  CAROUSEL: { bg: '#F4F4F5', text: '#18181B', dot: '#27272A' },
  STATIC_POST: { bg: '#FFF1F2', text: '#E11D48', dot: '#E50914' },
  REEL_STORY: { bg: '#FEF2F2', text: '#B91C1C', dot: '#DC2626' },
  STORY: { bg: '#F4F4F5', text: '#09090B', dot: '#18181B' },
}

export const TYPE_GRADIENTS: Record<ContentType, string> = {
  REEL: 'linear-gradient(135deg, #E50914 0%, #B91C1C 100%)',
  CAROUSEL: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
  STATIC_POST: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
  REEL_STORY: 'linear-gradient(135deg, #E50914 0%, #18181B 100%)',
  STORY: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
}

export const STATUS_COLORS: Record<
  PostStatus,
  { bg: string; text: string; dot: string }
> = {
  IDEA: { bg: '#FFF9E6', text: '#B8860B', dot: '#FFC107' },
  DRAFTING: { bg: '#E8F4FF', text: '#0066CC', dot: '#2196F3' },
  NEEDS_APPROVAL: { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
  NEEDS_REVISION: { bg: '#FCE4EC', text: '#C62828', dot: '#F44336' },
  APPROVED: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  POSTED: { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
}

export const TYPE_ICONS: Record<ContentType, string> = {
  REEL: '▶',
  CAROUSEL: '⧉',
  STATIC_POST: '◻',
  STORY: '○',
  REEL_STORY: '▶',
}
