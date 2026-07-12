import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requirePartner, findPostInBrand } from '../../../../[clientSlug]/_helpers'
import { triggerNotification } from '@/lib/portal/notifications'

// POST /api/portal/[clientSlug]/posts/[postId]/request-revision
// Body: { comment: string }
//   Partner asks for changes on a NEEDS_APPROVAL post → status becomes
//   NEEDS_REVISION and a REVISION_REQUEST comment is recorded.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string; postId: string }> },
) {
  const { clientSlug, postId } = await params
  const auth = await requirePartner(clientSlug)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: { comment?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const comment = (body.comment ?? '').trim()
  if (!comment) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
  }
  if (comment.length > 5000) {
    return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
  }

  const post = await findPostInBrand(auth.partnerId, postId)
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (post.status !== 'NEEDS_APPROVAL') {
    return NextResponse.json(
      { error: `Post is in status ${post.status}, not NEEDS_APPROVAL` },
      { status: 409 },
    )
  }

  const updated = await prisma.contentPost.update({
    where: { id: postId },
    data: {
      status: 'NEEDS_REVISION',
      comments: {
        create: {
          authorEmail: auth.email,
          body: comment,
          type: 'REVISION_REQUEST',
        },
      },
    },
    include: { comments: { orderBy: { createdAt: 'desc' } } },
  })

  try {
    await triggerNotification({
      brandPartnerId: updated.brandPartnerId,
      type: 'REVISION_REQUESTED',
      message: `Client requested revision on post "${updated.title}" with comment: "${comment}"`,
      actor: auth.email,
      postId: updated.id,
      postTitle: updated.title,
      revisionComment: comment,
    })
  } catch (err) {
    console.error('[request-revision] triggerNotification failed (non-fatal):', err)
  }

  const serialized = {
    id: updated.id,
    brandPartnerId: updated.brandPartnerId,
    title: updated.title,
    scheduledDate: updated.scheduledDate.toISOString(),
    contentType: updated.contentType,
    platform: updated.platform,
    status: updated.status,
    caption: updated.caption,
    hashtags: updated.hashtags,
    visualDirection: updated.visualDirection,
    productionNotes: updated.productionNotes,
    thumbnailUrl: updated.thumbnailUrl,
    mediaUrls: updated.mediaUrls,
    instagramUrl: updated.instagramUrl,
    position: updated.position,
    archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
    comments: updated.comments.map((c) => ({
      id: c.id,
      authorEmail: c.authorEmail,
      body: c.body,
      type: c.type,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
  return NextResponse.json({ post: serialized })
}
