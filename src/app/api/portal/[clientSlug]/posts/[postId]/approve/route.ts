import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requirePartner, findPostInBrand } from '../../../../[clientSlug]/_helpers'
import { snapshotPost } from '@/lib/portal/post-versioning'
import { triggerNotification } from '@/lib/portal/notifications'

// POST /api/portal/[clientSlug]/posts/[postId]/approve
//   Partner approves a NEEDS_APPROVAL post → status becomes APPROVED and
//   an APPROVAL_NOTE comment is recorded.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ clientSlug: string; postId: string }> },
) {
  const { clientSlug, postId } = await params
  const auth = await requirePartner(clientSlug)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
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
      status: 'APPROVED',
      comments: {
        create: {
          authorEmail: auth.email,
          body: 'Approved by client.',
          type: 'APPROVAL_NOTE',
        },
      },
    },
    include: { comments: { orderBy: { createdAt: 'desc' } } },
  })

  // Phase 5 follow-up: snapshot the post at the moment of approval so
  // any admin edits afterwards don't silently change what the client
  // agreed to. Logged best-effort — a snapshot failure shouldn't block
  // the approval flow itself.
  try {
    await snapshotPost(updated, 'APPROVED', auth.email)
  } catch (err) {
    console.error('[approve] snapshot failed (non-fatal):', err)
  }

  try {
    await triggerNotification({
      brandPartnerId: updated.brandPartnerId,
      type: 'APPROVED',
      message: `Client approved post "${updated.title}"`,
      actor: auth.email,
      postId: updated.id,
      postTitle: updated.title,
    })
  } catch (err) {
    console.error('[approve] triggerNotification failed (non-fatal):', err)
  }

  // Re-shape to the SerializedPost contract so the client can drop it
  // straight back into state.
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
