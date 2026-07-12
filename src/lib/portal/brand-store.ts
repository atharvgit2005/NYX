/**
 * Phase 4: BrandConfiguration CRUD. Used by admin onboarding/edit forms
 * and the post management workspace.
 *
 * Brand-onboarding via this module creates BOTH the BrandPartner row
 * (status=ACTIVE, approvedBy=admin who created it) AND the matching
 * BrandConfiguration row in a single transaction so we never end up
 * with a half-created brand.
 */
import prisma from '@/lib/prismadb'
import type {
  BrandConfiguration,
  BrandPartner,
  PackageType,
  Platform,
} from '@prisma/client'

export interface BrandFormInput {
  brandName: string
  clientSlug: string
  contactEmail: string
  tagline?: string | null
  primaryColor: string
  secondaryColor: string
  accentColor?: string | null
  instagramHandle?: string | null
  tiktokHandle?: string | null
  platforms: Platform[]
  packageType: PackageType
  campaignStart: Date
  campaignEnd: Date
  agencyContactName?: string | null
  agencyContactEmail?: string | null
  // Phase 4 additions don't yet ship in the form — left optional so the
  // form can omit them without breaking validation.
  clientContactName?: string | null
  clientPhone?: string | null
  products?: string[]
  operations?: string | null
  packBEnabled?: boolean
  packBTitle?: string | null
  packBDescription?: string | null
  packBSourcePostIds?: string[]
  packBSourceLabels?: string[]
  packBGoals?: string[]
  confidentialityNote?: string | null
  renewalEmail?: string | null
  logoUrl?: string | null
  featuresAccess?: Record<string, boolean> | null
}

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
const SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export class BrandValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BrandValidationError'
  }
}

function validate(input: BrandFormInput): void {
  if (!input.brandName?.trim()) throw new BrandValidationError('brandName is required')
  if (!input.clientSlug?.trim()) throw new BrandValidationError('clientSlug is required')
  if (!SLUG.test(input.clientSlug)) {
    throw new BrandValidationError(
      'clientSlug must be lowercase letters, numbers and hyphens only',
    )
  }
  if (!input.contactEmail?.includes('@')) {
    throw new BrandValidationError('contactEmail must be a valid email')
  }
  if (!HEX.test(input.primaryColor)) {
    throw new BrandValidationError('primaryColor must be a hex colour like #D83C14')
  }
  if (!HEX.test(input.secondaryColor)) {
    throw new BrandValidationError('secondaryColor must be a hex colour')
  }
  if (input.accentColor && !HEX.test(input.accentColor)) {
    throw new BrandValidationError('accentColor must be a hex colour')
  }
  if (!input.platforms?.length) {
    throw new BrandValidationError('At least one platform must be selected')
  }
  if (!(input.campaignStart instanceof Date) || isNaN(input.campaignStart.getTime())) {
    throw new BrandValidationError('campaignStart must be a valid date')
  }
  if (!(input.campaignEnd instanceof Date) || isNaN(input.campaignEnd.getTime())) {
    throw new BrandValidationError('campaignEnd must be a valid date')
  }
  if (input.campaignEnd < input.campaignStart) {
    throw new BrandValidationError('campaignEnd must be on or after campaignStart')
  }
}

function stripAt(handle?: string | null): string | null {
  if (!handle) return null
  return handle.replace(/^@/, '').trim() || null
}

// ── Read ────────────────────────────────────────────────────────────────

export async function listBrandsWithConfig() {
  return prisma.brandPartner.findMany({
    where: { status: { in: ['ACTIVE', 'PAUSED'] } },
    include: { configuration: true },
    orderBy: [{ status: 'asc' }, { approvedAt: 'desc' }],
  })
}

export async function getBrandPartnerWithConfigBySlug(slug: string) {
  return prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    include: { configuration: true },
  })
}

// ── Create ─────────────────────────────────────────────────────────────

