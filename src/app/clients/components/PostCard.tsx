'use client'

import { Post, ClientConfig, TYPE_COLORS, TYPE_GRADIENTS } from '../types'

interface Props {
  post: Post
  config: ClientConfig
  onClick: () => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Idea: { bg: '#FFF9E6', text: '#B8860B' },
  Drafting: { bg: '#E8F4FF', text: '#0066CC' },
  'Needs Approval': { bg: '#FFF3E0', text: '#E65100' },
  'Needs Revision': { bg: '#FCE4EC', text: '#C62828' },
  Approved: { bg: '#E8F5E9', text: '#2E7D32' },
  Posted: { bg: '#F3E5F5', text: '#6A1B9A' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function PostCard({ post, config, onClick }: Props) {
  const typeColors = TYPE_COLORS[post.type] ?? TYPE_COLORS['Reel']
  const gradient = TYPE_GRADIENTS[post.type] ?? TYPE_GRADIENTS['Reel']
  const statusColors = STATUS_COLORS[post.status] ?? STATUS_COLORS['Idea']

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden group transition-all"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DC',
        boxShadow: '0 2px 8px rgba(26,42,94,0.04)',
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
      {/* Top color bar */}
      <div className="h-1" style={{ background: gradient }} />

      <div className="p-5">
        {/* Date + type + status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: '#FAF7F2',
              color: '#6B6B6B',
              border: '1px solid #E8E4DC',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {formatDate(post.date)}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: typeColors.bg, color: typeColors.text, fontFamily: 'var(--font-inter)' }}
            >
              {post.type}
            </span>
          </div>
        </div>

        {/* Post number */}
        <p
          className="text-xs mb-1"
          style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
        >
          Post #{post.id}
        </p>

        {/* Title */}
        <h3
          className="text-base font-bold leading-snug mb-3"
          style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
        >
          {post.title}
        </h3>

        {/* Caption preview */}
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-3"
          style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
        >
          {post.caption.split('\n')[0]}
        </p>

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: statusColors.bg,
              color: statusColors.text,
              fontFamily: 'var(--font-inter)',
            }}
          >
            {post.status}
          </span>
          <span
            className="text-xs flex items-center gap-1 transition-all group-hover:gap-1.5"
            style={{ color: config.brand.primary, fontFamily: 'var(--font-inter)' }}
          >
            View details →
          </span>
        </div>
      </div>
    </button>
  )
}
