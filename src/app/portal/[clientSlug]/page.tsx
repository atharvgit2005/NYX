import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { findApprovedClient, listAllBrandPartners } from '@/lib/config/clients-store'
import { getBrandConfig } from '@/lib/portal/brand-config'
import { getContentPosts, getPostStatusCounts } from '@/lib/portal/content-store'
import { isViewerOfSlug } from '@/lib/portal/viewer-store'
import BrandPartnerPortalClient from './components/BrandPartnerPortalClient'
import type { SerializedPost } from './components/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Brand Partner Portal',
  robots: { index: false, follow: false },
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect(
      '/portal/login?callbackUrl=' + encodeURIComponent(`/portal/${clientSlug}`),
    )
  }

  const email = session.user.email
  const viewerIsAdmin = isAdminEmail(email)
  let viewerIsViewerOnly = false

  // Auth gating
  if (!viewerIsAdmin) {
    const approved = await findApprovedClient(email)
    if (approved) {
      // Brand partner — can only see their own slug.
      if (approved.clientSlug !== clientSlug) {
        redirect(`/portal/${approved.clientSlug}`)
      }
    } else {
      // Not the brand partner — check viewer access for THIS slug.
      const allowed = await isViewerOfSlug(email, clientSlug)
      if (!allowed) {
        redirect('/portal')
      }
      viewerIsViewerOnly = true
    }
  }

  // Resolve the partner row (admin can view any slug)
  const partners = await listAllBrandPartners()
  const partner = partners.find((p) => p.clientSlug === clientSlug)
  if (!partner) {
    // Slug exists in URL but not in DB — bounce admin home, redirect partner
    if (viewerIsAdmin) redirect('/portal/admin')
    redirect('/portal')
  }

  // Brand visual config (colours, Pack B, agency block) — code-side
  const brand = await getBrandConfig(clientSlug)
  if (!brand) {
    // No brand config registered yet — fall through to a graceful message
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#FAF7F2', fontFamily: 'sans-serif' }}
      >
        <div
          className="max-w-lg rounded-2xl p-8 text-center"
          style={{ background: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: '#E91E8C' }}
          >
            Portal · Configuration pending
          </p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A2A5E' }}>
            {partner.clientName}
          </h1>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            This brand partner is approved but a portal theme hasn&rsquo;t been registered yet.
            Add <code>src/lib/portal/brands/{clientSlug}.ts</code> and register it in{' '}
            <code>brand-config.ts</code> to unlock the calendar.
          </p>
        </div>
      </main>
    )
  }

  // Fetch posts + status counts in parallel
  const [posts, statusCounts] = await Promise.all([
    getContentPosts(partner.id),
    getPostStatusCounts(partner.id),
  ])

  const serialised: SerializedPost[] = posts.map((p) => ({
    id: p.id,
    brandPartnerId: p.brandPartnerId,
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
    mediaUrls: p.mediaUrls,
    position: p.position,
    archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
    comments: p.comments.map((c) => ({
      id: c.id,
      authorEmail: c.authorEmail,
      body: c.body,
      type: c.type,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <BrandPartnerPortalClient
      brand={brand}
      posts={serialised}
      statusCounts={statusCounts}
      signedInAs={{
        name: session.user.name ?? null,
        email,
      }}
      viewerIsAdmin={viewerIsAdmin}
      viewerIsViewerOnly={viewerIsViewerOnly}
    />
  )
}
