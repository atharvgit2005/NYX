import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { hardDeletePost } from '@/lib/portal/post-mutations'
import { requireAdmin } from '../../../../_helpers'

// DELETE /api/portal/admin/[clientSlug]/posts/[postId]/permanent
//   Hard delete. The plain DELETE on the parent route does a soft archive
//   (sets archivedAt). This route is invoked from the archive drawer or
//   the "Delete permanently" button in the editor — both gate the call
//   behind an explicit confirm dialog. Comments and versions cascade.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ clientSlug: string; postId: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug, postId } = await params
  const existing = await prisma.contentPost.findFirst({
    where: { id: postId, brandPartner: { clientSlug } },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await hardDeletePost(postId)
  return NextResponse.json({ ok: true })
}
