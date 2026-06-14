'use client'

import { useMemo } from 'react'

/**
 * Phase 5 — admin-only drag layer for the partner-canvas calendar.
 *
 * Renders the desktop month grid with dnd-kit primitives so admin can:
 *   • drag a chip onto a different day → onMoveDate
 *   • click a chip → onEditPost
 *   • click an empty day → onCreateOnDay
 *
 * Loaded only when viewerIsAdmin via a dynamic( … ) import inside
 * CalendarView, so partners never pull dnd-kit into their bundle.
 *
 * Mirrors the visual layout of CalendarView's partner grid by
 * intention — divergence here would be a regression.
 */

import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import { dndScreenReaderInstructions, makeDndAnnouncements } from '@/lib/portal/dnd-a11y'

// Space picks up / drops a chip so Enter stays free to open the post.
const KEYBOARD_CODES = {
    start: ['Space'],
    cancel: ['Escape'],
    end: ['Space'],
}
import {
    CONTENT_TYPE_LABEL,
    POST_STATUS_LABEL,
    STATUS_COLORS,
    TYPE_COLORS,
} from '@/lib/portal/content-types'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
    posts: SerializedPost[]
    brand: BrandConfig
    /** ISO YYYY-MM-DD for "today" in the brand's reference frame. */
    today: string
    /** Year + 0-indexed month for the grid. */
    monthYear: number
    monthIndex: number
    /** Day-of-month range covered by the campaign (for soft-shading
     *  in-campaign cells). */
    campaignFirst: number
    campaignLast: number
    /** Pre-built day cells — one per slot in the 6×7 grid; null = padding. */
    days: (number | null)[]
    /** Pre-grouped posts by YYYY-MM-DD. */
    byDate: Record<string, SerializedPost[]>
    onEditPost: (post: SerializedPost) => void
    onCreateOnDay: (isoDate: string) => void
    onMoveDate: (id: string, isoDate: string) => void
}

function pad(n: number) {
    return String(n).padStart(2, '0')
}

function dateKey(iso: string) {
    return iso.slice(0, 10)
}

