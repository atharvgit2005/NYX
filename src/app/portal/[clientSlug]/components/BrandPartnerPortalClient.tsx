'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from 'sonner'
import { Calendar, Download, LayoutGrid, Grid3x3, type LucideIcon } from 'lucide-react'
import type { ContentType, PostStatus } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'
import PortalHeader from './PortalHeader'
import StatStrip from './StatStrip'
import CalendarView from './CalendarView'
import CardsView from './CardsView'
import FeedView from './FeedView'
import PostModal from './PostModal'
import StatusTrackerSection from './StatusTrackerSection'
import PackBSection from './PackBSection'
import PortalFooter from './PortalFooter'
import { useAdminPostMutations } from './useAdminPostMutations'
import type { Platform } from '@prisma/client'

// Lazy-mount the admin overlay so the partner bundle doesn't pull
// PostFormModal / ThumbnailUploader / @vercel/blob client. ssr:false
// means it's only fetched when an admin actually opens the edit modal.
const AdminEditOverlay = dynamic(() => import('./AdminEditOverlay'), {
  ssr: false,
})

type View = 'calendar' | 'cards' | 'feed'

interface Props {
  brand: BrandConfig
  posts: SerializedPost[]
  statusCounts: Record<PostStatus, number>
  signedInAs: { name: string | null; email: string }
  viewerIsAdmin: boolean
  /** Read-only PortalViewer guest. Same canvas as the partner sees, but
   *  the approve/revise panel is suppressed and no admin overlay loads. */
  viewerIsViewerOnly?: boolean
}

const VIEW_OPTIONS: { value: View; label: string; Icon: LucideIcon }[] = [
  { value: 'calendar', label: 'Calendar', Icon: Calendar },
  { value: 'cards', label: 'Cards', Icon: LayoutGrid },
  { value: 'feed', label: 'Feed Preview', Icon: Grid3x3 },
]

