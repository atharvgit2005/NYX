/**
 * Phase 4 — admin-side ContentPost mutations. The companion to
 * content-store.ts (read-only). Lives in lib/portal so that any future
 * admin tooling (CSV import, bulk reorder) can share the same helpers.
 */
import prisma from '@/lib/prismadb'
import type {
  ContentPost,
  ContentType,
  Platform,
  PostStatus,
} from '@prisma/client'

export interface PostCreateInput {
  title: string
  scheduledDate: Date
  contentType: ContentType
  platform: Platform
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes?: string | null
  thumbnailUrl?: string | null
}

export interface PostUpdateInput {
  title?: string
  scheduledDate?: Date
  contentType?: ContentType
  platform?: Platform
  status?: PostStatus
  caption?: string
  hashtags?: string[]
  visualDirection?: string
  productionNotes?: string | null
  thumbnailUrl?: string | null
  position?: number
  archivedAt?: Date | null
}

export class PostValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PostValidationError'
  }
}

function validateCreate(input: PostCreateInput) {
  if (!input.title?.trim()) throw new PostValidationError('title is required')
  if (!(input.scheduledDate instanceof Date) || isNaN(input.scheduledDate.getTime()))
    throw new PostValidationError('scheduledDate must be a valid date')
  if (!input.caption?.trim()) throw new PostValidationError('caption is required')
  if (!input.visualDirection?.trim())
    throw new PostValidationError('visualDirection is required')
  if (!Array.isArray(input.hashtags) || input.hashtags.length === 0)
    throw new PostValidationError('at least one hashtag required')
}

// ── Create ─────────────────────────────────────────────────────────────

export async function createPost(
  brandPartnerId: string,
  input: PostCreateInput,
): Promise<ContentPost> {
  validateCreate(input)

  // Auto-position at the end of the IDEA column.
  const last = await prisma.contentPost.findFirst({
    where: { brandPartnerId, status: 'IDEA', archivedAt: null },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const nextPosition = (last?.position ?? -1) + 1

  return prisma.contentPost.create({
    data: {
      brandPartnerId,
      title: input.title,
      scheduledDate: input.scheduledDate,
      contentType: input.contentType,
      platform: input.platform,
      status: 'IDEA',
      caption: input.caption,
      hashtags: input.hashtags,
      visualDirection: input.visualDirection,
      productionNotes: input.productionNotes ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      position: nextPosition,
    },
  })
}

// ── Update / move / archive ────────────────────────────────────────────

export async function updatePost(
  postId: string,
  input: PostUpdateInput,
): Promise<ContentPost> {
  if (input.scheduledDate && isNaN(input.scheduledDate.getTime())) {
    throw new PostValidationError('scheduledDate must be a valid date')
  }
  return prisma.contentPost.update({
    where: { id: postId },
    data: {
      title: input.title ?? undefined,
      scheduledDate: input.scheduledDate ?? undefined,
      contentType: input.contentType ?? undefined,
      platform: input.platform ?? undefined,
      status: input.status ?? undefined,
      caption: input.caption ?? undefined,
      hashtags: input.hashtags ?? undefined,
      visualDirection: input.visualDirection ?? undefined,
      productionNotes: input.productionNotes === undefined ? undefined : input.productionNotes,
      thumbnailUrl: input.thumbnailUrl === undefined ? undefined : input.thumbnailUrl,
      position: input.position ?? undefined,
      archivedAt: input.archivedAt === undefined ? undefined : input.archivedAt,
    },
  })
}

export async function archivePost(postId: string): Promise<ContentPost> {
  return prisma.contentPost.update({
    where: { id: postId },
    data: { archivedAt: new Date() },
  })
}

export async function restorePost(postId: string): Promise<ContentPost> {
  return prisma.contentPost.update({
    where: { id: postId },
    data: { archivedAt: null },
  })
}

// Hard delete — physically removes the row plus cascades comments/versions
// (Prisma onDelete defaults handle the relations). Use only when the user
// explicitly confirms; archive (soft) is the default recoverable path.
export async function hardDeletePost(postId: string): Promise<void> {
  await prisma.contentPost.delete({ where: { id: postId } })
}

// ── Listing for admin (includes archived flag) ─────────────────────────

export async function listPostsForAdmin(brandPartnerId: string, includeArchived = false) {
  return prisma.contentPost.findMany({
    where: {
      brandPartnerId,
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    include: {
      comments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: [{ scheduledDate: 'asc' }, { position: 'asc' }],
  })
}

// Archive-only listing for the admin archive drawer. Sorted by most-recently
// archived first so the freshly removed post is at the top.
export async function listArchivedPosts(brandPartnerId: string) {
  return prisma.contentPost.findMany({
    where: { brandPartnerId, archivedAt: { not: null } },
    include: { comments: { orderBy: { createdAt: 'desc' } } },
    orderBy: [{ archivedAt: 'desc' }],
  })
}
