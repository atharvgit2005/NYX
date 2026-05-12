'use client'

import { useEffect, useState } from 'react'
import { Archive as ArchiveIcon, RotateCcw, Trash2, X } from 'lucide-react'
import {
  CONTENT_TYPE_LABEL,
  POST_STATUS_LABEL,
  STATUS_COLORS,
  TYPE_COLORS,
} from '@/lib/portal/content-types'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
  open: boolean
  brand: BrandConfig
  /** Loader — lazily fetched the first time the drawer opens AND every
   *  reopen, so the list always reflects current archive state. */
  fetchArchived: () => Promise<SerializedPost[]>
  /** Restore a post out of the archive into the active set. Returns
   *  truthy on success so the drawer can pull it from local state. */
  onRestore: (id: string) => Promise<SerializedPost | null>
  /** Permanently delete from the archive — irreversible. */
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

function formatArchivedAt(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatScheduled(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default function ArchiveDrawer({
  open,
  brand,
  fetchArchived,
  onRestore,
  onDelete,
  onClose,
}: Props) {
  const [items, setItems] = useState<SerializedPost[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Refetch each time the drawer is opened. The list is small enough
  // that a fresh GET is cheaper than a subscription / cache invalidation.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    fetchArchived().then((rows) => {
      if (cancelled) return
      setItems(rows)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [open, fetchArchived])

  // ESC to close + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  async function handleRestore(id: string) {
    setBusyId(id)
    const result = await onRestore(id)
    if (result) {
      setItems((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))
    }
    setBusyId(null)
  }

  async function handleDelete(id: string, title: string) {
    if (
      !confirm(
        `Delete "${title}" permanently? This removes the post, its comments, and approval history. This cannot be undone.`,
      )
    ) {
      return
    }
    setBusyId(id)
    await onDelete(id)
    setItems((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))
    setBusyId(null)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{ background: 'rgba(26,42,94,0.5)' }}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] flex flex-col"
        style={{
          background: '#FFFFFF',
          borderLeft: '1px solid #E8E4DC',
          boxShadow: '-24px 0 80px rgba(26,42,94,0.18)',
          fontFamily: 'var(--font-portal-body)',
          color: '#1A2A5E',
          animation: 'archiveDrawerIn 0.25s ease both',
        }}
        role="dialog"
        aria-label="Archive"
      >
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #E8E4DC' }}
        >
          <div className="flex items-center gap-2.5">
            <ArchiveIcon
              className="w-4 h-4"
              style={{ color: brand.brand.primary }}
              aria-hidden
            />
            <div>
              <h2
                className="text-lg font-bold leading-tight"
                style={{ fontFamily: 'var(--font-portal-display)' }}
              >
                Archive
              </h2>
              <p className="text-xs" style={{ color: '#6B6B6B' }}>
                {items === null
                  ? 'Loading…'
                  : items.length === 0
                    ? 'Nothing archived yet'
                    : `${items.length} archived post${items.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: '#FAF7F2', color: '#6B6B6B' }}
            aria-label="Close archive"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              Loading archived posts…
            </p>
          )}
          {!loading && items !== null && items.length === 0 && (
            <div
              className="rounded-2xl px-5 py-10 text-center"
              style={{
                background: '#FAF7F2',
                border: '1px dashed #E8E4DC',
                color: '#6B6B6B',
              }}
            >
              <ArchiveIcon
                className="w-6 h-6 mx-auto mb-3 opacity-50"
                aria-hidden
              />
              <p className="text-sm font-medium">No archived posts</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                When you archive a post, it lands here. Restore it to bring it
                back into the active calendar.
              </p>
            </div>
          )}
          {!loading &&
            items?.map((post) => {
              const typeColors = TYPE_COLORS[post.contentType]
              const statusColors = STATUS_COLORS[post.status]
              const isBusy = busyId === post.id
              return (
                <article
                  key={post.id}
                  className="rounded-2xl p-4 transition-opacity"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E4DC',
                    borderLeft: `4px solid ${typeColors.dot}`,
                    opacity: isBusy ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3
                      className="text-sm font-bold leading-snug flex-1"
                      style={{
                        fontFamily: 'var(--font-portal-display)',
                        color: '#1A2A5E',
                      }}
                    >
                      {post.title}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                      style={{
                        background: typeColors.bg,
                        color: typeColors.text,
                      }}
                    >
                      {CONTENT_TYPE_LABEL[post.contentType]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] mb-3" style={{ color: '#6B6B6B' }}>
                    <span>Scheduled {formatScheduled(post.scheduledDate)}</span>
                    <span
                      className="inline-flex items-center gap-1.5"
                      title={`Status when archived: ${POST_STATUS_LABEL[post.status]}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: statusColors.dot }}
                      />
                      {POST_STATUS_LABEL[post.status]}
                    </span>
                    <span>Archived {formatArchivedAt(post.archivedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(post.id)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                      style={{
                        background: '#FAF7F2',
                        border: '1px solid #E8E4DC',
                        color: '#1A2A5E',
                      }}
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#7F1D1D' }}
                      title="Permanently delete — comments and approval history go with it"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
        </div>
      </aside>
      <style>{`
        @keyframes archiveDrawerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
