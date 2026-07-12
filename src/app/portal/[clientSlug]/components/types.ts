import type { ContentType, PostStatus, CommentType, Platform } from '@prisma/client'

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
  /** Phase 4 added column. Phase 3 read-only views ignore this; the
   *  Phase 5 admin-canvas overlay needs it for its edit form. */
  platform: Platform
  status: PostStatus
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string | null
  thumbnailUrl: string | null
  mediaUrls: string[]
  position: number
  /** Soft-delete timestamp. Server-side query filters archivedAt=null
   *  on the partner-facing fetch, so this is always null when posts
   *  are surfaced; included to keep the shape compatible with the
   *  admin edit form. */
  archivedAt: string | null
  instagramUrl?: string | null
  comments: SerializedComment[]
  createdAt: string
  updatedAt: string
}
