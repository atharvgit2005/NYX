import { NextResponse } from 'next/server'
import {
  createBrandWithConfig,
  BrandValidationError,
  type BrandFormInput,
} from '@/lib/portal/brand-store'
import { requireAdmin } from '../_helpers'
import prisma from '@/lib/prismadb'

// POST /api/portal/admin/brands — admin creates a new brand + configuration
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Convert ISO date strings → Date objects, narrow types defensively.
  const input: BrandFormInput = {
    brandName: String(body.brandName ?? '').trim(),
    clientSlug: String(body.clientSlug ?? '').trim().toLowerCase(),
    contactEmail: String(body.contactEmail ?? '').trim().toLowerCase(),
    tagline: typeof body.tagline === 'string' ? body.tagline : null,
    logoUrl: typeof body.logoUrl === 'string' && body.logoUrl ? body.logoUrl : null,
    primaryColor: String(body.primaryColor ?? ''),
    secondaryColor: String(body.secondaryColor ?? ''),
    accentColor: typeof body.accentColor === 'string' && body.accentColor ? body.accentColor : null,
    instagramHandle: typeof body.instagramHandle === 'string' ? body.instagramHandle : null,
    tiktokHandle: typeof body.tiktokHandle === 'string' ? body.tiktokHandle : null,
    platforms: Array.isArray(body.platforms) ? (body.platforms as BrandFormInput['platforms']) : [],
    packageType: (body.packageType as BrandFormInput['packageType']) ?? 'TRIAL',
    campaignStart: new Date(String(body.campaignStart ?? '')),
    campaignEnd: new Date(String(body.campaignEnd ?? '')),
    agencyContactName: typeof body.agencyContactName === 'string' ? body.agencyContactName : null,
    agencyContactEmail: typeof body.agencyContactEmail === 'string' ? body.agencyContactEmail : null,
  }

  try {
    const result = await createBrandWithConfig(input, auth.email)

    // Automatically create a BrandKit and associate any uploaded files/notes if provided
    const brandKitNotes = typeof body.brandKitNotes === 'string' ? body.brandKitNotes : null
    const brandKitAudience = typeof body.brandKitAudience === 'string' ? body.brandKitAudience : null
    const brandKitWinners = typeof body.brandKitWinners === 'string' ? body.brandKitWinners : null
    const brandKitAssets = Array.isArray(body.brandKitAssets) ? body.brandKitAssets : []

    if (brandKitNotes || brandKitAudience || brandKitWinners || brandKitAssets.length > 0) {
      const kit = await prisma.brandKit.create({
        data: {
          brandPartnerId: result.partner.id,
          notes: brandKitNotes,
          audience: brandKitAudience,
          winners: brandKitWinners,
        },
      })

      for (const asset of brandKitAssets) {
        await prisma.brandKitAsset.create({
          data: {
            brandKitId: kit.id,
            kind: String(asset.kind ?? 'reference'),
            url: String(asset.url),
            filename: String(asset.filename ?? 'document'),
            mimeType: String(asset.mimeType ?? 'application/octet-stream'),
            sizeBytes: Number(asset.sizeBytes ?? 0),
            caption: asset.caption ? String(asset.caption) : null,
            uploadedBy: auth.email,
          },
        })
      }
    }

    return NextResponse.json({
      partner: result.partner,
      configuration: result.configuration,
    })
  } catch (err: unknown) {
    if (err instanceof BrandValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[admin/brands] create failed:', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Create failed' },
      { status: 500 },
    )
  }
}
