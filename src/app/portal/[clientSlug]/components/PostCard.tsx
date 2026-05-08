'use client'

import {
  CONTENT_TYPE_LABEL,
  POST_STATUS_LABEL,
  TYPE_COLORS,
  TYPE_GRADIENTS,
  STATUS_COLORS,
} from '@/lib/portal/content-types'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
  post: SerializedPost
  brand: BrandConfig
  onClick: () => void
  /** When true, render a hover-only pencil overlay so admin knows the
   *  click opens the editor (not the read-only modal). */
  viewerIsAdmin?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export default function PostCard({ post, brand, onClick, viewerIsAdmin }: Props) {
  const typeColors = TYPE_COLORS[post.contentType]
  const gradient = TYPE_GRADIENTS[post.contentType]
  const statusColors = STATUS_COLORS[post.status]

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden group transition-all relative"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DC',
        boxShadow: '0 2px 8px rgba(26,42,94,0.04)',
        fontFamily: 'var(--font-portal-body)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = '0 8px 32px rgba(26,42,94,0.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 2px 8px rgba(26,42,94,0.04)'
      }}
    >
      <div className="h-1" style={{ background: gradient }} />

      {/* Admin-only edit affordance — pencil chip top-right, hover-revealed.
          Shown over the card body, doesn't intercept clicks (the whole card
          is one button anyway). */}
      {viewerIsAdmin && (
        <div
          aria-hidden
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${brand.brand.primary}30`,
            color: brand.brand.primary,
            boxShadow: '0 2px 8px rgba(26,42,94,0.08)',
            zIndex: 5,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase">
            Edit
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: '#FAF7F2',
              color: '#6B6B6B',
              border: '1px solid #E8E4DC',
            }}
          >
            {formatDate(post.scheduledDate)}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: typeColors.bg, color: typeColors.text }}
          >
            {CONTENT_TYPE_LABEL[post.contentType]}
          </span>
        </div>

        <p className="text-xs mb-1" style={{ color: '#6B6B6B' }}>
          Post #{post.position}
        </p>

        <h3
          className="text-base font-bold leading-snug mb-3"
          style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
        >
          {post.title}
        </h3>

        <p
          className="text-sm leading-relaxed mb-4"
          style={{
            color: '#6B6B6B',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.caption.split('\n')[0]}
        </p>

        <div className="flex items-center justify-between">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: statusColors.bg, color: statusColors.text }}
          >
            {POST_STATUS_LABEL[post.status]}
          </span>
          <span
            className="text-xs flex items-center gap-1 transition-all group-hover:gap-1.5"
            style={{ color: brand.brand.primary }}
          >
            View details →
          </span>
        </div>
      </div>
    </button>
  )
}
