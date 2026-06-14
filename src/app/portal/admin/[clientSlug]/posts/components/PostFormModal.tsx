'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { CommentType, ContentType, Platform, PostStatus } from '@prisma/client'
import ThumbnailUploader from '../../../components/ThumbnailUploader'

/**
 * Structural subset of AdminPost / SerializedPost that the form actually
 * consumes. Both Phase 4 (`AdminPost`) and Phase 5 (`SerializedPost`)
 * shapes satisfy this — keeps the modal usable from both surfaces
 * without an adapter.
 */
export interface PostFormInitial {
    id: string
    title: string
    scheduledDate: string
    contentType: ContentType
    platform: Platform
    status: PostStatus
    caption: string
    hashtags: string[]
    visualDirection: string
    productionNotes: string | null
    thumbnailUrl: string | null
    comments: Array<{
        id: string
        authorEmail: string
        body: string
        type: CommentType
        createdAt: string
    }>
}

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export type PostFormTheme = 'brutalist' | 'editorial'

interface ThemeTokens {
    /** Visible-on-canvas wrapper styling. */
    overlayBg: string
    panelClass: string
    panelStyle: React.CSSProperties
    headerClass: string
    headerBg: string
    headerHeading: string
    headerHeadingStyle: React.CSSProperties
    headerSubtitle: string
    headerSubtitleStyle: React.CSSProperties
    /** Field label visual. */
    labelClass: string
    labelStyle: React.CSSProperties
    /** Buttons. */
    btnPrimary: string
    btnPrimaryStyle: React.CSSProperties
    btnSecondary: string
    btnSecondaryStyle: React.CSSProperties
    btnDanger: string
    btnDangerStyle: React.CSSProperties
    /** Inputs share a global class so :focus styles can theme cleanly. */
    inputClass: string
    inputFontStyle: React.CSSProperties
    /** Textarea font — preserves the original brutalist distinction
     *  (Space Grotesk on inputs, Work Sans on multi-line textareas). */
    textareaFontStyle: React.CSSProperties
    /** Chip group (platform / content type). */
    chipBase: string
    chipActive: string
    chipInactive: string
    chipStyle: React.CSSProperties
    /** Inline error banner. */
    errorClass: string
    errorStyle: React.CSSProperties
    /** Hint text under a field. */
    hintClass: string
    hintStyle: React.CSSProperties
    /** Hashtag pill render. */
    hashtagClass: string
    hashtagStyle: React.CSSProperties
    /** Comments separator + accent colours by comment type. */
    commentSection: string
    commentItem: string
    commentItemStyle: React.CSSProperties
    commentBodyClass: string
    commentMetaClass: string
    commentColors: { revision: string; approval: string; internal: string }
    /** Close-X button. */
    closeBtn: string
    closeBtnStyle: React.CSSProperties
    /** Submit-button label set. */
    labels: {
        new: string
        edit: string
        create: string
        save: string
        creating: string
        saving: string
        cancel: string
        archive: string
        delete: string
    }
}

