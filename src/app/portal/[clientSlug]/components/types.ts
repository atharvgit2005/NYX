import type { ContentType, PostStatus, CommentType } from '@prisma/client'

export interface SerializedComment {
  id: string
  authorEmail: string
  body: string
  type: CommentType
  createdAt: string
}

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
  comments: SerializedComment[]
  createdAt: string
  updatedAt: string
}
