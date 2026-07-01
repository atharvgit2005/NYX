import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import {
  archivePost,
  updatePost,
  PostValidationError,
  type PostUpdateInput,
} from '@/lib/portal/post-mutations'
import { snapshotPost } from '@/lib/portal/post-versioning'
import { sendNeedsApprovalEmail, triggerNotification } from '@/lib/portal/notifications'
import { requireAdmin } from '../../../_helpers'

async function findPost(slug: string, postId: string) {
  return prisma.contentPost.findFirst({
    where: { id: postId, brandPartner: { clientSlug: slug } },
  })
}

// PATCH /api/portal/admin/[clientSlug]/posts/[postId] — partial update,
// covers status / position / scheduledDate / archivedAt and full edits.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string; postId: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug, postId } = await params
  const existing = await findPost(clientSlug, postId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch: PostUpdateInput = {}
  if (typeof body.title === 'string') patch.title = body.title.trim()
  if (typeof body.scheduledDate === 'string')
    patch.scheduledDate = new Date(body.scheduledDate)
  if (typeof body.contentType === 'string')
    patch.contentType = body.contentType as PostUpdateInput['contentType']
  if (typeof body.platform === 'string')
    patch.platform = body.platform as PostUpdateInput['platform']
  if (typeof body.status === 'string')
    patch.status = body.status as PostUpdateInput['status']
  if (typeof body.caption === 'string') patch.caption = body.caption
  if (Array.isArray(body.hashtags))
    patch.hashtags = (body.hashtags as string[])
      .map((h) => String(h).trim().replace(/^#+/, ''))
      .filter(Boolean)
  if (typeof body.visualDirection === 'string') patch.visualDirection = body.visualDirection
  if (typeof body.productionNotes === 'string' || body.productionNotes === null)
    patch.productionNotes = body.productionNotes as string | null
  if (typeof body.thumbnailUrl === 'string' || body.thumbnailUrl === null)
    patch.thumbnailUrl = body.thumbnailUrl as string | null
  if (typeof body.position === 'number') patch.position = body.position
  if (body.archivedAt === null) patch.archivedAt = null
  if (typeof body.archivedAt === 'string') patch.archivedAt = new Date(body.archivedAt)

  try {
    const post = await updatePost(postId, patch)

    // Phase 5 follow-up: when admin transitions a post into APPROVED
    // (the workspace status dropdown), snapshot it. Skip if the post
    // was already APPROVED so we don't double-snapshot identical state.
    if (
      patch.status === 'APPROVED' &&
      existing.status !== 'APPROVED'
    ) {
      try {
        await snapshotPost(post, 'APPROVED', auth.email)
      } catch (e) {
        console.error('[admin/posts] snapshot failed (non-fatal):', e)
      }
    }

    // Phase 5 follow-up: when admin moves a post INTO NEEDS_APPROVAL,
    // notify the brand partner by email. Skip if the post was already
    // in that status (no real transition).
    if (
      patch.status === 'NEEDS_APPROVAL' &&
      existing.status !== 'NEEDS_APPROVAL'
    ) {
      try {
        await triggerNotification({
          brandPartnerId: post.brandPartnerId,
          type: 'NEEDS_APPROVAL',
          message: `Admin requested approval for post "${post.title}"`,
          actor: auth.email,
          postId: post.id,
          postTitle: post.title,
        })
      } catch (e) {
        console.error('[admin/posts] needs-approval notification failed:', e)
      }
    } else {
      // General update / reschedule activity
      try {
        let updateMsg = `Admin updated details for post "${post.title}"`
        if (patch.scheduledDate && patch.scheduledDate.getTime() !== existing.scheduledDate.getTime()) {
          const dateStr = new Date(post.scheduledDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          updateMsg = `Admin rescheduled post "${post.title}" to ${dateStr}`
        }
        await triggerNotification({
          brandPartnerId: post.brandPartnerId,
          type: 'CALENDAR_UPDATED',
          message: updateMsg,
          actor: auth.email,
          postId: post.id,
          postTitle: post.title,
        })
      } catch (e) {
        console.error('[admin/posts] calendar-updated notification failed:', e)
      }
    }

    return NextResponse.json({ post })
  } catch (err: unknown) {
    if (err instanceof PostValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[admin/posts PATCH]', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Update failed' },
      { status: 500 },
    )
  }
}

// DELETE — archive (soft delete). Use PATCH archivedAt=null to restore.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ clientSlug: string; postId: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug, postId } = await params
  const existing = await findPost(clientSlug, postId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const post = await archivePost(postId)
  return NextResponse.json({ post })
}