const THEMES: Record<PostFormTheme, ThemeTokens> = {
    brutalist: {
        overlayBg: 'rgba(0,0,0,0.7)',
        panelClass:
            'w-full sm:max-w-2xl my-auto border-4 border-black shadow-[8px_8px_0px_#000] max-h-[95vh] overflow-y-auto',
        panelStyle: { backgroundColor: '#1c1b1b', ...BODY },
        headerClass:
            'flex items-start justify-between p-5 border-b-4 border-black sticky top-0 z-10',
        headerBg: '#1c1b1b',
        headerHeading: 'text-base font-black uppercase tracking-tighter text-[#e5e2e1]',
        headerHeadingStyle: HEAD,
        headerSubtitle: 'text-xs text-[#e4beb5] mt-1 truncate font-mono',
        headerSubtitleStyle: {},
        labelClass:
            'block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2',
        labelStyle: HEAD,
        btnPrimary:
            'px-6 py-3 border-4 border-black bg-[#D83C14] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] disabled:opacity-50',
        btnPrimaryStyle: HEAD,
        btnSecondary:
            'px-5 py-3 border-4 border-black text-xs font-black uppercase tracking-widest text-[#e4beb5] hover:bg-[#2a2a2a]',
        btnSecondaryStyle: { ...HEAD, backgroundColor: '#0e0e0e' },
        btnDanger:
            'px-4 py-3 border-4 border-black text-xs font-black uppercase tracking-widest text-[#ffdad6] bg-[#93000a] hover:shadow-[4px_4px_0px_#000]',
        btnDangerStyle: HEAD,
        inputClass: 'brutal-input',
        inputFontStyle: HEAD,
        textareaFontStyle: BODY,
        chipBase:
            'px-3 py-2 border-4 border-black text-[10px] font-bold uppercase tracking-widest transition-all',
        chipActive: 'bg-[#D83C14] text-white',
        chipInactive: 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]',
        chipStyle: HEAD,
        errorClass:
            'border-4 border-[#93000a] bg-[#93000a]/30 text-[#ffb4ab] px-4 py-3 text-xs tracking-widest',
        errorStyle: HEAD,
        hintClass: 'text-[11px] text-[#ab8981] mt-1.5',
        hintStyle: BODY,
        hashtagClass: 'text-[10px] px-1.5 py-0.5 font-bold tracking-tight',
        hashtagStyle: {
            ...HEAD,
            backgroundColor: '#0e0e0e',
            color: '#D83C14',
            border: '2px solid #000',
        },
        commentSection: 'border-t-4 border-black pt-5',
        commentItem: 'border-2 border-black bg-[#0e0e0e] p-3',
        commentItemStyle: BODY,
        commentBodyClass: 'text-sm text-[#e5e2e1] whitespace-pre-wrap',
        commentMetaClass: 'text-[10px] text-[#ab8981] mt-1 font-mono',
        commentColors: {
            revision: '#D83C14',
            approval: '#76dc83',
            internal: '#ab8981',
        },
        closeBtn:
            'ml-3 w-8 h-8 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white flex items-center justify-center transition shrink-0',
        closeBtnStyle: {},
        labels: {
            new: '*NEW_POST',
            edit: '*EDIT_POST',
            create: 'CREATE_POST →',
            save: 'SAVE →',
            creating: 'CREATING…',
            saving: 'SAVING…',
            cancel: 'Cancel',
            archive: 'ARCHIVE',
            delete: 'DELETE',
        },
    },
    editorial: {
        overlayBg: 'rgba(26,42,94,0.5)',
        panelClass:
            'w-full sm:max-w-2xl my-auto rounded-2xl shadow-[0_24px_80px_rgba(26,42,94,0.18)] max-h-[95vh] overflow-y-auto',
        panelStyle: {
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E4DC',
            color: '#1A2A5E',
            fontFamily: 'var(--font-portal-body)',
        },
        headerClass:
            'flex items-start justify-between p-5 sticky top-0 z-10 rounded-t-2xl border-b border-[#E8E4DC]',
        headerBg: '#FFFFFF',
        headerHeading: 'text-lg font-bold tracking-tight',
        headerHeadingStyle: {
            fontFamily: 'var(--font-portal-display)',
            color: '#1A2A5E',
        },
        headerSubtitle: 'text-xs mt-1 truncate',
        headerSubtitleStyle: { color: '#6B6B6B' },
        labelClass:
            'block text-xs uppercase tracking-widest font-semibold mb-2',
        labelStyle: { color: '#6B6B6B' },
        btnPrimary:
            'px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity',
        btnPrimaryStyle: { backgroundColor: '#1A2A5E' },
        btnSecondary:
            'px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#F0EDE6] transition-colors',
        btnSecondaryStyle: {
            backgroundColor: '#FAF7F2',
            border: '1px solid #E8E4DC',
            color: '#6B6B6B',
        },
        btnDanger:
            'px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity',
        btnDangerStyle: { backgroundColor: '#C2410C' },
        inputClass: 'editorial-input',
        inputFontStyle: { fontFamily: 'var(--font-portal-body)' },
        textareaFontStyle: { fontFamily: 'var(--font-portal-body)' },
        chipBase:
            'px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all',
        chipActive: 'text-white',
        chipInactive:
            'bg-[#FAF7F2] text-[#6B6B6B] hover:bg-[#F0EDE6]',
        chipStyle: {},
        errorClass:
            'rounded-xl px-4 py-3 text-xs tracking-wide',
        errorStyle: {
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
        },
        hintClass: 'text-xs mt-1.5',
        hintStyle: { color: '#9CA3AF', fontStyle: 'italic' },
        hashtagClass: 'text-xs px-2 py-0.5 rounded-full font-medium',
        hashtagStyle: {
            backgroundColor: '#FAF7F2',
            color: '#1A2A5E',
            border: '1px solid #E8E4DC',
        },
        commentSection: 'pt-5',
        commentItem: 'rounded-xl p-3',
        commentItemStyle: { backgroundColor: '#FAF7F2', border: '1px solid #E8E4DC' },
        commentBodyClass: 'text-sm whitespace-pre-wrap',
        commentMetaClass: 'text-[11px] mt-1',
        commentColors: {
            revision: '#C2410C',
            approval: '#0E9F5E',
            internal: '#6B6B6B',
        },
        closeBtn:
            'ml-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0',
        closeBtnStyle: { backgroundColor: '#FAF7F2', color: '#6B6B6B' },
        labels: {
            new: 'New post',
            edit: 'Edit post',
            create: 'Create post',
            save: 'Save',
            creating: 'Creating…',
            saving: 'Saving…',
            cancel: 'Cancel',
            archive: 'Archive',
            delete: 'Delete',
        },
    },
}

