import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { removeViewer } from '@/lib/portal/viewer-store'
import { requireAdmin } from '../../../../_helpers'

// DELETE /api/portal/admin/brands/[clientSlug]/viewers/[viewerId]
//   Revoke a viewer's read-access to a brand portal.
export async function DELETE(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{ clientSlug: string; viewerId: string }>
    },
) {
    const auth = await requireAdmin()
    if (!auth.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }

    const { clientSlug, viewerId } = await params

    // Defensive: confirm the viewer row belongs to the brand in the URL.
    const viewer = await prisma.portalViewer.findUnique({
        where: { id: viewerId },
        include: { brandPartner: { select: { clientSlug: true } } },
    })
    if (!viewer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (viewer.brandPartner.clientSlug !== clientSlug) {
        return NextResponse.json(
            { error: 'Viewer does not belong to this brand' },
            { status: 400 },
        )
    }

    await removeViewer(viewerId)
    return NextResponse.json({ ok: true })
}
