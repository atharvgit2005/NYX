'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { AdminPost } from '../PostsWorkspaceClient'

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
  NEEDS_REVISION: '#E8441A',
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
  // Anchor the grid to the earliest scheduled post (or today).
  const initial = useMemo(() => {
    if (posts.length === 0) return startOfMonth(new Date())
    const earliest = posts.reduce((acc, p) => {
      const d = new Date(p.scheduledDate)
      return d < acc ? d : acc
    }, new Date(posts[0].scheduledDate))
    return startOfMonth(earliest)
  }, [posts])

  const [anchor, setAnchor] = useState(initial)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const monthLabel = anchor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  // Build a 6-row × 7-col grid starting from the Sunday before the 1st.
  const cells: Date[] = useMemo(() => {
    const first = new Date(anchor)
    const startWeekday = first.getUTCDay()
    const start = new Date(first)
    start.setUTCDate(first.getUTCDate() - startWeekday)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      return d
    })
  }, [anchor])

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

  function shift(months: number) {
    const next = new Date(anchor)
    next.setUTCMonth(anchor.getUTCMonth() + months)
    setAnchor(startOfMonth(next))
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="border-4 border-black bg-[#1c1b1b]">
        <div
          className="flex items-center justify-between px-4 py-3 border-b-4 border-black"
          style={{ backgroundColor: '#0e0e0e' }}
        >
          <button
            onClick={() => shift(-1)}
            className="px-3 py-1 border-2 border-black bg-[#1c1b1b] text-xs font-bold uppercase tracking-widest hover:bg-[#E8441A] hover:text-white"
            style={HEAD}
          >
            ← PREV
          </button>
          <span
            className="text-base md:text-xl font-black uppercase tracking-tighter"
            style={HEAD}
          >
            {monthLabel}
          </span>
          <button
            onClick={() => shift(1)}
            className="px-3 py-1 border-2 border-black bg-[#1c1b1b] text-xs font-bold uppercase tracking-widest hover:bg-[#E8441A] hover:text-white"
            style={HEAD}
          >
            NEXT →
          </button>
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
            const inMonth = d.getUTCMonth() === anchor.getUTCMonth()
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
            className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#E8441A] hover:text-white flex items-center justify-center"
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
          className="absolute inset-0 mt-7 m-1 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-[#ab8981] hover:text-[#E8441A]"
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
      className="text-[10px] uppercase font-bold tracking-tight border-2 border-black px-1.5 py-1 cursor-grab active:cursor-grabbing truncate"
      title={post.title}
    >
      [{TYPE_LABEL[post.contentType]}] {post.title}
    </div>
  )
}
