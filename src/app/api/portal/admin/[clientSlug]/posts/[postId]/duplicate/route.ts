import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../../../../_helpers'

// POST /api/portal/admin/[clientSlug]/posts/[postId]/duplicate
//   Clones the post's content (title prefixed "Copy of "), resets
//   status to IDEA, places at the end of the IDEA column. Comments,
//   versions, and the archive flag don't carry over — fresh post.
export async function POST(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{ clientSlug: string; postId: string }>
    },
) {
    const auth = await requireAdmin()
    if (!auth.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }
    const { clientSlug, postId } = await params

    const source = await prisma.contentPost.findFirst({
        where: { id: postId, brandPartner: { clientSlug } },
    })
    if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Auto-position at the end of the IDEA column.
    const last = await prisma.contentPost.findFirst({
        where: {
            brandPartnerId: source.brandPartnerId,
            status: 'IDEA',
            archivedAt: null,
        },
        orderBy: { position: 'desc' },
        select: { position: true },
    })
    const nextPosition = (last?.position ?? -1) + 1

    const clone = await prisma.contentPost.create({
        data: {
            brandPartnerId: source.brandPartnerId,
            title: `Copy of ${source.title}`,
            scheduledDate: source.scheduledDate,
            contentType: source.contentType,
            platform: source.platform,
            status: 'IDEA',
            caption: source.caption,
            hashtags: source.hashtags,
            visualDirection: source.visualDirection,
            productionNotes: source.productionNotes,
            thumbnailUrl: source.thumbnailUrl,
            mediaUrls: source.mediaUrls,
            position: nextPosition,
        },
    })

    return NextResponse.json({ post: clone })
}
