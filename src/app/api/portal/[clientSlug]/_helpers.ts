/**
 * Partner-scoped auth gate. Used by the approve / request-revision
 * endpoints so a brand partner can only act on posts that belong to
 * their own slug. Admins are also allowed (admin preview can mirror the
 * action), but admin-side actions should normally go through the admin
 * routes — this is just a safety net.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import prisma from '@/lib/prismadb'
import type { ContentPost } from '@prisma/client'

export type PartnerAuthFailure =
  | { ok: false; status: 401 | 403 | 404; error: string }

export type PartnerAuthSuccess = {
  ok: true
  email: string
  isAdmin: boolean
  partnerId: string
  partnerEmail: string
}

export async function requirePartner(
  clientSlug: string,
): Promise<PartnerAuthSuccess | PartnerAuthFailure> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }
  const email = session.user.email.toLowerCase()
  const partner = await prisma.brandPartner.findUnique({
    where: { clientSlug },
    select: { id: true, email: true, status: true },
  })
  if (!partner) return { ok: false, status: 404, error: 'Brand not found' }
  if (partner.status === 'ARCHIVED') {
    return { ok: false, status: 403, error: 'Brand is archived' }
  }

  const isAdmin = isAdminEmail(email)
  if (!isAdmin && partner.email.toLowerCase() !== email) {
    return { ok: false, status: 403, error: 'Forbidden' }
  }

  return {
    ok: true,
    email,
    isAdmin,
    partnerId: partner.id,
    partnerEmail: partner.email,
  }
}

export async function findPostInBrand(
  partnerId: string,
  postId: string,
): Promise<ContentPost | null> {
  return prisma.contentPost.findFirst({
    where: { id: postId, brandPartnerId: partnerId, archivedAt: null },
  })
}
