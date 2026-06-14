'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import type { ContentType, Platform } from '@prisma/client'
import { ArrowLeft, ArrowRight, Sparkles, Trash2, Plus } from 'lucide-react'
import CalendarChatPanel, {
    type ProposedSlot,
} from '../../components/CalendarChatPanel'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

type Cadence = 'daily' | 'alternate' | 'mwf' | 'weekly' | 'custom'

interface Slot {
    /** Stable client-side id so React doesn't reorder. */
    key: string
    /** YYYY-MM-DD */
    date: string
    title: string
    contentType: ContentType
    platform: Platform
    /** Pre-filled prompts the admin can flesh out later — keeps the
     *  bulk submit unblocked even if everything else is empty. */
    caption: string
    visualDirection: string
    hashtagsRaw: string
}

interface Props {
    clientSlug: string
    brandName: string
    brandPrimaryColor: string
    defaultPlatform: Platform
    campaignStart: string
    campaignEnd: string
}

const CONTENT_TYPES: ContentType[] = [
    'REEL',
    'CAROUSEL',
    'STATIC_POST',
    'STORY',
    'REEL_STORY',
]

// Phase 5 follow-up: tiny seed library so an admin gets a *useful*
// scaffold instead of "Post #1 / Post #2 …". Cycled across slots.
const TITLE_PRESETS = [
    'Brand intro — what is {brand}?',
    'Top products spotlight',
    "Behind the scenes — what makes {brand} tick",
    'Customer story / testimonial',
    'Founder POV — {brand} origin',
    'How-to / tutorial',
    'Signature product close-up',
    'Day-in-the-life',
    'User-generated content highlight',
    'Limited-time offer / drop',
    'Seasonal moment / cultural tie-in',
    'Quick tip / value reel',
    'Process / craftsmanship',
    'FAQ — most asked questions',
    'Community / event recap',
]

