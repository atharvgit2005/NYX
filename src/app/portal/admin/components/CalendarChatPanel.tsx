'use client'

/**
 * CalendarChatPanel — reusable AI chat side panel for the calendar
 * builder. Hosts:
 *   - Brand kit drawer (notes / audience / winners + asset upload)
 *   - Streaming chat with slash-command autocomplete (Trie)
 *   - "Apply proposed slots" button when the assistant emits a
 *     proposeSlots tool call
 *
 * Talks to:
 *   GET/POST /api/portal/admin/[slug]/chat
 *   GET/POST/DELETE /api/portal/admin/[slug]/brand-kit
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Send, Upload, Trash2, X, Paperclip, BookOpen, Bot, User } from 'lucide-react'
import { Trie } from '@/lib/ai/dsa/trie'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export interface ProposedSlot {
  date: string
  title: string
  contentType: 'REEL' | 'CAROUSEL' | 'STATIC_POST' | 'STORY' | 'REEL_STORY'
  platform: 'INSTAGRAM' | 'TIKTOK'
  caption?: string
  visualDirection?: string
  hashtags?: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolName?: string | null
  toolArgs?: unknown
  proposeSlots?: { slots: ProposedSlot[]; rationale?: string }
  provider?: string | null
  model?: string | null
  cached?: boolean
  createdAt?: string | Date
}

interface BrandKitAsset {
  id: string
  kind: string
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
  caption: string | null
  createdAt: string
}

interface BrandKit {
  id: string
  notes: string | null
  audience: string | null
  winners: string | null
  assets: BrandKitAsset[]
  _count?: { chunks: number }
}

interface Props {
  clientSlug: string
  brandName: string
  brandPrimaryColor: string
  onApplySlots: (slots: ProposedSlot[]) => void
  onExecuteToolCall?: (toolName: string, toolArgs: Record<string, unknown>) => void
  /** Caller passes the parent's slot rows; the panel synthesises the
   *  `index` and forwards them to the chat route so the model can
   *  reference specific rows by number. */
  currentSlots?: Array<{
    date: string
    title: string
    contentType: string
    platform: string
  }>
}

// Slash-command palette — drives autocomplete via the Trie.
const SLASH_COMMANDS: Array<{ key: string; description: string; insert: string }> = [
  {
    key: '/calendar',
    description: 'Propose a full content calendar for the campaign window',
    insert: '/calendar mix reels and carousels, MWF cadence',
  },
  {
    key: '/launch',
    description: 'Plan a 7-day launch sprint',
    insert: '/launch 7-day product launch — reels heavy, end with a UGC ask',
  },
  {
    key: '/reels',
    description: 'Propose 5 reel ideas this week',
    insert: '/reels 5 reel ideas for this week, hook-driven',
  },
  {
    key: '/carousel',
    description: 'Generate 3 educational carousels',
    insert: '/carousel 3 educational carousels around our top products',
  },
  {
    key: '/story',
    description: 'Plan a story sequence (BTS / poll / CTA)',
    insert: '/story BTS week — poll, behind the scenes, CTA',
  },
  {
    key: '/reset',
    description: 'Start a fresh chat session',
    insert: '',
  },
  {
    key: '/kit',
    description: 'Open the brand kit drawer',
    insert: '',
  },
]

function buildTrie() {
  const t = new Trie<(typeof SLASH_COMMANDS)[number]>()
  for (const c of SLASH_COMMANDS) t.insert(c.key, c)
  return t
}