const ThemeContext = createContext<ThemeTokens>(THEMES.brutalist)
const useTheme = () => useContext(ThemeContext)

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
  /** Optional ISO date used to prefill the date picker in create mode. */
  defaultScheduledDate?: string
  initial?: PostFormInitial
  onClose: () => void
  onSubmit: (values: PostFormValues) => void | Promise<void>
  onArchive?: () => void
  /** Edit-mode only: hard-delete the post (irreversible). Shown alongside
   *  archive — archive is the recoverable default, delete drops the row
   *  permanently. */
  onDelete?: () => void
  /** Edit-mode only: clone the post into a new IDEA card and close. */
  onDuplicate?: () => void
  /** Visual theme. Default 'brutalist' (workspace mode). 'editorial' is
   *  used by the admin overlay on the cream partner canvas. */
  theme?: PostFormTheme
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
  defaultScheduledDate,
  initial,
  onClose,
  onSubmit,
  onArchive,
  onDelete,
  onDuplicate,
  theme = 'brutalist',
}: Props) {
  const T = THEMES[theme]
  const [title, setTitle] = useState(initial?.title ?? '')
  const [scheduledDate, setScheduledDate] = useState(
    initial
      ? dayOnly(initial.scheduledDate)
      : defaultScheduledDate
        ? dayOnly(defaultScheduledDate)
        : '',
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

  const heading = mode === 'create' ? T.labels.new : T.labels.edit

  return (
   <ThemeContext.Provider value={T}>
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      style={{ background: T.overlayBg }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={T.panelClass} style={T.panelStyle}>
        <div className={T.headerClass} style={{ backgroundColor: T.headerBg }}>
          <div className="min-w-0">
            <div className={T.headerHeading} style={T.headerHeadingStyle}>
              {heading}
            </div>
            {initial && (
              <p className={T.headerSubtitle} style={T.headerSubtitleStyle}>
                {initial.title}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={T.closeBtn}
            style={T.closeBtnStyle}
            aria-label="Close"
          >
            <span className="material-symbols-outlined !text-sm" aria-hidden>
              close
            </span>
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {err && (
            <div className={T.errorClass} style={T.errorStyle}>
              {theme === 'brutalist' ? err.toUpperCase() : err}
            </div>
          )}

          <Field label={theme === 'brutalist' ? '*TITLE' : 'Title'} required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brand Intro — What is X?"
              className={T.inputClass}
              style={T.inputFontStyle}
              required
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={theme === 'brutalist' ? '*SCHEDULED_DATE' : 'Scheduled date'} required>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={T.inputClass}
                style={T.inputFontStyle}
                required
              />
            </Field>
            <Field label={theme === 'brutalist' ? '*PLATFORM' : 'Platform'} required>
              <ChipGroup
                options={PLATFORMS.map((p) => [p, p])}
                value={platform}
                onChange={(v) => setPlatform(v as Platform)}
              />
            </Field>
          </div>

          <Field label={theme === 'brutalist' ? '*CONTENT_TYPE' : 'Content type'} required>
            <ChipGroup
              options={CONTENT_TYPES.map((c) => [c, c.replace('_', ' ')])}
              value={contentType}
              onChange={(v) => setContentType(v as ContentType)}
            />
          </Field>

          <Field
            label={theme === 'brutalist' ? '*CAPTION' : 'Caption'}
            hint={`${caption.length} / 2200 (Instagram cap)`}
            required
          >
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              maxLength={2200}
              className={`${T.inputClass} resize-none`}
              style={T.textareaFontStyle}
              placeholder="Hook · body · CTA…"
              required
            />
          </Field>

          <Field
            label={theme === 'brutalist' ? '*HASHTAGS' : 'Hashtags'}
            hint="Comma- or space-separated. # is optional."
            required
          >
            <input
              value={hashtagsRaw}
              onChange={(e) => setHashtagsRaw(e.target.value)}
              placeholder="dessertino, shakes, pune"
              className={`${T.inputClass} font-mono`}
              style={T.inputFontStyle}
              required
            />
            {parseHashtags(hashtagsRaw).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {parseHashtags(hashtagsRaw).map((h) => (
                  <span key={h} className={T.hashtagClass} style={T.hashtagStyle}>
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label={theme === 'brutalist' ? '*VISUAL_DIRECTION' : 'Visual direction'} required>
            <textarea
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
              rows={3}
              className={`${T.inputClass} resize-none`}
              style={T.textareaFontStyle}
              placeholder="Wide static of storefront, golden-hour palette, ‘90s zine treatment…"
              required
            />
          </Field>

          <Field label={theme === 'brutalist' ? 'PRODUCTION_NOTES' : 'Production notes'}>
            <textarea
              value={productionNotes}
              onChange={(e) => setProductionNotes(e.target.value)}
              rows={2}
              className={`${T.inputClass} resize-none`}
              style={T.textareaFontStyle}
              placeholder="Internal — shoot list, props, gear…"
            />
          </Field>

          <Field label={theme === 'brutalist' ? 'THUMBNAIL' : 'Thumbnail'}>
            <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
          </Field>

          {mode === 'edit' && (
            <Field label={theme === 'brutalist' ? '*STATUS' : 'Status'} required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className={T.inputClass}
                style={T.inputFontStyle}
              >
                {STATUSES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className={theme === 'brutalist' ? 'bg-[#0e0e0e]' : 'bg-white'}
                  >
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
                    if (confirm('Archive this post? It disappears from views and the partner portal. You can restore it from the archive drawer.')) {
                      onArchive()
                    }
                  }}
                  className={T.btnDanger}
                  style={T.btnDangerStyle}
                >
                  {T.labels.archive}
                </button>
              )}
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Delete this post permanently? This removes the post, its comments, and approval history. This cannot be undone.',
                      )
                    ) {
                      onDelete()
                    }
                  }}
                  className={T.btnDanger}
                  style={{
                    ...T.btnDangerStyle,
                    // Darker / starker than archive so the two buttons read
                    // as distinct severities at a glance.
                    backgroundColor:
                      theme === 'brutalist' ? '#410002' : '#7F1D1D',
                  }}
                  title="Permanently delete — comments and approval history go with it"
                >
                  {T.labels.delete}
                </button>
              )}
              {mode === 'edit' && onDuplicate && (
                <button
                  type="button"
                  onClick={onDuplicate}
                  className={T.btnSecondary}
                  style={T.btnSecondaryStyle}
                >
                  {theme === 'brutalist' ? 'DUPLICATE' : 'Duplicate'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={T.btnSecondary}
                style={T.btnSecondaryStyle}
              >
                {T.labels.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={T.btnPrimary}
                style={T.btnPrimaryStyle}
              >
                {submitting
                  ? mode === 'create'
                    ? T.labels.creating
                    : T.labels.saving
                  : mode === 'create'
                    ? T.labels.create
                    : T.labels.save}
              </button>
            </div>
          </div>

          {/* Edit-mode comments display (read-only) */}
          {mode === 'edit' && initial && initial.comments.length > 0 && (
            <div className={T.commentSection}>
              <div
                className={
                  theme === 'brutalist'
                    ? 'text-[10px] uppercase tracking-widest font-black text-[#e4beb5] mb-3'
                    : 'text-xs uppercase tracking-widest font-semibold mb-3'
                }
                style={
                  theme === 'brutalist'
                    ? HEAD
                    : { color: '#6B6B6B' }
                }
              >
                {theme === 'brutalist' ? '*COMMENTS · ' : 'Revision history · '}
                {initial.comments.length}
              </div>
              <div className="space-y-3">
                {initial.comments.map((c) => {
                  const accent =
                    c.type === 'REVISION_REQUEST'
                      ? T.commentColors.revision
                      : c.type === 'APPROVAL_NOTE'
                        ? T.commentColors.approval
                        : T.commentColors.internal
                  return (
                    <div
                      key={c.id}
                      className={T.commentItem}
                      style={T.commentItemStyle}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={
                            theme === 'brutalist'
                              ? 'text-[10px] uppercase tracking-widest font-bold'
                              : 'text-xs uppercase tracking-wider font-semibold'
                          }
                          style={{ ...(theme === 'brutalist' ? HEAD : {}), color: accent }}
                        >
                          {theme === 'brutalist' ? '*' : ''}
                          {c.type.replace('_', ' ')}
                        </span>
                        <span
                          className={
                            theme === 'brutalist'
                              ? 'text-[10px] text-[#ab8981] font-mono'
                              : 'text-[11px]'
                          }
                          style={theme === 'editorial' ? { color: '#9CA3AF' } : undefined}
                        >
                          {new Date(c.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })}
                        </span>
                      </div>
                      <p
                        className={T.commentBodyClass}
                        style={
                          theme === 'editorial' ? { color: '#1A2A5E' } : undefined
                        }
                      >
                        {c.body}
                      </p>
                      <p
                        className={T.commentMetaClass}
                        style={theme === 'editorial' ? { color: '#9CA3AF' } : undefined}
                      >
                        — {c.authorEmail}
                      </p>
                    </div>
                  )
                })}
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
            border-color: #D83C14;
          }
          .editorial-input {
            width: 100%;
            background: #FAF7F2;
            border: 1px solid #E8E4DC;
            border-radius: 12px;
            padding: 0.65rem 0.9rem;
            color: #1A2A5E;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .editorial-input::placeholder {
            color: #9CA3AF;
          }
          .editorial-input:focus {
            border-color: #1A2A5E;
            box-shadow: 0 0 0 3px rgba(26,42,94,0.08);
          }
        `}</style>
      </div>
    </div>
   </ThemeContext.Provider>
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
  const T = useTheme()
  return (
    <div>
      <label className={T.labelClass} style={T.labelStyle}>
        {required ? '' : ''}
        {label}
      </label>
      {children}
      {hint && (
        <p className={T.hintClass} style={T.hintStyle}>
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
  const T = useTheme()
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label]) => {
        const active = value === val
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`${T.chipBase} ${active ? T.chipActive : T.chipInactive}`}
            style={{
              ...T.chipStyle,
              // Editorial active background uses the brand accent (navy).
              ...(active && T.chipActive === 'text-white'
                ? T.chipBase.includes('rounded-full')
                  ? { backgroundColor: '#1A2A5E' }
                  : {}
                : {}),
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
