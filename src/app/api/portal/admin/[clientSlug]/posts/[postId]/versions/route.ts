import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { listVersions } from '@/lib/portal/post-versioning'
import { requireAdmin } from '../../../../_helpers'

// GET /api/portal/admin/[clientSlug]/posts/[postId]/versions
//   List all approval snapshots for a post (newest first).
export async function GET(
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

    // Defensive — confirm the post belongs to the brand.
    const post = await prisma.contentPost.findFirst({
        where: { id: postId, brandPartner: { clientSlug } },
        select: { id: true },
    })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const versions = await listVersions(postId)
    return NextResponse.json({ versions })
}
