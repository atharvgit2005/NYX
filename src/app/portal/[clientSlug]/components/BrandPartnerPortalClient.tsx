'use client'

import { useMemo, useState } from 'react'
import { Toaster } from 'sonner'
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

type View = 'calendar' | 'cards' | 'feed'

interface Props {
  brand: BrandConfig
  posts: SerializedPost[]
  statusCounts: Record<PostStatus, number>
  signedInAs: { name: string | null; email: string }
  viewerIsAdmin: boolean
}

const VIEW_OPTIONS: { value: View; label: string; icon: string }[] = [
  { value: 'calendar', label: 'Calendar', icon: '📅' },
  { value: 'cards', label: 'Cards', icon: '🗂' },
  { value: 'feed', label: 'Feed Preview', icon: '◫' },
]

export default function BrandPartnerPortalClient({
  brand,
  posts: initialPosts,
  statusCounts: initialCounts,
  signedInAs,
  viewerIsAdmin,
}: Props) {
  const [view, setView] = useState<View>('calendar')
  const [posts, setPosts] = useState<SerializedPost[]>(initialPosts)
  const [statusCounts, setStatusCounts] =
    useState<Record<PostStatus, number>>(initialCounts)
  const [selectedPost, setSelectedPost] = useState<SerializedPost | null>(null)

  function applyPostUpdate(updated: SerializedPost) {
    setPosts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p))
      // Recompute status counts from the new list.
      const counts: Record<PostStatus, number> = {
        IDEA: 0,
        DRAFTING: 0,
        NEEDS_APPROVAL: 0,
        NEEDS_REVISION: 0,
        APPROVED: 0,
        POSTED: 0,
      }
      for (const p of next) counts[p.status]++
      setStatusCounts(counts)
      return next
    })
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
      <PortalHeader brand={brand} signedInAs={signedInAs} viewerIsAdmin={viewerIsAdmin} />

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

            <div
              className="flex rounded-full overflow-hidden shrink-0"
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
                  <span aria-hidden>{opt.icon}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div key={view} style={{ animation: 'portalViewIn 0.3s ease both' }}>
            {view === 'calendar' && (
              <CalendarView posts={posts} brand={brand} onSelectPost={setSelectedPost} />
            )}
            {view === 'cards' && (
              <CardsView posts={posts} brand={brand} onSelectPost={setSelectedPost} />
            )}
            {view === 'feed' && (
              <FeedView posts={posts} brand={brand} onSelectPost={setSelectedPost} />
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
          partnerSlug={brand.slug}
          onClose={() => setSelectedPost(null)}
          onPostMutated={applyPostUpdate}
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