export async function createBrandWithConfig(
  input: BrandFormInput,
  approvedBy: string,
): Promise<{ partner: BrandPartner; configuration: BrandConfiguration }> {
  validate(input)

  const email = input.contactEmail.toLowerCase()
  const slug = input.clientSlug.toLowerCase()

  const existingByEmail = await prisma.brandPartner.findUnique({ where: { email } })
  if (existingByEmail) {
    throw new BrandValidationError(`A brand already exists for ${email}`)
  }
  const existingBySlug = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
  })
  if (existingBySlug) {
    throw new BrandValidationError(`Slug "${slug}" is already taken`)
  }

  return prisma.$transaction(async (tx) => {
    const partner = await tx.brandPartner.create({
      data: {
        email,
        clientSlug: slug,
        clientName: input.brandName,
        approvedBy,
        status: 'ACTIVE',
      },
    })

    // If a pending request existed for this email, mark it rejected (no
    // longer needs the human-approval queue — admin created directly).
    await tx.pendingPartnerRequest.updateMany({
      where: { email, status: 'PENDING' },
      data: { status: 'REJECTED', notes: 'Auto-resolved: admin created brand directly' },
    })

    const configuration = await tx.brandConfiguration.create({
      data: {
        brandPartnerId: partner.id,
        brandName: input.brandName,
        tagline: input.tagline ?? null,
        logoUrl: input.logoUrl ?? null,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        accentColor: input.accentColor ?? null,
        instagramHandle: stripAt(input.instagramHandle ?? null),
        tiktokHandle: stripAt(input.tiktokHandle ?? null),
        clientContactName: input.clientContactName ?? null,
        clientPhone: input.clientPhone ?? null,
        products: input.products ?? [],
        operations: input.operations ?? null,
        packageType: input.packageType,
        campaignStart: input.campaignStart,
        campaignEnd: input.campaignEnd,
        platforms: input.platforms,
        agencyContactName: input.agencyContactName ?? null,
        agencyContactEmail: input.agencyContactEmail ?? null,
        packBEnabled: input.packBEnabled ?? false,
        packBTitle: input.packBTitle ?? null,
        packBDescription: input.packBDescription ?? null,
        packBSourcePostIds: input.packBSourcePostIds ?? [],
        packBSourceLabels: input.packBSourceLabels ?? [],
        packBGoals: input.packBGoals ?? [],
        confidentialityNote: input.confidentialityNote ?? null,
        renewalEmail: input.renewalEmail ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        featuresAccess: input.featuresAccess as any,
      },
    })

    return { partner, configuration }
  })
}

// ── Update ─────────────────────────────────────────────────────────────

export async function updateBrandWithConfig(
  slug: string,
  input: Partial<BrandFormInput>,
): Promise<{ partner: BrandPartner; configuration: BrandConfiguration | null }> {
  const partner = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    include: { configuration: true },
  })
  if (!partner) throw new BrandValidationError(`No brand with slug "${slug}"`)
  if (!partner.configuration) {
    throw new BrandValidationError(
      `Brand "${slug}" has no BrandConfiguration row — run the migration first`,
    )
  }

  // Only validate fields actually present.
  if (input.primaryColor && !HEX.test(input.primaryColor)) {
    throw new BrandValidationError('primaryColor must be a hex colour')
  }
  if (input.secondaryColor && !HEX.test(input.secondaryColor)) {
    throw new BrandValidationError('secondaryColor must be a hex colour')
  }
  if (input.accentColor && !HEX.test(input.accentColor)) {
    throw new BrandValidationError('accentColor must be a hex colour')
  }
  if (input.campaignStart && input.campaignEnd && input.campaignEnd < input.campaignStart) {
    throw new BrandValidationError('campaignEnd must be on or after campaignStart')
  }

  return prisma.$transaction(async (tx) => {
    // Keep clientName on BrandPartner in sync if brandName changed.
    if (input.brandName) {
      await tx.brandPartner.update({
        where: { id: partner.id },
        data: { clientName: input.brandName },
      })
    }

    const cfg = await tx.brandConfiguration.update({
      where: { brandPartnerId: partner.id },
      data: {
        brandName: input.brandName ?? undefined,
        tagline: input.tagline ?? undefined,
        logoUrl: input.logoUrl ?? undefined,
        primaryColor: input.primaryColor ?? undefined,
        secondaryColor: input.secondaryColor ?? undefined,
        accentColor: input.accentColor === undefined ? undefined : input.accentColor,
        instagramHandle:
          input.instagramHandle === undefined ? undefined : stripAt(input.instagramHandle),
        tiktokHandle:
          input.tiktokHandle === undefined ? undefined : stripAt(input.tiktokHandle),
        clientContactName: input.clientContactName ?? undefined,
        clientPhone: input.clientPhone ?? undefined,
        products: input.products ?? undefined,
        operations: input.operations ?? undefined,
        packageType: input.packageType ?? undefined,
        campaignStart: input.campaignStart ?? undefined,
        campaignEnd: input.campaignEnd ?? undefined,
        platforms: input.platforms ?? undefined,
        agencyContactName: input.agencyContactName ?? undefined,
        agencyContactEmail: input.agencyContactEmail ?? undefined,
        packBEnabled: input.packBEnabled ?? undefined,
        packBTitle: input.packBTitle ?? undefined,
        packBDescription: input.packBDescription ?? undefined,
        packBSourcePostIds: input.packBSourcePostIds ?? undefined,
        packBSourceLabels: input.packBSourceLabels ?? undefined,
        packBGoals: input.packBGoals ?? undefined,
        confidentialityNote: input.confidentialityNote ?? undefined,
        renewalEmail: input.renewalEmail ?? undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        featuresAccess: input.featuresAccess === undefined ? undefined : (input.featuresAccess as any),
      },
    })

    const updatedPartner = await tx.brandPartner.findUnique({
      where: { id: partner.id },
    })
    return { partner: updatedPartner!, configuration: cfg }
  })
}
