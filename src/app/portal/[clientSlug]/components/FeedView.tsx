'use client'

import {
  CONTENT_TYPE_LABEL,
  TYPE_GRADIENTS,
  TYPE_ICONS,
} from '@/lib/portal/content-types'
import type { ContentType } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
  posts: SerializedPost[]
  brand: BrandConfig
  onSelectPost: (post: SerializedPost) => void
  /** When true, each tile shows a subtle hover indicator that the click
   *  opens the editor. No drag, no + add — calendar is the create surface
   *  per the Phase 5 spec; the IG-grid stays rigid by design. */
  viewerIsAdmin?: boolean
}

/**
 * Renders an Instagram-feed mockup:
 * - 3-column grid, newest first (matches IG behaviour)
 * - Pads to a multiple of 3 with "coming soon" placeholders
 */
export default function FeedView({
  posts,
  brand,
  onSelectPost,
  viewerIsAdmin,
}: Props) {
  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  )

  const padTo = Math.max(9, Math.ceil(sorted.length / 3) * 3)
  const cells: (SerializedPost | null)[] = [
    ...sorted,
    ...Array.from({ length: padTo - sorted.length }, () => null),
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Faux IG profile bar */}
      <div
        className="w-full max-w-md rounded-t-2xl flex items-center gap-3 px-4 py-3"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E4DC',
          borderBottom: '1px solid #F0EDE6',
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${brand.brand.primary}, ${brand.brand.secondary})`,
          }}
        >
          {brand.client.avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: '#1A2A5E' }}>
            {brand.client.socialHandle.replace('@', '')}
          </p>
          <p className="text-xs truncate" style={{ color: '#6B6B6B' }}>
            {brand.client.tagline}
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
          style={{
            background: `${brand.brand.primary}10`,
            color: brand.brand.primary,
          }}
        >
          Preview
        </span>
      </div>

      {/* 3-col grid */}
      <div
        className="w-full max-w-md grid grid-cols-3 gap-0.5 rounded-b-2xl overflow-hidden"
        style={{ background: '#F0EDE6', border: '1px solid #E8E4DC', borderTop: 'none' }}
      >
        {cells.map((post, i) => {
          if (!post) {
            return (
              <div
                key={`empty-${i}`}
                className="aspect-square flex items-center justify-center"
                style={{ background: '#FFFFFF' }}
              >
                <div className="text-center">
                  <p className="text-xs mb-0.5" style={{ color: '#C0BAB0' }}>···</p>
                  <p
                    className="text-[9px]"
                    style={{ color: '#C0BAB0' }}
                  >
                    coming soon
                  </p>
                </div>
              </div>
            )
          }

          const gradient = TYPE_GRADIENTS[post.contentType]
          const icon = TYPE_ICONS[post.contentType]

          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="aspect-square relative group overflow-hidden"
              style={{ background: gradient }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.4)' }}
              >
                <p
                  className="text-white font-medium text-center leading-tight"
                  style={{ fontSize: '10px' }}
                >
                  {post.title.split('—')[0].trim()}
                </p>
                {viewerIsAdmin && (
                  <span
                    className="text-white text-center"
                    style={{
                      fontSize: '8px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      opacity: 0.85,
                    }}
                  >
                    Click to edit
                  </span>
                )}
              </div>
              <div className="absolute top-1.5 left-1.5">
                <span
                  className="text-white font-bold"
                  style={{
                    fontSize: '10px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}
                >
                  #{post.position}
                </span>
              </div>
              <div className="absolute top-1.5 right-1.5">
                <span
                  className="text-white"
                  style={{ fontSize: '10px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {icon}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {(Object.keys(TYPE_GRADIENTS) as ContentType[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: TYPE_GRADIENTS[type] }} />
            <span className="text-xs" style={{ color: '#6B6B6B' }}>
              {CONTENT_TYPE_LABEL[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
