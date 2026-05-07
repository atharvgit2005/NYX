'use client'

import { useEffect } from 'react'
import { Post, ClientConfig, TYPE_COLORS, TYPE_GRADIENTS } from '../types'

interface Props {
  post: Post
  config: ClientConfig
  onClose: () => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PostModal({ post, config, onClose }: Props) {
  const colors = TYPE_COLORS[post.type] ?? TYPE_COLORS['Reel']
  const gradient = TYPE_GRADIENTS[post.type] ?? TYPE_GRADIENTS['Reel']

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(26,42,94,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 24px 80px rgba(26,42,94,0.2)',
          animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Color header bar */}
        <div
          className="h-1.5 rounded-t-3xl md:rounded-t-2xl"
          style={{ background: gradient }}
        />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: '#E8E4DC' }} />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: colors.bg, color: colors.text, fontFamily: 'var(--font-inter)' }}
                >
                  {post.type}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: '#FAF7F2',
                    color: '#6B6B6B',
                    border: '1px solid #E8E4DC',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Post #{post.id}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: '#FAF7F2',
                    color: '#6B6B6B',
                    border: '1px solid #E8E4DC',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {post.status}
                </span>
              </div>
              <h2
                className="text-xl font-bold leading-snug"
                style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
              >
                {post.title}
              </h2>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
              >
                {formatDate(post.date)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#FAF7F2', color: '#6B6B6B' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E8E4DC')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#FAF7F2')}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Caption */}
          <div className="mb-5">
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              Caption
            </p>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line"
              style={{
                background: '#FAF7F2',
                fontFamily: 'var(--font-inter)',
                color: '#1A2A5E',
                border: '1px solid #E8E4DC',
              }}
            >
              {post.caption}
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-5">
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              Hashtags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: `${config.brand.secondary}12`,
                    color: '#0078A8',
                    fontFamily: 'var(--font-inter)',
                    border: `1px solid ${config.brand.secondary}30`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Visual Direction */}
          <div className="mb-5">
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              Visual Direction
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
            >
              {post.visualDirection}
            </p>
          </div>

          {/* Production Notes */}
          <div
            className="rounded-xl p-4"
            style={{
              background: `${config.brand.primary}08`,
              border: `1px solid ${config.brand.primary}20`,
            }}
          >
            <p
              className="text-xs tracking-widest uppercase mb-1.5"
              style={{ fontFamily: 'var(--font-inter)', color: config.brand.primary }}
            >
              Production Notes
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
            >
              {post.productionNotes}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
