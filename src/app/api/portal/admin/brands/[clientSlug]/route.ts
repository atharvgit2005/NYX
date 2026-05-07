import { NextResponse } from 'next/server'
import {
  getBrandPartnerWithConfigBySlug,
  updateBrandWithConfig,
  BrandValidationError,
  type BrandFormInput,
} from '@/lib/portal/brand-store'
import { requireAdmin } from '../../_helpers'

// GET /api/portal/admin/brands/[clientSlug] — fetch brand + config
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug } = await params
  const result = await getBrandPartnerWithConfigBySlug(clientSlug)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ partner: result, configuration: result.configuration })
}

// PATCH /api/portal/admin/brands/[clientSlug] — partial update
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  const { clientSlug } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch: Partial<BrandFormInput> = {}
  if (typeof body.brandName === 'string') patch.brandName = body.brandName.trim()
  if (typeof body.tagline === 'string') patch.tagline = body.tagline
  if (typeof body.logoUrl === 'string') patch.logoUrl = body.logoUrl
  if (typeof body.primaryColor === 'string') patch.primaryColor = body.primaryColor
  if (typeof body.secondaryColor === 'string') patch.secondaryColor = body.secondaryColor
  if (typeof body.accentColor === 'string' || body.accentColor === null)
    patch.accentColor = body.accentColor as string | null
  if (typeof body.instagramHandle === 'string' || body.instagramHandle === null)
    patch.instagramHandle = body.instagramHandle as string | null
  if (typeof body.tiktokHandle === 'string' || body.tiktokHandle === null)
    patch.tiktokHandle = body.tiktokHandle as string | null
  if (typeof body.clientContactName === 'string') patch.clientContactName = body.clientContactName
  if (typeof body.clientPhone === 'string') patch.clientPhone = body.clientPhone
  if (Array.isArray(body.products)) patch.products = body.products as string[]
  if (typeof body.operations === 'string') patch.operations = body.operations
  if (Array.isArray(body.platforms)) patch.platforms = body.platforms as BrandFormInput['platforms']
  if (typeof body.packageType === 'string')
    patch.packageType = body.packageType as BrandFormInput['packageType']
  if (typeof body.campaignStart === 'string') patch.campaignStart = new Date(body.campaignStart)
  if (typeof body.campaignEnd === 'string') patch.campaignEnd = new Date(body.campaignEnd)
  if (typeof body.agencyContactName === 'string') patch.agencyContactName = body.agencyContactName
  if (typeof body.agencyContactEmail === 'string') patch.agencyContactEmail = body.agencyContactEmail
  if (typeof body.packBEnabled === 'boolean') patch.packBEnabled = body.packBEnabled
  if (typeof body.packBTitle === 'string') patch.packBTitle = body.packBTitle
  if (typeof body.packBDescription === 'string') patch.packBDescription = body.packBDescription
  if (Array.isArray(body.packBSourcePostIds))
    patch.packBSourcePostIds = body.packBSourcePostIds as string[]
  if (Array.isArray(body.packBSourceLabels))
    patch.packBSourceLabels = body.packBSourceLabels as string[]
  if (Array.isArray(body.packBGoals)) patch.packBGoals = body.packBGoals as string[]
  if (typeof body.confidentialityNote === 'string')
    patch.confidentialityNote = body.confidentialityNote
  if (typeof body.renewalEmail === 'string') patch.renewalEmail = body.renewalEmail

  try {
    const result = await updateBrandWithConfig(clientSlug, patch)
    return NextResponse.json(result)
  } catch (err: unknown) {
    if (err instanceof BrandValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[admin/brands PATCH] failed:', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Update failed' },
      { status: 500 },
    )
  }
}
