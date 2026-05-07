import type { ContentType, PostStatus } from '@prisma/client'

/**
 * Serialised ContentPost — Dates flattened to ISO strings for the
 * server→client component boundary. Mirrors the Prisma shape.
 */
export interface SerializedPost {
  id: string
  brandPartnerId: string
  title: string
  scheduledDate: string
  contentType: ContentType
  status: PostStatus
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string | null
  thumbnailUrl: string | null
  mediaUrls: string[]
  position: number
  createdAt: string
  updatedAt: string
}
