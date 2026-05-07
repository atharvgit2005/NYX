'use client'

import { useEffect, useState } from 'react'
import type { ContentType, Platform, PostStatus } from '@prisma/client'
import ThumbnailUploader from '../../../components/ThumbnailUploader'
import type { AdminPost } from '../PostsWorkspaceClient'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export interface PostFormValues {
  title: string
  scheduledDate: string // ISO string (date+time)
  contentType: ContentType
  platform: Platform
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string | null
  thumbnailUrl: string | null
  status?: PostStatus // edit mode only
}

interface Props {
  mode: 'create' | 'edit'
  defaultPlatform: Platform
  initial?: AdminPost
  onClose: () => void
  onSubmit: (values: PostFormValues) => void | Promise<void>
  onArchive?: () => void
}

const CONTENT_TYPES: ContentType[] = ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY']
const PLATFORMS: Platform[] = ['INSTAGRAM', 'TIKTOK']
const STATUSES: PostStatus[] = [
  'IDEA',
  'DRAFTING',
  'NEEDS_APPROVAL',
  'NEEDS_REVISION',
  'APPROVED',
  'POSTED',
]

function dayOnly(iso: string): string {
  return iso.slice(0, 10)
}

export default function PostFormModal({
  mode,
  defaultPlatform,
  initial,
  onClose,
  onSubmit,
  onArchive,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [scheduledDate, setScheduledDate] = useState(
    initial ? dayOnly(initial.scheduledDate) : '',
  )
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? defaultPlatform)
  const [contentType, setContentType] = useState<ContentType>(initial?.contentType ?? 'STATIC_POST')
  const [caption, setCaption] = useState(initial?.caption ?? '')
  const [hashtagsRaw, setHashtagsRaw] = useState((initial?.hashtags ?? []).join(' '))
  const [visualDirection, setVisualDirection] = useState(initial?.visualDirection ?? '')
  const [productionNotes, setProductionNotes] = useState(initial?.productionNotes ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initial?.thumbnailUrl ?? null)
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? 'IDEA')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Close on ESC + lock body scroll while open.
  useEffect(() => {
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
  }, [onClose])

  function parseHashtags(input: string): string[] {
    return input
      .split(/[,\s]+/)
      .map((h) => h.trim().replace(/^#+/, ''))
      .filter(Boolean)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!title.trim()) return setErr('Title is required')
    if (!scheduledDate) return setErr('Scheduled date is required')
    if (!caption.trim()) return setErr('Caption is required')
    const hashtags = parseHashtags(hashtagsRaw)
    if (!hashtags.length) return setErr('At least one hashtag is required')
    if (!visualDirection.trim()) return setErr('Visual direction is required')

    const isoDate = new Date(scheduledDate + 'T00:00:00.000Z').toISOString()
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        scheduledDate: isoDate,
        contentType,
        platform,
        caption,
        hashtags,
        visualDirection,
        productionNotes: productionNotes.trim() || null,
        thumbnailUrl,
        status: mode === 'edit' ? status : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const heading = mode === 'create' ? '*NEW_POST' : '*EDIT_POST'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-2xl my-auto border-4 border-black shadow-[8px_8px_0px_#000] max-h-[95vh] overflow-y-auto"
        style={{ backgroundColor: '#1c1b1b', ...BODY }}
      >
        <div className="flex items-start justify-between p-5 border-b-4 border-black sticky top-0 z-10" style={{ backgroundColor: '#1c1b1b' }}>
          <div className="min-w-0">
            <div
              className="text-base font-black uppercase tracking-tighter text-[#e5e2e1]"
              style={HEAD}
            >
              {heading}
            </div>
            {initial && (
              <p className="text-xs text-[#e4beb5] mt-1 truncate font-mono">{initial.title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 w-8 h-8 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#E8441A] hover:text-white flex items-center justify-center transition shrink-0"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !text-sm" aria-hidden>
              close
            </span>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {err && (
            <div
              className="border-4 border-[#93000a] bg-[#93000a]/30 text-[#ffb4ab] px-4 py-3 text-xs tracking-widest"
              style={HEAD}
            >
              {err.toUpperCase()}
            </div>
          )}

          <Field label="*TITLE" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brand Intro — What is X?"
              className="brutal-input"
              style={HEAD}
              required
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="*SCHEDULED_DATE" required>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="brutal-input"
                style={HEAD}
                required
              />
            </Field>
            <Field label="*PLATFORM" required>
              <ChipGroup
                options={PLATFORMS.map((p) => [p, p])}
                value={platform}
                onChange={(v) => setPlatform(v as Platform)}
              />
            </Field>
          </div>

          <Field label="*CONTENT_TYPE" required>
            <ChipGroup
              options={CONTENT_TYPES.map((c) => [c, c.replace('_', ' ')])}
              value={contentType}
              onChange={(v) => setContentType(v as ContentType)}
            />
          </Field>

          <Field
            label="*CAPTION"
            hint={`${caption.length} / 2200 (Instagram cap)`}
            required
          >
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              maxLength={2200}
              className="brutal-input resize-none"
              style={BODY}
              placeholder="Hook · body · CTA…"
              required
            />
          </Field>

          <Field
            label="*HASHTAGS"
            hint="Comma- or space-separated. # is optional."
            required
          >
            <input
              value={hashtagsRaw}
              onChange={(e) => setHashtagsRaw(e.target.value)}
              placeholder="dessertino, shakes, pune"
              className="brutal-input font-mono"
              style={HEAD}
              required
            />
            {parseHashtags(hashtagsRaw).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {parseHashtags(hashtagsRaw).map((h) => (
                  <span
                    key={h}
                    className="text-[10px] px-1.5 py-0.5 font-bold tracking-tight"
                    style={{
                      ...HEAD,
                      backgroundColor: '#0e0e0e',
                      color: '#E8441A',
                      border: '2px solid #000',
                    }}
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="*VISUAL_DIRECTION" required>
            <textarea
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
              rows={3}
              className="brutal-input resize-none"
              style={BODY}
              placeholder="Wide static of storefront, golden-hour palette, ‘90s zine treatment…"
              required
            />
          </Field>

          <Field label="PRODUCTION_NOTES">
            <textarea
              value={productionNotes}
              onChange={(e) => setProductionNotes(e.target.value)}
              rows={2}
              className="brutal-input resize-none"
              style={BODY}
              placeholder="Internal — shoot list, props, gear…"
            />
          </Field>

          <Field label="THUMBNAIL">
            <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
          </Field>

          {mode === 'edit' && (
            <Field label="*STATUS" required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="brutal-input"
                style={HEAD}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0e0e0e]">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              {mode === 'edit' && onArchive && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Archive this post? It disappears from views and the partner portal.')) {
                      onArchive()
                    }
                  }}
                  className="px-4 py-3 border-4 border-black text-xs font-black uppercase tracking-widest text-[#ffdad6] bg-[#93000a] hover:shadow-[4px_4px_0px_#000]"
                  style={HEAD}
                >
                  ARCHIVE
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border-4 border-black text-xs font-black uppercase tracking-widest text-[#e4beb5] hover:bg-[#2a2a2a]"
                style={{ ...HEAD, backgroundColor: '#0e0e0e' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 border-4 border-black bg-[#E8441A] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] disabled:opacity-50"
                style={HEAD}
              >
                {submitting
                  ? mode === 'create'
                    ? 'CREATING…'
                    : 'SAVING…'
                  : mode === 'create'
                    ? 'CREATE_POST →'
                    : 'SAVE →'}
              </button>
            </div>
          </div>

          {/* Edit-mode comments display (read-only) */}
          {mode === 'edit' && initial && initial.comments.length > 0 && (
            <div className="border-t-4 border-black pt-5">
              <div
                className="text-[10px] uppercase tracking-widest font-black text-[#e4beb5] mb-3"
                style={HEAD}
              >
                *COMMENTS · {initial.comments.length}
              </div>
              <div className="space-y-3">
                {initial.comments.map((c) => (
                  <div
                    key={c.id}
                    className="border-2 border-black bg-[#0e0e0e] p-3"
                    style={BODY}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className="text-[10px] uppercase tracking-widest font-bold"
                        style={{
                          ...HEAD,
                          color:
                            c.type === 'REVISION_REQUEST'
                              ? '#E8441A'
                              : c.type === 'APPROVAL_NOTE'
                                ? '#76dc83'
                                : '#ab8981',
                        }}
                      >
                        *{c.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#ab8981] font-mono">
                        {new Date(c.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })}
                      </span>
                    </div>
                    <p className="text-sm text-[#e5e2e1] whitespace-pre-wrap">{c.body}</p>
                    <p className="text-[10px] text-[#ab8981] mt-1 font-mono">— {c.authorEmail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <style jsx global>{`
          .brutal-input {
            width: 100%;
            background: #0e0e0e;
            border: 4px solid #000;
            padding: 0.85rem 1rem;
            color: #e5e2e1;
            outline: none;
            transition: border-color 0.15s;
          }
          .brutal-input::placeholder {
            color: #353534;
          }
          .brutal-input:focus {
            border-color: #e8441a;
          }
        `}</style>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2"
        style={HEAD}
      >
        {required ? '' : ''}
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[#ab8981] mt-1.5" style={BODY}>
          {hint}
        </p>
      )}
    </div>
  )
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: Array<readonly [string, string]>
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label]) => {
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`px-3 py-2 border-4 border-black text-[10px] font-bold uppercase tracking-widest transition-all ${
              active ? 'bg-[#E8441A] text-white' : 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]'
            }`}
            style={HEAD}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
