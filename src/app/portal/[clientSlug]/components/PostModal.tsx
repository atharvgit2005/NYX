'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
  viewerIsAdmin: boolean
  partnerSlug: string
  onClose: () => void
  onPostMutated?: (updated: SerializedPost) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const COMMENT_TYPE_LABEL: Record<SerializedPost['comments'][number]['type'], string> = {
  REVISION_REQUEST: 'Revision requested',
  APPROVAL_NOTE: 'Approved',
  INTERNAL_ADMIN: 'Internal note',
}

export default function PostModal({
  post,
  brand,
  viewerIsAdmin,
  partnerSlug,
  onClose,
  onPostMutated,
}: Props) {
  const typeColors = TYPE_COLORS[post.contentType]
  const gradient = TYPE_GRADIENTS[post.contentType]
  const statusColors = STATUS_COLORS[post.status]

  const [revising, setRevising] = useState(false)
  const [revisionText, setRevisionText] = useState('')
  const [busy, setBusy] = useState(false)

  // Approval / revision UI shows ONLY when:
  //   • the post is awaiting client review (NEEDS_APPROVAL), and
  //   • the viewer is the brand partner (admin preview hides it)
  const canActOnApproval = !viewerIsAdmin && post.status === 'NEEDS_APPROVAL'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function approve() {
    setBusy(true)
    try {
      const res = await fetch(
        `/api/portal/${partnerSlug}/posts/${post.id}/approve`,
        { method: 'POST' },
      )
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Approve failed' }))
        toast.error(error)
        return
      }
      const { post: updated } = await res.json()
      toast.success('Approved')
      onPostMutated?.(updated)
    } finally {
      setBusy(false)
    }
  }

  async function submitRevision() {
    if (!revisionText.trim()) {
      toast.error('Tell us what needs to change')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(
        `/api/portal/${partnerSlug}/posts/${post.id}/request-revision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: revisionText }),
        },
      )
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
        toast.error(error)
        return
      }
      const { post: updated } = await res.json()
      toast.success('Revision requested')
      setRevising(false)
      setRevisionText('')
      onPostMutated?.(updated)
    } finally {
      setBusy(false)
    }
  }

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
          animation: 'portalModalSlide 0.3s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: 'var(--font-portal-body)',
        }}
      >
        <div className="h-1.5 rounded-t-3xl md:rounded-t-2xl" style={{ background: gradient }} />

        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: '#E8E4DC' }} />
        </div>

        <div className="px-6 pb-8 pt-4">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: typeColors.bg, color: typeColors.text }}
                >
                  {CONTENT_TYPE_LABEL[post.contentType]}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: '#FAF7F2',
                    color: '#6B6B6B',
                    border: '1px solid #E8E4DC',
                  }}
                >
                  Post #{post.position}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: statusColors.bg, color: statusColors.text }}
                >
                  {POST_STATUS_LABEL[post.status]}
                </span>
              </div>
              <h2
                className="text-xl font-bold leading-snug"
                style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
              >
                {post.title}
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                {formatDate(post.scheduledDate)}
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

          <div className="mb-5">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#6B6B6B' }}>
              Caption
            </p>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line"
              style={{
                background: '#FAF7F2',
                color: '#1A2A5E',
                border: '1px solid #E8E4DC',
              }}
            >
              {post.caption}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#6B6B6B' }}>
              Hashtags · {post.hashtags.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{
                    background: `${brand.brand.secondary}12`,
                    color: '#0078A8',
                    border: `1px solid ${brand.brand.secondary}30`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#6B6B6B' }}>
              Visual Direction
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#1A2A5E' }}>
              {post.visualDirection}
            </p>
          </div>

          {post.productionNotes && (
            <details
              className="rounded-xl p-4 group mb-5"
              style={{
                background: `${brand.brand.primary}08`,
                border: `1px solid ${brand.brand.primary}20`,
              }}
            >
              <summary
                className="text-xs tracking-widest uppercase cursor-pointer flex items-center justify-between"
                style={{ color: brand.brand.primary }}
              >
                Production Notes
                <span
                  className="text-base transition-transform group-open:rotate-45"
                  style={{ color: brand.brand.primary, lineHeight: 1 }}
                >
                  +
                </span>
              </summary>
              <p className="text-sm leading-relaxed mt-3" style={{ color: '#1A2A5E' }}>
                {post.productionNotes}
              </p>
            </details>
          )}

          {/* Revision history — visible whenever the post has comments. */}
          {post.comments.length > 0 && (
            <div className="mb-5">
              <p
                className="text-xs tracking-widest uppercase mb-2"
                style={{ color: '#6B6B6B' }}
              >
                Revision History · {post.comments.length}
              </p>
              <div className="space-y-2">
                {post.comments.map((c) => {
                  const accent =
                    c.type === 'REVISION_REQUEST'
                      ? brand.brand.primary
                      : c.type === 'APPROVAL_NOTE'
                        ? '#0E9F5E'
                        : '#6B6B6B'
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl p-3 text-sm"
                      style={{
                        background: '#FAF7F2',
                        border: `1px solid ${accent}30`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: accent }}
                        >
                          {COMMENT_TYPE_LABEL[c.type]}
                        </span>
                        <span className="text-[11px]" style={{ color: '#6B6B6B' }}>
                          {formatStamp(c.createdAt)}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line" style={{ color: '#1A2A5E' }}>
                        {c.body}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: '#6B6B6B' }}>
                        — {c.authorEmail}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Approval action panel — shown ONLY for the brand partner when
              the post is currently awaiting approval. */}
          {canActOnApproval && !revising && (
            <div
              className="mt-6 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
              style={{
                background: `${brand.brand.primary}10`,
                border: `1px solid ${brand.brand.primary}30`,
              }}
            >
              <div className="text-sm" style={{ color: '#1A2A5E' }}>
                <span className="font-semibold">Awaiting your approval.</span>
                <span style={{ color: '#6B6B6B' }}> Approve to lock for production, or request a revision.</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRevising(true)}
                  disabled={busy}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: '#FFFFFF',
                    color: '#1A2A5E',
                    border: '1px solid #E8E4DC',
                  }}
                >
                  Request revision
                </button>
                <button
                  type="button"
                  onClick={approve}
                  disabled={busy}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{
                    background: brand.brand.primary,
                    color: '#FFFFFF',
                  }}
                >
                  {busy ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </div>
          )}

          {canActOnApproval && revising && (
            <div
              className="mt-6 rounded-xl p-4"
              style={{
                background: `${brand.brand.primary}08`,
                border: `1px solid ${brand.brand.primary}30`,
              }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: '#1A2A5E' }}>
                What needs to change?
              </p>
              <textarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm leading-relaxed"
                style={{
                  background: '#FFFFFF',
                  color: '#1A2A5E',
                  border: '1px solid #E8E4DC',
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="Quick notes for the team — copy edits, visual changes, scheduling…"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setRevising(false)
                    setRevisionText('')
                  }}
                  disabled={busy}
                  className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
                  style={{
                    background: '#FFFFFF',
                    color: '#1A2A5E',
                    border: '1px solid #E8E4DC',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRevision}
                  disabled={busy || !revisionText.trim()}
                  className="px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
                  style={{
                    background: brand.brand.primary,
                    color: '#FFFFFF',
                  }}
                >
                  {busy ? 'Sending…' : 'Send revision request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes portalModalSlide {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
