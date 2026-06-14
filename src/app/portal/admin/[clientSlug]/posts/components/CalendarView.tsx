'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { AdminPost } from '../PostsWorkspaceClient'
import { dndScreenReaderInstructions, makeDndAnnouncements } from '@/lib/portal/dnd-a11y'

// Space picks up / drops a chip so Enter stays free to open the post editor.
const KEYBOARD_CODES = {
  start: ['Space'],
  cancel: ['Escape'],
  end: ['Space'],
}

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

const TYPE_LABEL: Record<AdminPost['contentType'], string> = {
  REEL: 'REEL',
  CAROUSEL: 'CAR',
  STATIC_POST: 'POST',
  STORY: 'STORY',
  REEL_STORY: 'R+S',
}

const STATUS_ACCENT: Record<AdminPost['status'], string> = {
  IDEA: '#5b403a',
  DRAFTING: '#ab8981',
  NEEDS_APPROVAL: '#ffd65b',
  NEEDS_REVISION: '#D83C14',
  APPROVED: '#76dc83',
  POSTED: '#3da452',
}

interface Props {
  posts: AdminPost[]
  onMoveDate: (id: string, scheduledDate: string) => void
  onClickPost: (post: AdminPost) => void
  onCreateOnDay: (isoDay: string) => void
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export default function CalendarView({
  posts,
  onMoveDate,
  onClickPost,
  onCreateOnDay,
}: Props) {
  // Anchor the grid to the earliest scheduled post (or today), and
  // pre-compute how many months the post range spans so we can default
  // the view to cover them — otherwise a campaign that crosses month
  // boundaries (e.g. May→June) lands its tail off-screen until the
  // admin manually clicks NEXT.
  const { initial, defaultMonths } = useMemo(() => {
    if (posts.length === 0) {
      return { initial: startOfMonth(new Date()), defaultMonths: 1 }
    }
    let earliest = new Date(posts[0].scheduledDate)
    let latest = earliest
    for (const p of posts) {
      const d = new Date(p.scheduledDate)
      if (d < earliest) earliest = d
      if (d > latest) latest = d
    }
    const monthSpan =
      (latest.getUTCFullYear() - earliest.getUTCFullYear()) * 12 +
      (latest.getUTCMonth() - earliest.getUTCMonth()) +
      1
    // Snap up to the next supported step so the picker can still toggle.
    const supported = [1, 2, 3, 6]
    const months = supported.find((m) => m >= monthSpan) ?? 6
    return { initial: startOfMonth(earliest), defaultMonths: months }
  }, [posts])

  const [anchor, setAnchor] = useState(initial)
  const [displayMonths, setDisplayMonths] = useState<number>(defaultMonths)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { keyboardCodes: KEYBOARD_CODES }),
  )

  const announcements = useMemo(
    () =>
      makeDndAnnouncements(
        (id) => posts.find((p) => p.id === id)?.title ?? 'post',
      ),
    [posts],
  )

  // Generate list of all unique months in the campaign range (earliest post to latest post, padded)
  const allMonthsInRange = useMemo(() => {
    let earliest = startOfMonth(new Date())
    let latest = startOfMonth(new Date())
    if (posts.length > 0) {
      const dates = posts.map((p) => new Date(p.scheduledDate))
      earliest = startOfMonth(new Date(Math.min(...dates.map((d) => d.getTime()))))
      latest = startOfMonth(new Date(Math.max(...dates.map((d) => d.getTime()))))
    }
    
    const list: Date[] = []
    const cursor = new Date(earliest)
    // Start 2 months before earliest
    cursor.setUTCMonth(cursor.getUTCMonth() - 2)
    const end = new Date(latest)
    // End 2 months after latest
    end.setUTCMonth(end.getUTCMonth() + 2)
    
    let count = 0
    while (cursor <= end && count < 36) {
      list.push(new Date(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
      count++
    }
    return list
  }, [posts])

  // Track active month slider index
  const [sliderIndex, setSliderIndex] = useState(() => {
    const idx = allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === initial.getUTCFullYear() &&
        m.getUTCMonth() === initial.getUTCMonth()
    )
    return idx !== -1 ? idx : 0
  })

  // Sync sliderIndex when anchor changes (e.g. from PREV/NEXT buttons)
  useEffect(() => {
    const idx = allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === anchor.getUTCFullYear() &&
        m.getUTCMonth() === anchor.getUTCMonth()
    )
    if (idx !== -1 && idx !== sliderIndex) {
      setSliderIndex(idx)
    }
  }, [anchor, allMonthsInRange, sliderIndex])

  const months = useMemo(() => {
    const list: Date[] = []
    const current = new Date(anchor)
    for (let i = 0; i < displayMonths; i++) {
      list.push(new Date(current))
      current.setUTCMonth(current.getUTCMonth() + 1)
    }
    return list
  }, [anchor, displayMonths])

  const monthLabel = anchor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const cellsForMonth = (monthAnchor: Date) => {
    const first = new Date(monthAnchor)
    const startWeekday = first.getUTCDay()
    const start = new Date(first)
    start.setUTCDate(first.getUTCDate() - startWeekday)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      return d
    })
  }

  const byDay = useMemo(() => {
    const m: Record<string, AdminPost[]> = {}
    for (const p of posts) {
      const k = isoDay(new Date(p.scheduledDate))
      ;(m[k] ??= []).push(p)
    }
    return m
  }, [posts])

  function onDragEnd(e: DragEndEvent) {
    if (!e.over) return
    const targetDay = String(e.over.id)
    const post = posts.find((p) => p.id === String(e.active.id))
    if (!post) return
    if (isoDay(new Date(post.scheduledDate)) === targetDay) return
    onMoveDate(post.id, targetDay + 'T00:00:00.000Z')
  }

  function shift(monthsCount: number) {
    const next = new Date(anchor)
    next.setUTCMonth(anchor.getUTCMonth() + monthsCount)
    setAnchor(startOfMonth(next))
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: dndScreenReaderInstructions,
      }}
    >
      <div className="border-4 border-black bg-[#1c1b1b]">
        <div
          className="flex flex-wrap items-center justify-between px-4 py-3 border-b-4 border-black gap-3"
          style={{ backgroundColor: '#0e0e0e' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => shift(-displayMonths)}
              className="px-3 py-1 border-2 border-black bg-[#1c1b1b] text-xs font-bold uppercase tracking-widest hover:bg-[#D83C14] hover:text-white"
              style={HEAD}
            >
              ← PREV
            </button>
            <button
              onClick={() => shift(displayMonths)}
              className="px-3 py-1 border-2 border-black bg-[#1c1b1b] text-xs font-bold uppercase tracking-widest hover:bg-[#D83C14] hover:text-white"
              style={HEAD}
            >
              NEXT →
            </button>
          </div>
          
          <span
            className="text-sm md:text-lg font-black uppercase tracking-tighter"
            style={HEAD}
          >
            {monthLabel} {displayMonths > 1 ? ` — ${months[months.length - 1].toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}` : ''}
          </span>

          <div className="flex border-2 border-black overflow-hidden bg-[#0e0e0e]" style={HEAD}>
            {([1, 2, 3, 6] as const).map((m) => {
              const active = displayMonths === m
              return (
                <button
                  key={m}
                  onClick={() => setDisplayMonths(m)}
                  className={`px-2.5 py-1 text-[10px] font-bold border-r last:border-r-0 border-black transition-all ${
                    active ? 'bg-[#D83C14] text-white' : 'bg-[#1c1b1b] text-[#e4beb5] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {m}M VIEW
                </button>
              )
            })}
          </div>
        </div>

        {/* Month Slider Timeline */}
        {allMonthsInRange.length > 1 && (
          <div className="px-6 py-4 border-b-4 border-black bg-[#141313] space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#ab8981]">
              <span>Timeline Navigation</span>
              <span className="text-[#D83C14] animate-pulse">
                * Slide to change focus month
              </span>
            </div>
            <div className="relative pt-2">
              <input
                type="range"
                min="0"
                max={allMonthsInRange.length - 1}
                value={sliderIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value)
                  setSliderIndex(idx)
                  if (allMonthsInRange[idx]) {
                    setAnchor(allMonthsInRange[idx])
                  }
                }}
                className="brutal-slider cursor-pointer"
              />
              <div className="flex justify-between mt-2 overflow-x-auto gap-2 py-1 scrollbar-thin">
                {allMonthsInRange.map((m, idx) => {
                  const label = m.toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit',
                    timeZone: 'UTC',
                  }).toUpperCase()
                  const active = idx === sliderIndex
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSliderIndex(idx)
                        setAnchor(m)
                      }}
                      className={`text-[9px] font-mono font-bold tracking-tighter uppercase whitespace-nowrap transition-colors px-1 py-0.5 border ${
                        active
                          ? 'text-[#000] bg-[#D83C14] border-black font-black shadow-[2px_2px_0_#000]'
                          : 'text-[#ab8981] border-transparent hover:text-white hover:border-[#ab8981]'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <style>{`
              .brutal-slider {
                -webkit-appearance: none;
                width: 100%;
                height: 12px;
                background: #0e0e0e;
                border: 3px solid #000;
                outline: none;
              }
              .brutal-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                background: #D83C14;
                border: 3px solid #000;
                cursor: pointer;
                transition: transform 0.1s;
              }
              .brutal-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
              }
              .brutal-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                background: #D83C14;
                border: 3px solid #000;
                cursor: pointer;
              }
            `}</style>
          </div>
        )}

        <div className="divide-y-4 divide-black">
          {months.map((monthAnchor) => {
            const label = monthAnchor.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })
            const cells = cellsForMonth(monthAnchor)

            return (
              <div key={monthAnchor.toISOString()} className="bg-[#1c1b1b]">
                <div className="px-4 py-2 bg-[#141313] border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-[#D83C14]" style={HEAD}>
                  * {label}
                </div>
                <div className="grid grid-cols-7">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <div
                      key={d}
                      className="px-2 py-2 border-b-4 border-r-4 last:border-r-0 border-black text-[10px] uppercase tracking-widest font-bold text-[#e4beb5]"
                      style={{ ...HEAD, backgroundColor: '#0e0e0e' }}
                    >
                      {d}
                    </div>
                  ))}

                  {cells.map((d, i) => {
                    const dayKey = isoDay(d)
                    const inMonth = d.getUTCMonth() === monthAnchor.getUTCMonth()
                    const dayPosts = byDay[dayKey] ?? []
                    return (
                      <DayCell
                        key={dayKey + i}
                        date={d}
                        inMonth={inMonth}
                        posts={dayPosts}
                        onClickPost={onClickPost}
                        onCreateOnDay={onCreateOnDay}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}

function DayCell({
  date,
  inMonth,
  posts,
  onClickPost,
  onCreateOnDay,
}: {
  date: Date
  inMonth: boolean
  posts: AdminPost[]
  onClickPost: (post: AdminPost) => void
  onCreateOnDay: (isoDay: string) => void
}) {
  const dayKey = isoDay(date)
  const { setNodeRef, isOver } = useDroppable({ id: dayKey })

  return (
    <div
      ref={setNodeRef}
      className={`group relative min-h-[120px] border-r-4 last:border-r-0 border-b-4 border-black p-2 ${
        inMonth ? 'bg-[#1c1b1b]' : 'bg-[#0e0e0e]'
      } ${isOver ? 'bg-[#2a2a2a]' : ''}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ ...HEAD, color: inMonth ? '#e5e2e1' : '#5b403a' }}
        >
          {date.getUTCDate()}
        </span>
        {inMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCreateOnDay(dayKey)
            }}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity w-5 h-5 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white flex items-center justify-center"
            aria-label={`Create post on ${dayKey}`}
            title={`Create post on ${dayKey}`}
          >
            <span className="material-symbols-outlined !text-xs leading-none" aria-hidden>
              add
            </span>
          </button>
        )}
      </div>
      <div className="space-y-1">
        {posts.map((p) => (
          <DayChip key={p.id} post={p} onClick={() => onClickPost(p)} />
        ))}
      </div>
      {inMonth && posts.length === 0 && (
        <button
          type="button"
          onClick={() => onCreateOnDay(dayKey)}
          className="absolute inset-0 mt-7 m-1 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-[#ab8981] hover:text-[#D83C14]"
          style={HEAD}
          aria-label={`Create post on ${dayKey}`}
        >
          + ADD_POST
        </button>
      )}
    </div>
  )
}

function DayChip({ post, onClick }: { post: AdminPost; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    ...HEAD,
    backgroundColor: STATUS_ACCENT[post.status],
    color: '#0e0e0e',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onClick()
        }
      }}
      onKeyDown={(e) => {
        // Space (handled by the keyboard sensor) drags; Enter opens the post.
        if (e.key === 'Enter') {
          e.preventDefault()
          onClick()
          return
        }
        listeners?.onKeyDown?.(e)
      }}
      aria-label={`${post.title} — press Enter to open, Space to drag`}
      className="text-[10px] uppercase font-bold tracking-tight border-2 border-black px-1.5 py-1 cursor-grab active:cursor-grabbing truncate"
      title={post.title}
    >
      [{TYPE_LABEL[post.contentType]}] {post.title}
    </div>
  )
}
