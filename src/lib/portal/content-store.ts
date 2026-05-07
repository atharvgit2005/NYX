/**
 * Read-only DB helpers for the brand-partner content calendar.
 * Phase 3 is read-only on the partner side — mutations are admin-only and
 * land in Phase 4. Keep this module side-effect free.
 */
import prisma from '@/lib/prismadb'
import type { PostStatus } from '@prisma/client'
import { POST_STATUS_PIPELINE } from './content-types'

export async function getContentPosts(brandPartnerId: string) {
  return prisma.contentPost.findMany({
    where: { brandPartnerId },
    orderBy: [{ scheduledDate: 'asc' }, { position: 'asc' }],
  })
}

export async function getContentPostById(id: string) {
  return prisma.contentPost.findUnique({ where: { id } })
}

export async function getPostStatusCounts(
  brandPartnerId: string,
): Promise<Record<PostStatus, number>> {
  const grouped = await prisma.contentPost.groupBy({
    by: ['status'],
    where: { brandPartnerId },
    _count: { _all: true },
  })

  // Initialise every pipeline stage to zero so the UI can render the full
  // pipeline even when some stages are empty.
  const counts = Object.fromEntries(
    POST_STATUS_PIPELINE.map((s) => [s, 0]),
  ) as Record<PostStatus, number>

  for (const row of grouped) {
    counts[row.status] = row._count._all
  }
  return counts
}