export default function CalendarChatPanel({
  clientSlug,
  brandName,
  brandPrimaryColor,
  onApplySlots,
  onExecuteToolCall,
  currentSlots,
}: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [kit, setKit] = useState<BrandKit | null>(null)
  const [kitLoading, setKitLoading] = useState(false)
  const [kitOpen, setKitOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<typeof SLASH_COMMANDS>([])
  const trie = useMemo(() => buildTrie(), [])
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Load existing session + kit on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [chatRes, kitRes] = await Promise.all([
          fetch(`/api/portal/admin/${clientSlug}/chat`).then((r) => r.json()),
          fetch(`/api/portal/admin/${clientSlug}/brand-kit`).then((r) => r.json()),
        ])
        if (cancelled) return
        if (chatRes?.session) {
          setSessionId(chatRes.session.id)
          setMessages(
            (chatRes.messages ?? []).map((m: ChatMessage) => ({
              ...m,
              proposeSlots:
                m.toolName === 'proposeSlots' && m.toolArgs
                  ? normaliseSlotsPayload(m.toolArgs)
                  : undefined,
            })),
          )
        }
        if (kitRes?.kit) setKit(kitRes.kit)
      } catch {
        // first-load failure shouldn't block the page — show empty state
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [clientSlug])

  // Autoscroll to newest message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, sending])

  function handleInputChange(v: string) {
    setInput(v)
    // Trie autocomplete kicks in when the line *starts* with a slash
    const firstLine = v.split('\n')[0]
    if (firstLine.startsWith('/')) {
      const matches = trie.suggest(firstLine, 6).map((e) => e.payload)
      // dedupe (Trie's value-list could contain dupes if re-inserted)
      const seen = new Set<string>()
      const unique = matches.filter((m) => {
        if (seen.has(m.key)) return false
        seen.add(m.key)
        return true
      })
      setSuggestions(unique)
    } else {
      setSuggestions([])
    }
  }

  function applySuggestion(s: (typeof SLASH_COMMANDS)[number]) {
    if (s.key === '/reset') {
      setSessionId(null)
      setMessages([])
      setInput('')
      setSuggestions([])
      return
    }
    if (s.key === '/kit') {
      setKitOpen(true)
      setInput('')
      setSuggestions([])
      return
    }
    setInput(s.insert)
    setSuggestions([])
    textareaRef.current?.focus()
  }

  async function send() {
    const content = input.trim()
    if (!content || sending) return
    if (content === '/reset') {
      setSessionId(null)
      setMessages([])
      setInput('')
      return
    }
    setSending(true)
    setInput('')
    setSuggestions([])

    // optimistic user bubble
    const tempId = `tmp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: 'user', content },
    ])

    try {
      const res = await fetch(`/api/portal/admin/${clientSlug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content,
          currentSlots: currentSlots?.map((s, i) => ({
            index: i + 1,
            date: s.date,
            title: s.title,
            contentType: s.contentType,
            platform: s.platform,
          })),
        }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Chat failed' }))
        toast.error(error)
        // roll back optimistic user message
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        return
      }
      const data = await res.json()
      setSessionId(data.sessionId)
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId)
        return [
          ...withoutTemp,
          { ...data.userMessage, role: 'user' as const },
          {
            ...data.assistantMessage,
            role: 'assistant' as const,
            proposeSlots: data.assistantMessage.proposeSlots,
          },
        ]
      })
      if (data.assistantMessage?.toolName && data.assistantMessage?.toolName !== 'proposeSlots' && onExecuteToolCall) {
        const args =
          data.assistantMessage.toolArgs && typeof data.assistantMessage.toolArgs === 'object'
            ? (data.assistantMessage.toolArgs as Record<string, unknown>)
            : {}
        onExecuteToolCall(data.assistantMessage.toolName, args)
      }
      if (data.assistantMessage?.proposeSlots?.slots?.length) {
        toast.success(
          `${data.assistantMessage.proposeSlots.slots.length} slots proposed — review and apply`,
        )
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Chat failed')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
    if (e.key === 'Escape') setSuggestions([])
  }

  // ── Brand kit
  async function uploadKitAsset(file: File, kind = 'reference', caption = '') {
    setKitLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    fd.append('caption', caption)
    try {
      const res = await fetch(`/api/portal/admin/${clientSlug}/brand-kit`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Upload failed')
        return
      }
      toast.success('Asset uploaded')
      await refreshKit()
    } finally {
      setKitLoading(false)
    }
  }

  async function refreshKit() {
    const res = await fetch(`/api/portal/admin/${clientSlug}/brand-kit`)
    const data = await res.json()
    if (data?.kit) setKit(data.kit)
  }

  async function saveKitNotes(notes: string, audience: string, winners: string) {
    setKitLoading(true)
    try {
      const res = await fetch(`/api/portal/admin/${clientSlug}/brand-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, audience, winners }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Save failed')
        return
      }
      toast.success('Brand kit updated — embeddings reindexed')
      setKit(data.kit ? { ...kit!, ...data.kit, assets: kit?.assets ?? [] } : kit)
    } finally {
      setKitLoading(false)
    }
  }

  async function deleteAsset(id: string) {
    if (!confirm('Delete this asset?')) return
    const res = await fetch(`/api/portal/admin/${clientSlug}/brand-kit?assetId=${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Asset removed')
      await refreshKit()
    } else {
      toast.error('Delete failed')
    }
  }

  return (
    <div
      className="border-4 border-black bg-[#1c1b1b] flex flex-col"
      style={{ minHeight: '600px', maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b-4 border-black flex items-center justify-between gap-3 bg-[#0e0e0e]">
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-4 h-4"
            style={{ color: brandPrimaryColor }}
            aria-hidden
          />
          <span
            className="text-xs uppercase tracking-widest font-black text-[#e5e2e1]"
            style={HEAD}
          >
            AI Calendar Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={() => setKitOpen((v) => !v)}
          className="text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] hover:text-white border-2 border-black bg-[#1c1b1b] px-2 py-1 flex items-center gap-1"
          style={HEAD}
          title="Toggle brand kit drawer"
        >
          <BookOpen className="w-3 h-3" />
          Kit
          {kit?.assets?.length ? (
            <span
              className="ml-1 px-1.5 py-0.5 text-[9px] font-bold"
              style={{ backgroundColor: brandPrimaryColor, color: '#fff' }}
            >
              {kit.assets.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Brand kit drawer */}
      {kitOpen && (
        <BrandKitDrawer
          kit={kit}
          loading={kitLoading}
          onClose={() => setKitOpen(false)}
          onUpload={uploadKitAsset}
          onSaveNotes={saveKitNotes}
          onDeleteAsset={deleteAsset}
          brandPrimaryColor={brandPrimaryColor}
        />
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={BODY}>
        {messages.length === 0 && (
          <EmptyState brandName={brandName} brandPrimaryColor={brandPrimaryColor} />
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            brandPrimaryColor={brandPrimaryColor}
            onApplySlots={onApplySlots}
          />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-[#ab8981] italic" style={BODY}>
            <Bot className="w-3 h-3 animate-pulse" />
            Thinking…
          </div>
        )}
      </div>

      {/* Suggestion dropdown */}
      {suggestions.length > 0 && (
        <div className="border-t-4 border-black bg-[#0e0e0e] divide-y divide-[#2a2a2a]">
          {suggestions.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => applySuggestion(s)}
              className="w-full text-left px-3 py-2 hover:bg-[#1c1b1b] flex items-baseline justify-between gap-3"
            >
              <span className="font-mono text-xs font-bold text-[#E8441A]" style={HEAD}>
                {s.key}
              </span>
              <span className="text-[10px] text-[#ab8981] italic" style={BODY}>
                {s.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t-4 border-black p-3 bg-[#0e0e0e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask for a calendar… try /calendar or "Plan a 2-week launch for ${brandName}"`}
            rows={2}
            className="flex-1 bg-[#1c1b1b] border-2 border-black p-2 text-sm text-[#e5e2e1] outline-none focus:border-[#E8441A] resize-none"
            style={BODY}
            disabled={sending}
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim()}
            className="px-3 py-2 border-4 border-black bg-[#E8441A] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[3px_3px_0px_#000] disabled:opacity-40 transition-all flex items-center gap-1"
            style={HEAD}
          >
            <Send className="w-3 h-3" />
            Send
          </button>
        </div>
        <div className="text-[10px] text-[#ab8981] mt-1.5" style={BODY}>
          Enter to send · Shift+Enter for newline · /commands for shortcuts
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({
  brandName,
  brandPrimaryColor,
}: {
  brandName: string
  brandPrimaryColor: string
}) {
  return (
    <div className="text-center py-8 px-4">
      <Sparkles
        className="w-8 h-8 mx-auto mb-3"
        style={{ color: brandPrimaryColor }}
        aria-hidden
      />
      <h3 className="text-sm font-black uppercase tracking-widest text-[#e5e2e1] mb-2" style={HEAD}>
        Plan {brandName}&apos;s calendar
      </h3>
      <p className="text-xs text-[#ab8981] mb-4" style={BODY}>
        Upload the brand kit, then describe what you want — the AI proposes
        slots and you commit them in one click.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {['/calendar', '/launch', '/reels'].map((c) => (
          <span
            key={c}
            className="text-[10px] font-mono px-2 py-1 bg-[#0e0e0e] border-2 border-black text-[#e4beb5]"
            style={HEAD}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  brandPrimaryColor,
  onApplySlots,
}: {
  message: ChatMessage
  brandPrimaryColor: string
  onApplySlots: (slots: ProposedSlot[]) => void
}) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-6 h-6 border-2 border-black flex items-center justify-center shrink-0"
          style={{ backgroundColor: brandPrimaryColor }}
        >
          <Bot className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-3 py-2 border-2 border-black text-sm whitespace-pre-wrap ${
            isUser ? 'bg-[#E8441A] text-white' : 'bg-[#0e0e0e] text-[#e5e2e1]'
          }`}
          style={BODY}
        >
          {message.content || (message.proposeSlots ? '(proposed a calendar)' : '…')}
        </div>
        {message.proposeSlots?.slots?.length ? (
          <ProposedSlotsCard
            payload={message.proposeSlots}
            onApply={onApplySlots}
            brandPrimaryColor={brandPrimaryColor}
          />
        ) : null}
        {!isUser && (message.provider || message.cached) && (
          <div className="text-[10px] text-[#ab8981] mt-1" style={BODY}>
            {message.provider}
            {message.model ? ` · ${message.model}` : ''}
            {message.cached ? ' · cached' : ''}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-6 h-6 border-2 border-black bg-[#0e0e0e] flex items-center justify-center shrink-0">
          <User className="w-3 h-3 text-[#e4beb5]" />
        </div>
      )}
    </div>
  )
}

function ProposedSlotsCard({
  payload,
  onApply,
  brandPrimaryColor,
}: {
  payload: { slots: ProposedSlot[]; rationale?: string }
  onApply: (slots: ProposedSlot[]) => void
  brandPrimaryColor: string
}) {
  return (
    <div className="mt-2 border-2 border-black bg-[#1c1b1b]">
      <div className="px-3 py-2 border-b-2 border-black flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest font-black text-[#76dc83]" style={HEAD}>
          Proposed · {payload.slots.length} slots
        </span>
        <button
          type="button"
          onClick={() => onApply(payload.slots)}
          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black text-white hover:shadow-[2px_2px_0px_#000]"
          style={{ ...HEAD, backgroundColor: brandPrimaryColor }}
        >
          Apply to grid →
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-[#2a2a2a]">
        {payload.slots.map((s, i) => (
          <div key={i} className="px-3 py-2 text-xs grid gap-1" style={BODY}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#ab8981]">{s.date}</span>
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5"
                style={{ backgroundColor: '#0e0e0e', color: '#e4beb5' }}
              >
                {s.contentType.replace('_', ' ')}
              </span>
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5"
                style={{ backgroundColor: '#0e0e0e', color: '#e4beb5' }}
              >
                {s.platform}
              </span>
            </div>
            <div className="text-[#e5e2e1] font-medium">{s.title}</div>
            {s.visualDirection && (
              <div className="text-[10px] text-[#ab8981] italic">{s.visualDirection}</div>
            )}
          </div>
        ))}
      </div>
      {payload.rationale && (
        <div
          className="px-3 py-2 border-t-2 border-black text-[10px] text-[#ab8981] italic bg-[#0e0e0e]"
          style={BODY}
        >
          {payload.rationale}
        </div>
      )}
    </div>
  )
}

function BrandKitDrawer({
  kit,
  loading,
  onClose,
  onUpload,
  onSaveNotes,
  onDeleteAsset,
  brandPrimaryColor,
}: {
  kit: BrandKit | null
  loading: boolean
  onClose: () => void
  onUpload: (file: File, kind?: string, caption?: string) => Promise<void>
  onSaveNotes: (notes: string, audience: string, winners: string) => Promise<void>
  onDeleteAsset: (id: string) => Promise<void>
  brandPrimaryColor: string
}) {
  const [notes, setNotes] = useState(kit?.notes ?? '')
  const [audience, setAudience] = useState(kit?.audience ?? '')
  const [winners, setWinners] = useState(kit?.winners ?? '')
  const [kind, setKind] = useState('reference')
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNotes(kit?.notes ?? '')
    setAudience(kit?.audience ?? '')
    setWinners(kit?.winners ?? '')
  }, [kit])

  return (
    <div className="border-b-4 border-black bg-[#1c1b1b] max-h-[60vh] overflow-y-auto">
      <div className="sticky top-0 px-4 py-2 border-b-2 border-black bg-[#0e0e0e] flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-black text-[#e5e2e1]" style={HEAD}>
          Brand Kit
          {kit?._count?.chunks ? (
            <span className="ml-2 text-[10px] text-[#ab8981]">
              · {kit._count.chunks} indexed chunks
            </span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 border-2 border-black bg-[#1c1b1b] text-[#e4beb5] hover:bg-[#E8441A] hover:text-white flex items-center justify-center"
          aria-label="Close brand kit"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <KitTextarea
          label="NOTES (tone, voice, do/don't)"
          value={notes}
          onChange={setNotes}
          placeholder="Snappy. Always playful. Never use generic stock food terms. Hero shots > flat lays."
        />
        <KitTextarea
          label="AUDIENCE"
          value={audience}
          onChange={setAudience}
          placeholder="20-35 in Pune metro, foodie-curious, follows hyperlocal cafe accounts."
        />
        <KitTextarea
          label="WHAT WORKED BEFORE"
          value={winners}
          onChange={setWinners}
          placeholder="Behind-the-scenes reels of milkshake assembly cracked 50k+ reach last month."
        />
        <button
          type="button"
          onClick={() => onSaveNotes(notes, audience, winners)}
          disabled={loading}
          className="px-3 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
          style={{ ...HEAD, backgroundColor: brandPrimaryColor }}
        >
          {loading ? 'SAVING…' : 'SAVE & REINDEX'}
        </button>

        <div className="border-t-2 border-[#2a2a2a] pt-4">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2" style={HEAD}>
            UPLOAD ASSET
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="bg-[#0e0e0e] border-2 border-black text-xs text-[#e5e2e1] p-2"
              style={HEAD}
            >
              <option value="reference">Reference</option>
              <option value="logo">Logo</option>
              <option value="guideline">Guideline (PDF)</option>
              <option value="product">Product photo</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (helps the AI cite it)"
              className="flex-1 bg-[#0e0e0e] border-2 border-black text-xs text-[#e5e2e1] p-2"
              style={BODY}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="px-3 py-2 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#E8441A] hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
              style={HEAD}
            >
              <Upload className="w-3 h-3" />
              Pick file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/markdown"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) {
                  void onUpload(f, kind, caption).then(() => setCaption(''))
                  if (fileRef.current) fileRef.current.value = ''
                }
              }}
              className="hidden"
            />
          </div>
          <div className="text-[10px] text-[#ab8981] mt-1 italic" style={BODY}>
            JPEG · PNG · WebP · PDF · TXT · MD — max 15 MB. Captions are
            indexed for RAG retrieval.
          </div>
        </div>

        {(kit?.assets ?? []).length > 0 && (
          <div className="border-t-2 border-[#2a2a2a] pt-3 space-y-2">
            {kit!.assets.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 bg-[#0e0e0e] border-2 border-black p-2"
              >
                <Paperclip className="w-3 h-3 text-[#ab8981]" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#e5e2e1] truncate" style={BODY}>
                    {a.filename}
                  </div>
                  {a.caption && (
                    <div className="text-[10px] text-[#ab8981] italic truncate" style={BODY}>
                      {a.caption}
                    </div>
                  )}
                </div>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 border border-[#2a2a2a] text-[#e4beb5]"
                  style={HEAD}
                >
                  {a.kind}
                </span>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] underline text-[#e4beb5] hover:text-white"
                  style={BODY}
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => onDeleteAsset(a.id)}
                  className="w-6 h-6 border-2 border-black bg-[#1c1b1b] text-[#e4beb5] hover:bg-[#93000a] hover:text-white flex items-center justify-center"
                  aria-label="Delete asset"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KitTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-1" style={HEAD}>
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#0e0e0e] border-2 border-black text-xs text-[#e5e2e1] p-2 outline-none focus:border-[#E8441A] resize-vertical"
        style={BODY}
      />
    </label>
  )
}

// Minimal mirror of server-side normaliseProposedSlots, used when
// hydrating from GET (server already normalised live POST responses).
function normaliseSlotsPayload(raw: unknown): { slots: ProposedSlot[]; rationale?: string } {
  if (!raw || typeof raw !== 'object') return { slots: [] }
  const o = raw as Record<string, unknown>
  const rationale = typeof o.rationale === 'string' ? o.rationale : undefined
  const slots: ProposedSlot[] = []
  for (const s of (o.slots as unknown[]) ?? []) {
    if (!s || typeof s !== 'object') continue
    const r = s as Record<string, unknown>
    const date = String(r.date ?? '').slice(0, 10)
    const title = String(r.title ?? '').trim()
    if (!date || !title) continue
    const ct = String(r.contentType ?? 'STATIC_POST').toUpperCase()
    const pl = String(r.platform ?? 'INSTAGRAM').toUpperCase()
    slots.push({
      date,
      title,
      contentType: (['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY'].includes(ct)
        ? ct
        : 'STATIC_POST') as ProposedSlot['contentType'],
      platform: (['INSTAGRAM', 'TIKTOK'].includes(pl) ? pl : 'INSTAGRAM') as ProposedSlot['platform'],
      caption: typeof r.caption === 'string' ? r.caption : undefined,
      visualDirection: typeof r.visualDirection === 'string' ? r.visualDirection : undefined,
      hashtags: Array.isArray(r.hashtags) ? (r.hashtags as string[]) : undefined,
    })
  }
  return { slots, rationale }
}