export default function BrandPartnerPortalClient({
  brand,
  posts: initialPosts,
  statusCounts: initialCounts,
  signedInAs,
  viewerIsAdmin: realViewerIsAdmin,
  viewerIsViewerOnly,
}: Props) {
  // Phase 5 follow-up: admins can toggle "view as partner" to preview
  // exactly what the brand partner sees. Persist in sessionStorage so
  // refresh keeps the mode; never persist across browser tabs/windows.
  const [previewAsPartner, setPreviewAsPartner] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setPreviewAsPartner(sessionStorage.getItem('nyx-preview-partner') === '1')
  }, [])
  function togglePreviewMode() {
    setPreviewAsPartner((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nyx-preview-partner', next ? '1' : '0')
      }
      return next
    })
  }
  // Effective admin flag — what child components see. Real admin status
  // (`realViewerIsAdmin`) only flows to the PortalHeader so it can render
  // the toggle even while previewing.
  const viewerIsAdmin = realViewerIsAdmin && !previewAsPartner

  const [view, setView] = useState<View>('calendar')
  const [posts, setPosts] = useState<SerializedPost[]>(initialPosts)
  const [selectedPost, setSelectedPost] = useState<SerializedPost | null>(null)

  // Status counts derive from posts so any mutation (modal approve/revise,
  // admin canvas drag/edit/archive) propagates without an extra setter.
  // Initial server-rendered counts are used only to detect first paint.
  const statusCounts = useMemo<Record<PostStatus, number>>(() => {
    const c: Record<PostStatus, number> = {
      IDEA: 0,
      DRAFTING: 0,
      NEEDS_APPROVAL: 0,
      NEEDS_REVISION: 0,
      APPROVED: 0,
      POSTED: 0,
    }
    for (const p of posts) c[p.status]++
    return c
  }, [posts])
  void initialCounts // server-rendered baseline; not read after hydration

  // ── Phase 5: admin-only edit overlay state ─────────────────────────
  // Both null on the partner side and the dynamic AdminEditOverlay
  // renders nothing. Step 3 wires Calendar / Cards / Feed views to flip
  // these into non-null when admin clicks/drags.
  const [editing, setEditing] = useState<SerializedPost | null>(null)
  const [creating, setCreating] = useState<{ scheduledDate?: string } | null>(
    null,
  )

  const mutations = useAdminPostMutations({
    clientSlug: brand.slug,
    posts,
    setPosts,
  })

  // Brand's primary platform for the create form. Reads the canonical
  // platforms[] array; falls back to INSTAGRAM only if the brand was
  // somehow saved with no platforms (legacy / migration safety).
  const defaultPlatform: Platform = brand.campaign.platforms[0] ?? 'INSTAGRAM'

  // Click on a chip — admin opens the editor, partner opens read-only.
  function handleSelectPost(post: SerializedPost) {
    if (viewerIsAdmin) {
      setEditing(post)
    } else {
      setSelectedPost(post)
    }
  }

  function applyPostUpdate(updated: SerializedPost) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedPost(updated)
  }

  const typeCounts = useMemo(() => {
    const c: Record<ContentType, number> = {
      REEL: 0,
      CAROUSEL: 0,
      STATIC_POST: 0,
      STORY: 0,
      REEL_STORY: 0,
    }
    for (const p of posts) c[p.contentType]++
    return c
  }, [posts])

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#FAF7F2',
        color: '#1A2A5E',
        fontFamily: 'var(--font-portal-body)',
      }}
    >
      <Toaster position="top-right" richColors />
      <PortalHeader
        brand={brand}
        signedInAs={signedInAs}
        viewerIsAdmin={viewerIsAdmin}
        viewerIsViewerOnly={viewerIsViewerOnly}
        realViewerIsAdmin={realViewerIsAdmin}
        previewAsPartner={previewAsPartner}
        onTogglePreviewMode={togglePreviewMode}
      />

      <main className="max-w-6xl mx-auto px-6 py-10 md:py-14 space-y-10">
        {/* Hero */}
        <section style={{ animation: 'portalFadeIn 0.5s ease both' }}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
              style={{ background: `${brand.brand.primary}15`, color: brand.brand.primary }}
            >
              {brand.campaign.platform}
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
              style={{ background: `${brand.brand.secondary}15`, color: '#0078A8' }}
            >
              {brand.campaign.title}
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
          >
            {brand.client.name}
            <span style={{ color: brand.brand.primary }}> ×</span> {brand.agency.name}
          </h1>
          <p
            className="text-lg md:text-2xl mt-1 italic"
            style={{ fontFamily: 'var(--font-portal-display)', color: '#6B6B6B' }}
          >
            Content Calendar — {brand.campaign.monthLabel}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: brand.brand.primary }}
            />
            <span className="text-sm font-medium" style={{ color: '#6B6B6B' }}>
              Trial Period · {brand.campaign.period}
            </span>
          </div>
        </section>

        {/* Stat strip */}
        <section style={{ animation: 'portalFadeIn 0.5s ease 0.1s both' }}>
          <StatStrip brand={brand} totalPosts={posts.length} typeCounts={typeCounts} />
        </section>

        {/* View toggle */}
        <section style={{ animation: 'portalFadeIn 0.5s ease 0.2s both' }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
              >
                Content Planner
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                {brand.campaign.monthLabel} · {posts.length} post
                {posts.length === 1 ? '' : 's'} scheduled
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Export to calendar — available to everyone who can see
                  this brand: partner, admin, or read-only viewer. */}
              <a
                href={`/api/portal/${brand.slug}/calendar.ics`}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
                style={{
                  background: '#FFFFFF',
                  color: '#6B6B6B',
                  border: '1px solid #E8E4DC',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = '#F0EDE6'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                }}
                title="Subscribe in Google Calendar / Apple Calendar / Outlook"
              >
                <Download className="w-3.5 h-3.5" aria-hidden />
                <span className="hidden sm:inline">Export</span>
              </a>
              {viewerIsAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    const pad = (n: number) => String(n).padStart(2, '0')
                    const iso = `${today.getFullYear()}-${pad(
                      today.getMonth() + 1,
                    )}-${pad(today.getDate())}T00:00:00.000Z`
                    setCreating({ scheduledDate: iso })
                  }}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: brand.brand.primary }}
                >
                  <span aria-hidden className="text-base leading-none">
                    +
                  </span>
                  <span>New post</span>
                </button>
              )}
              <div
                className="flex rounded-full overflow-hidden"
                style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
              >
                {VIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setView(opt.value)}
                    className="px-4 sm:px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-1.5"
                    style={{
                      background: view === opt.value ? '#1A2A5E' : 'transparent',
                      color: view === opt.value ? '#FFFFFF' : '#6B6B6B',
                    }}
                  >
                    <opt.Icon className="w-4 h-4" aria-hidden />
                    <span className="hidden sm:inline">{opt.label}</span>
                    <span className="sm:hidden">{opt.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div key={view} style={{ animation: 'portalViewIn 0.3s ease both' }}>
            {view === 'calendar' && (
              <CalendarView
                posts={posts}
                brand={brand}
                onSelectPost={handleSelectPost}
                viewerIsAdmin={viewerIsAdmin}
                onEditPost={(post) => setEditing(post)}
                onCreateOnDay={(isoDate) =>
                  setCreating({ scheduledDate: isoDate + 'T00:00:00.000Z' })
                }
                onMoveDate={mutations.moveToDate}
              />
            )}
            {view === 'cards' && (
              <CardsView
                posts={posts}
                brand={brand}
                onSelectPost={handleSelectPost}
                viewerIsAdmin={viewerIsAdmin}
              />
            )}
            {view === 'feed' && (
              <FeedView
                posts={posts}
                brand={brand}
                onSelectPost={handleSelectPost}
                viewerIsAdmin={viewerIsAdmin}
              />
            )}
          </div>
        </section>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.3s both' }}>
          <StatusTrackerSection brand={brand} statusCounts={statusCounts} totalPosts={posts.length} />
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.35s both' }}>
          <PackBSection brand={brand} />
        </div>
      </main>

      <PortalFooter brand={brand} />

      {selectedPost && (
        <PostModal
          post={selectedPost}
          brand={brand}
          viewerIsAdmin={viewerIsAdmin}
          viewerIsViewerOnly={viewerIsViewerOnly}
          partnerSlug={brand.slug}
          onClose={() => setSelectedPost(null)}
          onPostMutated={applyPostUpdate}
        />
      )}

      {viewerIsAdmin && (
        <AdminEditOverlay
          defaultPlatform={defaultPlatform}
          editing={editing}
          creating={creating}
          onCloseEdit={() => setEditing(null)}
          onCloseCreate={() => setCreating(null)}
          onSave={async (id, values) => {
            const result = await mutations.savePost(id, {
              title: values.title,
              scheduledDate: values.scheduledDate,
              contentType: values.contentType,
              platform: values.platform,
              caption: values.caption,
              hashtags: values.hashtags,
              visualDirection: values.visualDirection,
              productionNotes: values.productionNotes,
              thumbnailUrl: values.thumbnailUrl,
              status: values.status,
            })
            if (result) setEditing(null)
          }}
          onCreate={async (values) => {
            const result = await mutations.createPost({
              title: values.title,
              scheduledDate: values.scheduledDate,
              contentType: values.contentType,
              platform: values.platform,
              caption: values.caption,
              hashtags: values.hashtags,
              visualDirection: values.visualDirection,
              productionNotes: values.productionNotes,
              thumbnailUrl: values.thumbnailUrl,
            })
            if (result) setCreating(null)
          }}
          onArchive={async (id) => {
            await mutations.archivePost(id)
            setEditing(null)
          }}
          onDuplicate={async (id) => {
            await mutations.duplicatePost(id)
            setEditing(null)
          }}
        />
      )}

      <style>{`
        @keyframes portalFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes portalViewIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