export default function CalendarAdminLayer({
    posts,
    brand,
    today,
    monthYear,
    monthIndex,
    campaignFirst,
    campaignLast,
    days,
    byDate,
    onEditPost,
    onCreateOnDay,
    onMoveDate,
}: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { keyboardCodes: KEYBOARD_CODES }),
    )

    const announcements = useMemo(
        () =>
            makeDndAnnouncements(
                (id) => posts.find((p) => p.id === id)?.title ?? 'post',
            ),
        [posts],
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        const postId = String(active.id)
        const targetIso = String(over.id) // YYYY-MM-DD
        const post = posts.find((p) => p.id === postId)
        if (!post) return
        if (dateKey(post.scheduledDate) === targetIso) return
        onMoveDate(postId, targetIso + 'T00:00:00.000Z')
    }

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            accessibility={{
                announcements,
                screenReaderInstructions: dndScreenReaderInstructions,
            }}
        >
            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    const dateStr = day
                        ? `${monthYear}-${pad(monthIndex + 1)}-${pad(day)}`
                        : null
                    const cellPosts = dateStr ? byDate[dateStr] ?? [] : []
                    const isToday = dateStr === today
                    const hasPosts = cellPosts.length > 0
                    const inCampaign =
                        day !== null && day >= campaignFirst && day <= campaignLast
                    const isLastRow = i >= days.length - 7

                    const baseStyle: React.CSSProperties = {
                        borderRight:
                            (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
                        borderBottom: !isLastRow ? '1px solid #F0EDE6' : 'none',
                        background: isToday
                            ? `${brand.brand.primary}0D`
                            : hasPosts && inCampaign
                              ? '#FAF7F2'
                              : 'transparent',
                        // Strong today outline (inset so it doesn't collide
                        // with the grid divider lines). Matches CalendarView.
                        boxShadow: isToday
                            ? `inset 0 0 0 2px ${brand.brand.primary}`
                            : undefined,
                    }

                    const cellInner = (
                        <>
                            {day !== null && (
                                <div className="flex justify-between items-center mb-1.5">
                                    <span
                                        className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors"
                                        style={{
                                            background: isToday
                                                ? brand.brand.primary
                                                : 'transparent',
                                            color: isToday
                                                ? '#FFFFFF'
                                                : inCampaign
                                                  ? '#1A2A5E'
                                                  : '#C0BAB0',
                                        }}
                                    >
                                        {day}
                                    </span>
                                    {dateStr && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onCreateOnDay(dateStr)
                                            }}
                                            // Always-visible faint affordance
                                            // on in-campaign days; ramps up
                                            // on cell hover. Off-campaign
                                            // days stay invisible-until-hover
                                            // so the grid doesn't look noisy.
                                            className={`transition-opacity w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold focus-visible:opacity-100 ${
                                                inCampaign
                                                    ? 'opacity-40 group-hover:opacity-100'
                                                    : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                            style={{
                                                background: '#FFFFFF',
                                                color: brand.brand.primary,
                                                border: `1px solid ${brand.brand.primary}30`,
                                            }}
                                            aria-label={`Add post on ${dateStr}`}
                                            title={`Add post on ${dateStr}`}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                {cellPosts.map((post) => (
                                    <DraggableChip
                                        key={post.id}
                                        post={post}
                                        onClick={() => onEditPost(post)}
                                    />
                                ))}
                            </div>
                            {day !== null &&
                                cellPosts.length === 0 &&
                                dateStr && (
                                    <button
                                        type="button"
                                        onClick={() => onCreateOnDay(dateStr)}
                                        className={`absolute inset-0 mt-7 m-1 transition-opacity flex items-center justify-center text-xs font-medium rounded-lg ${
                                            inCampaign
                                                ? 'opacity-30 hover:opacity-100'
                                                : 'opacity-0 hover:opacity-100'
                                        }`}
                                        style={{
                                            color: brand.brand.primary,
                                            background: `${brand.brand.primary}08`,
                                            border: inCampaign
                                                ? `1px dashed ${brand.brand.primary}30`
                                                : 'none',
                                        }}
                                        aria-label={`Add post on ${dateStr}`}
                                    >
                                        + Add
                                    </button>
                                )}
                        </>
                    )

                    if (dateStr) {
                        return (
                            <DroppableDay
                                key={i}
                                dayIso={dateStr}
                                style={baseStyle}
                            >
                                {cellInner}
                            </DroppableDay>
                        )
                    }
                    return (
                        <div
                            key={i}
                            className="group min-h-[88px] md:min-h-[104px] p-2 relative transition-colors"
                            style={baseStyle}
                        >
                            {cellInner}
                        </div>
                    )
                })}
            </div>
        </DndContext>
    )
}

// ── chip ───────────────────────────────────────────────────────────────

function DraggableChip({
    post,
    onClick,
}: {
    post: SerializedPost
    onClick: () => void
}) {
    const colors = TYPE_COLORS[post.contentType]
    const statusColors = STATUS_COLORS[post.status]
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: post.id })
    const style: React.CSSProperties = {
        background: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.dot}`,
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    }
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                if (!isDragging) {
                    e.stopPropagation()
                    onClick()
                }
            }}
            onKeyDown={(e) => {
                // Space (handled by the keyboard sensor) drags; Enter opens.
                if (e.key === 'Enter') {
                    e.preventDefault()
                    onClick()
                    return
                }
                listeners?.onKeyDown?.(e)
            }}
            aria-label={`${post.title} — press Enter to open, Space to drag`}
            className="group/chip relative w-full text-left px-1.5 py-1 rounded-lg text-xs font-medium leading-tight transition-all hover:scale-[1.02] select-none"
            style={style}
            title={`${post.title} · ${POST_STATUS_LABEL[post.status]} · ${CONTENT_TYPE_LABEL[post.contentType]} (drag to reschedule)`}
        >
            {/* Status dot — top-right corner, ring colour matches the
                chip background so it reads as a sticker rather than part
                of the type colour family. */}
            <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{
                    background: statusColors.dot,
                    boxShadow: `0 0 0 1.5px ${colors.bg}`,
                }}
                aria-hidden
            />
            {/* Drag-handle grip — opacity-0 by default, ramps up on chip
                hover so admin sees there's something to grab. Pointer
                events through so the listeners on the wrapper still fire. */}
            <span
                className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/chip:opacity-50 transition-opacity pointer-events-none leading-none"
                style={{ color: colors.text, fontSize: '10px' }}
                aria-hidden
            >
                ⋮⋮
            </span>
            <span className="block truncate pr-3 pl-1.5">{post.title}</span>
        </div>
    )
}

// ── droppable day cell ─────────────────────────────────────────────────

function DroppableDay({
    dayIso,
    style,
    children,
}: {
    dayIso: string
    style?: React.CSSProperties
    children: React.ReactNode
}) {
    const { setNodeRef, isOver } = useDroppable({ id: dayIso })
    return (
        <div
            ref={setNodeRef}
            className="group min-h-[88px] md:min-h-[104px] p-2 relative transition-colors"
            style={{
                ...style,
                background: isOver
                    ? 'rgba(233, 30, 140, 0.12)'
                    : style?.background,
                outline: isOver
                    ? '2px dashed rgba(233, 30, 140, 0.4)'
                    : undefined,
                outlineOffset: isOver ? '-2px' : undefined,
            }}
        >
            {children}
        </div>
    )
}