function pad(n: number) {
    return String(n).padStart(2, '0')
}
function isoDay(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function addDays(iso: string, n: number) {
    const d = new Date(iso + 'T00:00:00.000Z')
    d.setUTCDate(d.getUTCDate() + n)
    return isoDay(d)
}
function dayOfWeek(iso: string) {
    return new Date(iso + 'T00:00:00.000Z').getUTCDay() // 0=Sun..6=Sat
}
function fmtDate(iso: string) {
    if (!iso) return ''
    return new Date(iso + 'T00:00:00.000Z').toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

function generateDates(start: string, end: string, cadence: Cadence): string[] {
    if (!start || !end) return []
    const dates: string[] = []
    let cursor = start
    const safetyLimit = 200 // never generate more than this
    while (cursor <= end && dates.length < safetyLimit) {
        const dow = dayOfWeek(cursor)
        const include = (() => {
            switch (cadence) {
                case 'daily':
                    return true
                case 'alternate':
                    return dates.length === 0 || true // every other handled by step
                case 'mwf':
                    return dow === 1 || dow === 3 || dow === 5
                case 'weekly':
                    return dates.length === 0 || true // every 7
                case 'custom':
                    return false
            }
        })()
        if (include) dates.push(cursor)
        const step = cadence === 'alternate' ? 2 : cadence === 'weekly' ? 7 : 1
        cursor = addDays(cursor, step)
    }
    return dates
}

export default function CalendarBuilderClient({
    clientSlug,
    brandName,
    brandPrimaryColor,
    defaultPlatform,
    campaignStart,
    campaignEnd,
}: Props) {
    const router = useRouter()

    // ── Form state ──
    const [start, setStart] = useState(campaignStart)
    const [end, setEnd] = useState(campaignEnd)
    const [cadence, setCadence] = useState<Cadence>('mwf')
    const [defaultType, setDefaultType] = useState<ContentType>('STATIC_POST')
    const [platform, setPlatform] = useState<Platform>(defaultPlatform)
    const [usePresets, setUsePresets] = useState(true)

    // ── Generated slots ──
    const [slots, setSlots] = useState<Slot[]>([])
    const [submitting, setSubmitting] = useState(false)

    // AI proposes slots → drop them into the existing slot grid. We map
    // ProposedSlot → Slot, dedupe by date+title, and append below any
    // manual slots the admin has already crafted.
    function applyProposedSlots(proposed: ProposedSlot[]) {
        if (proposed.length === 0) return
        setSlots((prev) => {
            const seen = new Set(prev.map((s) => `${s.date}__${s.title}`))
            const next: Slot[] = [...prev]
            for (let i = 0; i < proposed.length; i++) {
                const p = proposed[i]
                const dedupeKey = `${p.date}__${p.title}`
                if (seen.has(dedupeKey)) continue
                seen.add(dedupeKey)
                next.push({
                    key: `${p.date}-${next.length}-${Math.random().toString(36).slice(2, 6)}`,
                    date: p.date,
                    title: p.title,
                    contentType: p.contentType,
                    platform: p.platform,
                    caption: p.caption ?? '',
                    visualDirection: p.visualDirection ?? '',
                    hashtagsRaw: (p.hashtags ?? []).join(' '),
                })
            }
            return next
        })
        toast.success(`Applied ${proposed.length} AI-proposed slot${proposed.length === 1 ? '' : 's'}`)
    }

    function handleExecuteToolCall(toolName: string, toolArgs: Record<string, unknown>) {
        const argStr = (k: string): string | null =>
            typeof toolArgs[k] === 'string' ? (toolArgs[k] as string) : null
        if (toolName === 'updateCampaignWindow') {
            const s = argStr('startDate')
            const e = argStr('endDate')
            if (s) setStart(s)
            if (e) setEnd(e)
            toast.success(`AI updated campaign window: ${s ?? '?'} → ${e ?? '?'}`)
        } else if (toolName === 'clearCalendar') {
            setSlots([])
            toast.success('AI cleared the calendar grid')
        } else if (toolName === 'deleteSlot') {
            const idx = Number(toolArgs.index) - 1
            if (isNaN(idx) || idx < 0) return
            setSlots((prev) => prev.filter((_, i) => i !== idx))
            toast.success(`AI deleted slot #${String(toolArgs.index)}`)
        } else if (toolName === 'modifySlot') {
            const idx = Number(toolArgs.index) - 1
            if (isNaN(idx) || idx < 0) return
            setSlots((prev) => {
                if (idx >= prev.length) return prev
                return prev.map((s, i) => {
                    if (i !== idx) return s
                    const allowedCt = ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY']
                    const allowedPl = ['INSTAGRAM', 'TIKTOK']
                    const newTitle = argStr('title')
                    const newDate = argStr('date')
                    const newCt = argStr('contentType')?.toUpperCase()
                    const newPl = argStr('platform')?.toUpperCase()
                    return {
                        ...s,
                        title: newTitle ?? s.title,
                        date: newDate ?? s.date,
                        contentType:
                            newCt && allowedCt.includes(newCt)
                                ? (newCt as ContentType)
                                : s.contentType,
                        platform:
                            newPl && allowedPl.includes(newPl)
                                ? (newPl as Platform)
                                : s.platform,
                    }
                })
            })
            toast.success(`AI modified slot #${String(toolArgs.index)}`)
        }
    }


    function buildSlots() {
        if (!start || !end) {
            toast.error('Pick a start and end date first')
            return
        }
        if (start > end) {
            toast.error('Start must be on or before end')
            return
        }
        const dates = generateDates(start, end, cadence)
        if (dates.length === 0) {
            toast.error('No dates landed in that window for the chosen cadence')
            return
        }
        const built: Slot[] = dates.map((date, i) => {
            const presetTitle = TITLE_PRESETS[i % TITLE_PRESETS.length].replace(
                /\{brand\}/g,
                brandName,
            )
            return {
                key: `${date}-${i}`,
                date,
                title: usePresets ? presetTitle : `Post #${i + 1}`,
                contentType: defaultType,
                platform,
                caption: '',
                visualDirection: '',
                hashtagsRaw: '',
            }
        })
        setSlots(built)
        toast.success(`Generated ${built.length} slot${built.length === 1 ? '' : 's'}`)
    }

    function updateSlot(key: string, partial: Partial<Slot>) {
        setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...partial } : s)))
    }
    function removeSlot(key: string) {
        setSlots((prev) => prev.filter((s) => s.key !== key))
    }
    function addBlankSlot() {
        const last = slots[slots.length - 1]
        const nextDate = last ? addDays(last.date, 1) : start || isoDay(new Date())
        setSlots((prev) => [
            ...prev,
            {
                key: `${nextDate}-${Math.random().toString(36).slice(2, 8)}`,
                date: nextDate,
                title: '',
                contentType: defaultType,
                platform,
                caption: '',
                visualDirection: '',
                hashtagsRaw: '',
            },
        ])
    }

    const stats = useMemo(() => {
        const byType = new Map<ContentType, number>()
        for (const s of slots) byType.set(s.contentType, (byType.get(s.contentType) ?? 0) + 1)
        return { count: slots.length, byType }
    }, [slots])

    function parseHashtags(input: string): string[] {
        return input
            .split(/[,\s]+/)
            .map((h) => h.trim().replace(/^#+/, ''))
            .filter(Boolean)
    }

    async function commitAll() {
        if (slots.length === 0) {
            toast.error('Generate slots first')
            return
        }
        // Validate every slot has the minimum that the API requires.
        const missing = slots.findIndex((s) => !s.title.trim() || !s.date)
        if (missing >= 0) {
            toast.error(`Slot ${missing + 1} is missing title or date`)
            return
        }

        setSubmitting(true)
        let created = 0
        const failed: Array<{ index: number; error: string }> = []

        // Submit sequentially so server-side `position` ordering is
        // deterministic — each new IDEA post lands at the end of the
        // column in the order we sent them.
        for (let i = 0; i < slots.length; i++) {
            const s = slots[i]
            const hashtags = parseHashtags(s.hashtagsRaw)
            // The POST endpoint requires non-empty caption / visual /
            // hashtags. Auto-fill stubs if the admin didn't.
            const body = {
                title: s.title.trim(),
                scheduledDate: s.date + 'T00:00:00.000Z',
                contentType: s.contentType,
                platform: s.platform,
                caption: s.caption.trim() || `Draft caption for "${s.title.trim()}".`,
                hashtags: hashtags.length ? hashtags : [brandName.toLowerCase().replace(/[^a-z0-9]/g, '')],
                visualDirection:
                    s.visualDirection.trim() ||
                    `Visual direction TBD — placeholder slot from Calendar Builder.`,
                productionNotes: null,
                thumbnailUrl: null,
            }
            try {
                const res = await fetch(`/api/portal/admin/${clientSlug}/posts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })
                if (!res.ok) {
                    const { error } = await res
                        .json()
                        .catch(() => ({ error: 'Create failed' }))
                    failed.push({ index: i, error })
                } else {
                    created++
                }
            } catch (e) {
                failed.push({ index: i, error: (e as Error).message })
            }
        }

        setSubmitting(false)

        if (failed.length === 0) {
            toast.success(`Created ${created} post${created === 1 ? '' : 's'}.`)
            router.push(`/portal/admin/${clientSlug}/posts`)
        } else {
            toast.error(
                `Created ${created} of ${slots.length}. Failed: ${failed
                    .map((f) => `#${f.index + 1} (${f.error})`)
                    .join('; ')}`,
            )
        }
    }

    return (
        <div
            className="min-h-screen p-6 md:p-10"
            style={{ backgroundColor: '#0e0e0e', color: '#e5e2e1', ...BODY }}
        >
            <Toaster position="top-right" theme="dark" richColors />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Link
                    href={`/portal/admin/${clientSlug}/posts`}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#e4beb5] hover:text-[#D83C14] mb-4"
                    style={HEAD}
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to {brandName} workspace
                </Link>
                <div className="flex flex-wrap items-end gap-4 mb-2">
                    <h1
                        className="text-3xl md:text-5xl font-black tracking-tighter leading-none uppercase"
                        style={HEAD}
                    >
                        Calendar Builder
                    </h1>
                    <span
                        className="text-xs px-2 py-0.5 font-bold uppercase mb-1"
                        style={{
                            ...HEAD,
                            backgroundColor: brandPrimaryColor,
                            color: '#ffffff',
                        }}
                    >
                        *{brandName.toUpperCase()}
                    </span>
                </div>
                <p className="text-[#e4beb5] text-sm mb-8 max-w-2xl">
                    Scaffold a full content calendar for {brandName} in one
                    pass. Use the cadence form for a rule-based grid, or chat
                    with the AI on the right to draft brand-specific slots —
                    apply, edit, commit.
                </p>

                {/* Two-column layout: builder + chat panel */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
                    <div>

                {/* Form */}
                <fieldset className="border-l-4 border-[#D83C14] pl-6 space-y-5 mb-8">
                    <legend
                        className="text-xs uppercase tracking-[0.2em] text-[#D83C14] font-black"
                        style={HEAD}
                    >
                        *CAMPAIGN_WINDOW
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="*START_DATE">
                            <input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="brutal-input"
                                style={HEAD}
                            />
                        </Field>
                        <Field label="*END_DATE">
                            <input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="brutal-input"
                                style={HEAD}
                            />
                        </Field>
                    </div>

                    <Field
                        label="*CADENCE"
                        hint="How often a post drops within the window."
                    >
                        <ChipGroup
                            options={[
                                ['daily', 'Daily'],
                                ['alternate', 'Every 2 days'],
                                ['mwf', 'Mon · Wed · Fri'],
                                ['weekly', 'Weekly'],
                                ['custom', 'Custom (manual)'],
                            ]}
                            value={cadence}
                            onChange={(v) => setCadence(v as Cadence)}
                        />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="*DEFAULT_TYPE" hint="Each slot starts with this; override per row.">
                            <ChipGroup
                                options={CONTENT_TYPES.map((c) => [c, c.replace('_', ' ')])}
                                value={defaultType}
                                onChange={(v) => setDefaultType(v as ContentType)}
                            />
                        </Field>
                        <Field label="*PLATFORM">
                            <ChipGroup
                                options={[
                                    ['INSTAGRAM', 'Instagram'],
                                    ['TIKTOK', 'TikTok'],
                                ]}
                                value={platform}
                                onChange={(v) => setPlatform(v as Platform)}
                            />
                        </Field>
                    </div>

                    <Field label="">
                        <label
                            className="flex items-center gap-3 cursor-pointer text-xs"
                            style={HEAD}
                        >
                            <input
                                type="checkbox"
                                checked={usePresets}
                                onChange={(e) => setUsePresets(e.target.checked)}
                                className="w-4 h-4 border-2 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0 rounded-none"
                            />
                            <span className="text-[#e4beb5] uppercase tracking-widest">
                                Seed with starter titles ({TITLE_PRESETS.length}-pattern rotation)
                            </span>
                        </label>
                    </Field>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="button"
                            onClick={buildSlots}
                            className="px-5 py-3 border-4 border-black bg-[#D83C14] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] transition-all flex items-center gap-2"
                            style={HEAD}
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate slots
                        </button>
                        {slots.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSlots([])}
                                className="px-5 py-3 border-4 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a] text-xs font-black uppercase tracking-widest"
                                style={HEAD}
                            >
                                Clear slots
                            </button>
                        )}
                    </div>
                </fieldset>

                {/* Slot grid */}
                {slots.length > 0 && (
                    <fieldset className="border-l-4 border-[#76dc83] pl-6 space-y-5">
                        <legend className="text-xs uppercase tracking-[0.2em] text-[#76dc83] font-black" style={HEAD}>
                            *SLOTS · {stats.count} · {Array.from(stats.byType.entries()).map(([t, n]) => `${t}=${n}`).join(' · ')}
                        </legend>

                        {(() => {
                            const groups: Record<string, { slot: Slot; originalIndex: number }[]> = {}
                            slots.forEach((slot, index) => {
                                const dateStr = slot.date || ''
                                const monthKey = dateStr.slice(0, 7) || 'NO_DATE'
                                ;(groups[monthKey] ??= []).push({ slot, originalIndex: index })
                            })

                            const sortedMonthKeys = Object.keys(groups).sort()

                            return sortedMonthKeys.map((monthKey) => {
                                const groupSlots = groups[monthKey]
                                let monthName = 'No Date / Undefined'
                                if (monthKey !== 'NO_DATE') {
                                    const [year, month] = monthKey.split('-')
                                    const d = new Date(Date.UTC(Number(year), Number(month) - 1, 1))
                                    monthName = d.toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                        timeZone: 'UTC',
                                    })
                                }

                                return (
                                    <div key={monthKey} className="space-y-3 mb-6">
                                        <div className="text-xs font-black uppercase tracking-widest text-[#76dc83]" style={HEAD}>
                                            * {monthName} ({groupSlots.length} slot{groupSlots.length === 1 ? '' : 's'})
                                        </div>
                                        <div className="bg-[#1c1b1b] border-4 border-black overflow-hidden">
                                            <div
                                                className="grid gap-2 px-4 py-3 border-b-4 border-black text-[10px] uppercase tracking-widest font-black text-[#e4beb5]"
                                                style={{ ...HEAD, gridTemplateColumns: '40px 130px 1fr 140px 140px 40px' }}
                                            >
                                                <span>#</span>
                                                <span>Date</span>
                                                <span>Title</span>
                                                <span>Type</span>
                                                <span>Platform</span>
                                                <span></span>
                                            </div>
                                            {groupSlots.map(({ slot, originalIndex }) => (
                                                <div
                                                    key={slot.key}
                                                    className="grid gap-2 px-4 py-3 border-b-2 border-black hover:bg-[#0e0e0e] transition-colors items-center"
                                                    style={{ gridTemplateColumns: '40px 130px 1fr 140px 140px 40px' }}
                                                >
                                                    <span className="text-xs font-bold text-[#ab8981]" style={HEAD}>
                                                        {originalIndex + 1}
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={slot.date}
                                                        onChange={(e) => updateSlot(slot.key, { date: e.target.value })}
                                                        className="brutal-input !p-2 !text-xs"
                                                        style={HEAD}
                                                        title={fmtDate(slot.date)}
                                                        aria-label={`Slot ${originalIndex + 1} date`}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={slot.title}
                                                        onChange={(e) => updateSlot(slot.key, { title: e.target.value })}
                                                        placeholder="Post title"
                                                        className="brutal-input !p-2 !text-sm"
                                                        style={HEAD}
                                                        aria-label={`Slot ${originalIndex + 1} title`}
                                                    />
                                                    <select
                                                        value={slot.contentType}
                                                        onChange={(e) => updateSlot(slot.key, { contentType: e.target.value as ContentType })}
                                                        className="brutal-input !p-2 !text-xs"
                                                        style={HEAD}
                                                        aria-label={`Slot ${originalIndex + 1} content type`}
                                                    >
                                                        {CONTENT_TYPES.map((c) => (
                                                            <option key={c} value={c} className="bg-[#0e0e0e]">
                                                                {c.replace('_', ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={slot.platform}
                                                        onChange={(e) => updateSlot(slot.key, { platform: e.target.value as Platform })}
                                                        className="brutal-input !p-2 !text-xs"
                                                        style={HEAD}
                                                        aria-label={`Slot ${originalIndex + 1} platform`}
                                                    >
                                                        <option value="INSTAGRAM" className="bg-[#0e0e0e]">Instagram</option>
                                                        <option value="TIKTOK" className="bg-[#0e0e0e]">TikTok</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlot(slot.key)}
                                                        className="w-8 h-8 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#93000a] hover:text-[#ffdad6] flex items-center justify-center"
                                                        aria-label="Remove slot"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        })()}

                        <div className="bg-[#1c1b1b] border-4 border-black p-4 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={addBlankSlot}
                                className="px-3 py-2 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                style={HEAD}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add slot
                            </button>
                            <p className="text-[10px] text-[#ab8981] italic" style={BODY}>
                                Tip: each slot becomes a draft post in the IDEA column. You can flesh out caption, hashtags, and visual direction in the workspace.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={commitAll}
                                disabled={submitting}
                                className="px-6 py-3 border-4 border-black bg-[#76dc83] text-[#00320f] text-sm font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 transition-all flex items-center gap-2"
                                style={HEAD}
                            >
                                {submitting ? (
                                    `CREATING ${slots.length}…`
                                ) : (
                                    <>
                                        Create {slots.length} post{slots.length === 1 ? '' : 's'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </fieldset>
                )}
                    </div>

                    {/* Chat panel — sticky on lg+ so it stays in view while
                        the admin scrolls the slot grid. */}
                    <div className="lg:sticky lg:top-6">
                        <CalendarChatPanel
                            clientSlug={clientSlug}
                            brandName={brandName}
                            brandPrimaryColor={brandPrimaryColor}
                            onApplySlots={applyProposedSlots}
                            onExecuteToolCall={handleExecuteToolCall}
                            currentSlots={slots}
                        />
                    </div>
                </div>
            </div>

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
                .brutal-input::placeholder { color: #353534; }
                .brutal-input:focus { border-color: #D83C14; }
            `}</style>
        </div>
    )
}

function Field({
    label,
    hint,
    children,
}: {
    label: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div>
            {label && (
                <label
                    className="block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2"
                    style={HEAD}
                >
                    {label}
                </label>
            )}
            {children}
            {hint && (
                <p className="text-[11px] text-[#ab8981] mt-1.5 italic" style={BODY}>
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
                            active
                                ? 'bg-[#D83C14] text-white'
                                : 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]'
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
