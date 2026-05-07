/**
 * Brand-partner store, backed by Postgres (Prisma).
 *
 * Phase 1 used clients.json on disk. That broke on Vercel serverless
 * (read-only filesystem). Phase 2 keeps the same public function names
 * so /portal routing stays working, while persisting through Prisma.
 *
 * The legacy clients.json is kept in the repo as a backup until Phase 2
 * is verified in production — it is no longer read or written.
 */
import prisma from '@/lib/prismadb'
import type {
  BrandPartner,
  BrandPartnerStatus,
  PendingPartnerRequest,
  PendingPartnerStatus,
} from '@prisma/client'

// ── Phase 1-compatible API (used by /portal/* routing pages) ───────────────

export async function findApprovedClient(
  email: string,
): Promise<BrandPartner | null> {
  return prisma.brandPartner.findFirst({
    where: {
      email: email.toLowerCase(),
      status: 'ACTIVE',
    },
  })
}

export async function isPendingClient(email: string): Promise<boolean> {
  const found = await prisma.pendingPartnerRequest.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  })
  return !!found
}

/**
 * Idempotent: if the email is already pending OR already an approved partner,
 * does nothing. Returns true only when a new pending row was created.
 * `name` is captured from the Google profile when available.
 */
export async function addPendingClient(
  email: string,
  name?: string,
): Promise<boolean> {
  const target = email.toLowerCase()

  const alreadyApproved = await prisma.brandPartner.findUnique({
    where: { email: target },
    select: { id: true },
  })
  if (alreadyApproved) return false

  const alreadyPending = await prisma.pendingPartnerRequest.findUnique({
    where: { email: target },
    select: { id: true },
  })
  if (alreadyPending) return false

  await prisma.pendingPartnerRequest.create({
    data: { email: target, name: name ?? null },
  })
  return true
}

// ── Admin API (used by /api/admin/portal/*) ────────────────────────────────

export async function listPendingPartners(): Promise<PendingPartnerRequest[]> {
  return prisma.pendingPartnerRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { requestedAt: 'desc' },
  })
}

export async function listAllBrandPartners(): Promise<BrandPartner[]> {
  return prisma.brandPartner.findMany({
    where: { status: { in: ['ACTIVE', 'PAUSED'] } },
    orderBy: [{ status: 'asc' }, { approvedAt: 'desc' }],
  })
}

export async function getPortalStats() {
  const [activeCount, pendingCount, pausedCount] = await Promise.all([
    prisma.brandPartner.count({ where: { status: 'ACTIVE' } }),
    prisma.pendingPartnerRequest.count({ where: { status: 'PENDING' } }),
    prisma.brandPartner.count({ where: { status: 'PAUSED' } }),
  ])
  return {
    active: activeCount,
    pending: pendingCount,
    paused: pausedCount,
    total: activeCount + pausedCount,
  }
}

export async function approvePendingPartner(input: {
  email: string
  clientSlug: string
  clientName: string
  approvedBy: string
}): Promise<BrandPartner> {
  const target = input.email.toLowerCase()

  const slug = input.clientSlug.trim().toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug must be lowercase letters, numbers, and hyphens only')
  }

  const slugTaken = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    select: { id: true },
  })
  if (slugTaken) {
    throw new Error(`Slug "${slug}" is already in use`)
  }

  // Transactional: delete pending row, create partner.
  return prisma.$transaction(async (tx) => {
    await tx.pendingPartnerRequest.deleteMany({ where: { email: target } })
    return tx.brandPartner.create({
      data: {
        email: target,
        clientSlug: slug,
        clientName: input.clientName.trim(),
        approvedBy: input.approvedBy,
      },
    })
  })
}

export async function rejectPendingPartner(input: {
  email: string
  notes?: string
}): Promise<PendingPartnerRequest> {
  return prisma.pendingPartnerRequest.update({
    where: { email: input.email.toLowerCase() },
    data: {
      status: 'REJECTED',
      notes: input.notes?.trim() || null,
    },
  })
}

export async function setBrandPartnerStatus(
  id: string,
  status: BrandPartnerStatus,
): Promise<BrandPartner> {
  return prisma.brandPartner.update({
    where: { id },
    data: { status },
  })
}

export type {
  BrandPartner,
  BrandPartnerStatus,
  PendingPartnerRequest,
  PendingPartnerStatus,
}
