import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { getBrandPartnerWithConfigBySlug } from '@/lib/portal/brand-store'
import { listPostsForAdmin } from '@/lib/portal/post-mutations'
import PostsWorkspaceClient, { type AdminPost } from './PostsWorkspaceClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Content workspace · Portal Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/portal/login')
  }
  if (!isAdminEmail(session.user.email)) {
    redirect('/portal')
  }

  const { clientSlug } = await params
  const partner = await getBrandPartnerWithConfigBySlug(clientSlug)
  if (!partner) notFound()

  const posts = await listPostsForAdmin(partner.id, false)

  const serialized: AdminPost[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    scheduledDate: p.scheduledDate.toISOString(),
    contentType: p.contentType,
    platform: p.platform,
    status: p.status,
    caption: p.caption,
    hashtags: p.hashtags,
    visualDirection: p.visualDirection,
    productionNotes: p.productionNotes,
    thumbnailUrl: p.thumbnailUrl,
    position: p.position,
    archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
    comments: p.comments.map((c) => ({
      id: c.id,
      authorEmail: c.authorEmail,
      body: c.body,
      type: c.type,
      createdAt: c.createdAt.toISOString(),
    })),
  }))

  return (
    <PostsWorkspaceClient
      clientSlug={partner.clientSlug}
      brandName={partner.configuration?.brandName ?? partner.clientName}
      brandColor={partner.configuration?.primaryColor ?? '#D83C14'}
      defaultPlatforms={partner.configuration?.platforms ?? ['INSTAGRAM']}
      initialPosts={serialized}
    />
  )
}
