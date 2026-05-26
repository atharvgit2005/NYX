/**
 * Brand kit CRUD for a given partner.
 *
 *   GET    → returns the kit, assets, and a flag for whether embeddings
 *            need reindexing.
 *   POST   → multipart upload of an asset OR JSON patch of notes/
 *            audience/winners. Routes by Content-Type.
 *   DELETE → ?assetId=… removes one asset (and triggers reindex).
 *
 * Uploads land in Vercel Blob under `portal-brandkit/<slug>/…` so they
 * don't collide with thumbnail uploads.
 */
import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../../_helpers'
import { reindexBrandKit } from '@/lib/ai/rag/embeddings'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_SIZE = 15 * 1024 * 1024 // 15 MB — brand-guideline PDFs can be heavy
const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
]

async function partnerForSlug(slug: string) {
  return prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    select: { id: true, clientSlug: true, clientName: true },
  })
}

async function ensureKit(partnerId: string) {
  const existing = await prisma.brandKit.findUnique({ where: { brandPartnerId: partnerId } })
  if (existing) return existing
  return prisma.brandKit.create({ data: { brandPartnerId: partnerId } })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    const { clientSlug } = await params
    const partner = await partnerForSlug(clientSlug)
    if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const kit = await prisma.brandKit.findUnique({
      where: { brandPartnerId: partner.id },
      include: {
        assets: { orderBy: { createdAt: 'desc' } },
        _count: { select: { chunks: true } },
      },
    })
    return NextResponse.json({ kit })
  } catch (err: unknown) {
    console.error('GET brand-kit error:', err)
    return NextResponse.json(
      { error: `Database or server error: ${err instanceof Error ? err.message : 'Unknown'}. Please make sure you ran 'npx prisma db push' to create any new tables.` },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  const { clientSlug } = await params
  const partner = await partnerForSlug(clientSlug)
  if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const kit = await ensureKit(partner.id)
  const ct = req.headers.get('content-type') ?? ''

  // ── JSON patch path: update notes/audience/winners + reindex
  if (ct.includes('application/json')) {
    let body: { notes?: string; audience?: string; winners?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const updated = await prisma.brandKit.update({
      where: { id: kit.id },
      data: {
        notes: body.notes ?? kit.notes,
        audience: body.audience ?? kit.audience,
        winners: body.winners ?? kit.winners,
      },
    })
    // Best-effort reindex — don't fail the request if embeddings fail.
    let reindex = null
    try {
      reindex = await reindexFromKit(kit.id, updated.notes, updated.audience, updated.winners)
    } catch (e) {
      console.error('Reindexing failed:', e)
      reindex = { error: (e as Error).message }
    }
    return NextResponse.json({ kit: updated, reindex })
  }

  // ── Multipart asset upload path
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
      { status: 500 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }
  const file = form.get('file')
  const kind = String(form.get('kind') ?? 'reference')
  const caption = String(form.get('caption') ?? '')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file in form field "file"' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type ${file.type}` }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 15 MB.` },
      { status: 400 },
    )
  }
  const extGuess = file.name.split('.').pop()?.toLowerCase() ?? file.type.split('/')[1] ?? 'bin'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const filename = `portal-brandkit/${partner.clientSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName || 'asset.' + extGuess}`
  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  })

  const asset = await prisma.brandKitAsset.create({
    data: {
      brandKitId: kit.id,
      kind,
      url: blob.url,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      caption: caption || null,
      uploadedBy: auth.email,
    },
  })

  // Trigger a reindex if the asset adds searchable text (caption or
  // text/markdown). Image/PDF binary content is not indexed in this
  // pass — captions only, which keeps it cheap on the free Gemini tier.
  const refreshed = await prisma.brandKit.findUnique({ where: { id: kit.id } })
  let reindex = null
  try {
    reindex = await reindexFromKit(
      kit.id,
      refreshed?.notes ?? null,
      refreshed?.audience ?? null,
      refreshed?.winners ?? null,
    )
  } catch (e) {
    console.error('Reindexing failed:', e)
    reindex = { error: (e as Error).message }
  }
  return NextResponse.json({ asset, reindex })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  const { clientSlug } = await params
  const partner = await partnerForSlug(clientSlug)
  if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const url = new URL(req.url)
  const assetId = url.searchParams.get('assetId')
  if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 })

  const asset = await prisma.brandKitAsset.findUnique({ where: { id: assetId } })
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  // Confirm the asset belongs to this brand's kit
  const kit = await prisma.brandKit.findUnique({ where: { id: asset.brandKitId } })
  if (!kit || kit.brandPartnerId !== partner.id) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Try to remove the blob too. Best-effort — DB row removal still wins.
  try {
    await del(asset.url)
  } catch {
    // ignore
  }
  await prisma.brandKitAsset.delete({ where: { id: assetId } })
  const refreshed = await prisma.brandKit.findUnique({ where: { id: kit.id } })
  let reindex = null
  try {
    reindex = await reindexFromKit(
      kit.id,
      refreshed?.notes ?? null,
      refreshed?.audience ?? null,
      refreshed?.winners ?? null,
    )
  } catch (e) {
    console.error('Reindexing failed:', e)
    reindex = { error: (e as Error).message }
  }
  return NextResponse.json({ ok: true, reindex })
}

async function reindexFromKit(
  kitId: string,
  notes: string | null,
  audience: string | null,
  winners: string | null,
) {
  // Pull asset captions too — they're the only text we currently embed
  // for non-text-MIME uploads.
  const assets = await prisma.brandKitAsset.findMany({
    where: { brandKitId: kitId },
    select: { caption: true, filename: true, kind: true },
  })
  const sources = [
    notes ? { source: 'kit.notes', text: notes } : null,
    audience ? { source: 'kit.audience', text: audience } : null,
    winners ? { source: 'kit.winners', text: winners } : null,
    ...assets
      .map((a, i) =>
        a.caption
          ? {
              source: `asset.${a.kind}.${i}.${a.filename}`,
              text: a.caption,
            }
          : null,
      )
      .filter(Boolean),
  ].filter(Boolean) as Array<{ source: string; text: string }>
  if (sources.length === 0) return { chunks: 0, model: null }
  return reindexBrandKit(kitId, sources)
}
