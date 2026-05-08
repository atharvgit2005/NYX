import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import {
    addViewer,
    listViewersForBrand,
    ViewerValidationError,
} from '@/lib/portal/viewer-store'
import { requireAdmin } from '../../../_helpers'

async function partnerIdForSlug(slug: string): Promise<string | null> {
    const p = await prisma.brandPartner.findUnique({
        where: { clientSlug: slug },
        select: { id: true },
    })
    return p?.id ?? null
}

// GET /api/portal/admin/brands/[clientSlug]/viewers — list current viewers
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ clientSlug: string }> },
) {
    const auth = await requireAdmin()
    if (!auth.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }
    const { clientSlug } = await params
    const partnerId = await partnerIdForSlug(clientSlug)
    if (!partnerId) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    const viewers = await listViewersForBrand(partnerId)
    return NextResponse.json({ viewers })
}

// POST /api/portal/admin/brands/[clientSlug]/viewers — add (or refresh) a viewer
//   body: { email: string, name?: string }
export async function POST(
    req: Request,
    { params }: { params: Promise<{ clientSlug: string }> },
) {
    const auth = await requireAdmin()
    if (!auth.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }
    const { clientSlug } = await params
    const partnerId = await partnerIdForSlug(clientSlug)
    if (!partnerId) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const email = String(body.email ?? '').trim().toLowerCase()
    const name = typeof body.name === 'string' ? body.name.trim() : null

    try {
        const viewer = await addViewer({
            brandPartnerId: partnerId,
            email,
            name,
            addedBy: auth.email,
        })
        return NextResponse.json({ viewer })
    } catch (err: unknown) {
        if (err instanceof ViewerValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 })
        }
        console.error('[admin/viewers POST]', err)
        return NextResponse.json(
            { error: (err as Error)?.message ?? 'Add failed' },
            { status: 500 },
        )
    }
}
