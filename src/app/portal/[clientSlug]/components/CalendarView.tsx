'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  CONTENT_TYPE_LABEL,
  POST_STATUS_LABEL,
  STATUS_COLORS,
  TYPE_COLORS,
} from '@/lib/portal/content-types'
import type { ContentType } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'
import {
  Film,
  Layers,
  Image as ImageIcon,
  BookOpen,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'


interface Props {
  posts: SerializedPost[]
  brand: BrandConfig
  /** Partner-side click handler (read-only PostModal). */
  onSelectPost: (post: SerializedPost) => void
  /** When true, switches the calendar into edit mode: drag chips between
   *  days, click chip → open editor, click empty day → create on that
   *  day. The dnd-kit-backed layer is dynamic-imported only when this
   *  is set, so partner traffic doesn't bundle it. */
  viewerIsAdmin?: boolean
  /** Admin-only: open the editor for this post. */
  onEditPost?: (post: SerializedPost) => void
  /** Admin-only: open the create-modal prefilled with `isoDate`. */
  onCreateOnDay?: (isoDate: string) => void
  /** Admin-only: drag-reschedule landed on a different day. */
  onMoveDate?: (id: string, isoDate: string) => void
}

// Code-split the admin drag layer. Partners never load this chunk —
// `viewerIsAdmin` is checked before the dynamic component renders, and
// `ssr: false` keeps it client-only so it doesn't ship in the SSR bundle.
const CalendarAdminLayer = dynamic(() => import('./CalendarAdminLayer'), {
  ssr: false,
  loading: () => (
    // Match the desktop grid skeleton so admin doesn't get a layout flash
    // while the chunk fetches. Six rows × seven cols of empty cells.
    <div className="grid grid-cols-7">
      {Array.from({ length: 42 }).map((_, i) => (
        <div
          key={i}
          className="min-h-[88px] md:min-h-[104px]"
          style={{
            borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
            borderBottom: i < 35 ? '1px solid #F0EDE6' : 'none',
          }}
        />
      ))}
    </div>
  ),
})

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  // Monday-start: 0=Mon..6=Sun
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function dateKey(iso: string) {
  return iso.slice(0, 10) // YYYY-MM-DD
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Monday-start ISO week key — used to group the mobile timeline.
function weekKey(iso: string): string {
  const d = new Date(iso)
  const dow = (d.getDay() + 6) % 7 // 0 = Mon
  const monday = new Date(d)
  monday.setDate(d.getDate() - dow)
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
}

function formatWeekLabel(mondayIso: string): string {
  const monday = new Date(mondayIso + 'T00:00:00')
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const sameMonth = monday.getMonth() === sunday.getMonth()
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString('en-IN', {
      day: 'numeric',
      ...(withMonth ? { month: 'short' } : {}),
    })
  return `${fmt(monday, !sameMonth)} – ${fmt(sunday, true)}`
}

function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export default function CalendarView({
  posts,
  brand,
  onSelectPost,
  viewerIsAdmin,
  onEditPost,
  onCreateOnDay,
  onMoveDate,
}: Props) {
  // Generate list of all unique months in the campaign range (earliest post to latest post, padded)
  const allMonthsInRange = useMemo(() => {
    let earliest = startOfMonth(new Date())
    let latest = startOfMonth(new Date())
    if (posts.length > 0) {
      const dates = posts.map((p) => new Date(p.scheduledDate))
      earliest = startOfMonth(new Date(Math.min(...dates.map((d) => d.getTime()))))
      latest = startOfMonth(new Date(Math.max(...dates.map((d) => d.getTime()))))
    } else {
      earliest = new Date(Date.UTC(brand.campaign.monthYear, brand.campaign.monthIndex, 1))
      latest = new Date(Date.UTC(brand.campaign.monthYear, brand.campaign.monthIndex, 1))
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
  }, [posts, brand])

  // Get index of the current real-world month in range
  const initialIndex = useMemo(() => {
    const todayDate = new Date()
    const currentMonthIdx = allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === todayDate.getFullYear() &&
        m.getUTCMonth() === todayDate.getMonth()
    )
    if (currentMonthIdx !== -1) return currentMonthIdx

    // Fallback to brand configuration
    const configMonthIdx = allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === brand.campaign.monthYear &&
        m.getUTCMonth() === brand.campaign.monthIndex
    )
    return configMonthIdx !== -1 ? configMonthIdx : 0
  }, [allMonthsInRange, brand])

  const [activeYear, setActiveYear] = useState(() => allMonthsInRange[initialIndex].getUTCFullYear())
  const [activeMonthIdx, setActiveMonthIdx] = useState(() => allMonthsInRange[initialIndex].getUTCMonth())
  const [sliderIndex, setSliderIndex] = useState(initialIndex)

  const days = buildCalendarDays(activeYear, activeMonthIdx)

  const byDate: Record<string, SerializedPost[]> = {}
  for (const p of posts) {
    const k = dateKey(p.scheduledDate)
    byDate[k] = byDate[k] ? [...byDate[k], p] : [p]
  }

  const today = brand.campaign.referenceToday

  // Sync slider index when brand month configuration changes
  useEffect(() => {
    const idx = allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === brand.campaign.monthYear &&
        m.getUTCMonth() === brand.campaign.monthIndex
    )
    if (idx !== -1) {
      setSliderIndex(idx)
      setActiveYear(brand.campaign.monthYear)
      setActiveMonthIdx(brand.campaign.monthIndex)
    }
  }, [brand.campaign.monthYear, brand.campaign.monthIndex, allMonthsInRange])

  const [showSummary, setShowSummary] = useState(true)

  const monthNameLabel = useMemo(() => {
    return new Date(Date.UTC(activeYear, activeMonthIdx, 1)).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }, [activeYear, activeMonthIdx])

  // ── Mobile timeline: grouped by week with Today anchor ───────────────
  const activeMonthPosts = useMemo(() => {
    return posts.filter((p) => {
      const year = parseInt(p.scheduledDate.slice(0, 4), 10)
      const monthIdx = parseInt(p.scheduledDate.slice(5, 7), 10) - 1
      return year === activeYear && monthIdx === activeMonthIdx
    })
  }, [posts, activeYear, activeMonthIdx])

  const sortedPosts = useMemo(() => {
    return [...activeMonthPosts].sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
    )
  }, [activeMonthPosts])

  const weekGroups = useMemo(() => {
    const groups: { week: string; posts: SerializedPost[] }[] = []
    for (const p of sortedPosts) {
      const wk = weekKey(p.scheduledDate)
      const last = groups[groups.length - 1]
      if (last && last.week === wk) last.posts.push(p)
      else groups.push({ week: wk, posts: [p] })
    }
    return groups
  }, [sortedPosts])

  const summary = useMemo(() => {
    const total = activeMonthPosts.length
    let reels = 0
    let carousels = 0
    let photos = 0
    let stories = 0
    let posted = 0
    let approved = 0
    let pending = 0

    activeMonthPosts.forEach((p) => {
      if (p.contentType === 'REEL' || p.contentType === 'REEL_STORY') reels++
      else if (p.contentType === 'CAROUSEL') carousels++
      else if (p.contentType === 'STATIC_POST') photos++
      else if (p.contentType === 'STORY') stories++

      if (p.status === 'POSTED') posted++
      else if (p.status === 'APPROVED') approved++
      else pending++
    })

    const approvalRate = total > 0 ? Math.round(((posted + approved) / total) * 100) : 0

    return {
      total,
      reels,
      carousels,
      photos,
      stories,
      posted,
      approved,
      pending,
      approvalRate,
    }
  }, [activeMonthPosts])

  const campaignFirst = posts.length
    ? Math.min(...posts.map((p) => new Date(p.scheduledDate).getDate()))
    : 1
  const campaignLast = posts.length
    ? Math.max(...posts.map((p) => new Date(p.scheduledDate).getDate()))
    : 31

  // Only show legend entries for content types that actually appear this
  // month. Always shows nothing → fall back to the full set so the legend
  // never disappears on an empty month.
  const typesInUse = new Set<ContentType>(posts.map((p) => p.contentType))
  const legendTypes = (
    typesInUse.size > 0
      ? (Object.keys(TYPE_COLORS) as ContentType[]).filter((t) => typesInUse.has(t))
      : (Object.keys(TYPE_COLORS) as ContentType[])
  )

  // Click handler for the mobile timeline (admin or partner).
  function handleChipClick(post: SerializedPost) {
    if (viewerIsAdmin && onEditPost) onEditPost(post)
    else onSelectPost(post)
  }

  // Static partner-side desktop grid. dnd-kit-free.
  const partnerGrid = (
    <div className="grid grid-cols-7">
      {days.map((day, i) => {
        const dateStr = day ? `${activeYear}-${pad(activeMonthIdx + 1)}-${pad(day)}` : null
        const cellPosts = dateStr ? byDate[dateStr] ?? [] : []
        const isToday = dateStr === today
        const hasPosts = cellPosts.length > 0
        const inCampaign = day !== null && day >= campaignFirst && day <= campaignLast
        const isLastRow = i >= days.length - 7

        return (
          <div
            key={i}
            className="min-h-[88px] md:min-h-[104px] p-2 relative transition-colors"
            style={{
              borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
              borderBottom: !isLastRow ? '1px solid #F0EDE6' : 'none',
              background: isToday
                ? `${brand.brand.primary}0D`
                : hasPosts && inCampaign
                  ? '#FAF7F2'
                  : 'transparent',
              // Strong today outline — inset so it doesn't collide with the
              // grid divider lines.
              boxShadow: isToday
                ? `inset 0 0 0 2px ${brand.brand.primary}`
                : undefined,
            }}
          >
            {day !== null && (
              <>
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: isToday ? brand.brand.primary : 'transparent',
                      color: isToday
                        ? '#FFFFFF'
                        : inCampaign
                          ? '#1A2A5E'
                          : '#C0BAB0',
                    }}
                  >
                    {day}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {cellPosts.map((post) => (
                    <ChipReadOnly
                      key={post.id}
                      post={post}
                      onClick={() => onSelectPost(post)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )

  // Where does Today fall? Render a slim divider above the first post on
  // or after today, so admin/partner can find "now" in the scroll.
  const todayMs = today ? new Date(today + 'T00:00:00').getTime() : null
  const todayAnchorId = useMemo(() => {
    if (todayMs === null) return null
    const anchor = sortedPosts.find(
      (p) => new Date(dateKey(p.scheduledDate) + 'T00:00:00').getTime() >= todayMs,
    )
    return anchor?.id ?? null
  }, [sortedPosts, todayMs])

  return (
    <div className="space-y-6">
      {/* Month Slider Timeline */}
      {allMonthsInRange.length > 1 && (
        <div 
          className="p-5 rounded-2xl bg-white space-y-3 shadow-sm"
          style={{ border: '1px solid #E8E4DC' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#6B6B6B]">
            <span>Timeline Navigation</span>
            <span style={{ color: brand.brand.primary }} className="font-bold">
              Active Month: {monthNameLabel}
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
                const targetMonth = allMonthsInRange[idx]
                if (targetMonth) {
                  setActiveYear(targetMonth.getUTCFullYear())
                  setActiveMonthIdx(targetMonth.getUTCMonth())
                }
              }}
              className="portal-slider cursor-pointer"
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
                      setActiveYear(m.getUTCFullYear())
                      setActiveMonthIdx(m.getUTCMonth())
                    }}
                    className="text-xs font-semibold tracking-tighter uppercase whitespace-nowrap transition-all px-3 py-1.5 rounded-full border"
                    style={{
                      background: active ? brand.brand.primary : 'transparent',
                      color: active ? '#FFFFFF' : '#6B6B6B',
                      borderColor: active ? brand.brand.primary : '#E8E4DC',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <style>{`
            .portal-slider {
              -webkit-appearance: none;
              width: 100%;
              height: 8px;
              background: #FAF7F2;
              border: 1px solid #E8E4DC;
              border-radius: 9999px;
              outline: none;
            }
            .portal-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 9999px;
              background: ${brand.brand.primary};
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              cursor: pointer;
            }
            .portal-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 9999px;
              background: ${brand.brand.primary};
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              cursor: pointer;
            }
          `}</style>
        </div>
      )}

      {/* Month Summary Section */}
      <div 
        className="p-5 rounded-2xl bg-white space-y-4 shadow-sm"
        style={{ border: '1px solid #E8E4DC' }}
      >
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#1A2A5E]" style={{ color: brand.brand.primary }} />
            <span className="text-sm font-bold uppercase tracking-wider text-[#1A2A5E]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Month Summary ({monthNameLabel})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] font-semibold">
            <span>{showSummary ? 'Collapse' : 'Expand'}</span>
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSummary && (
          <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-5 transition-all">
            {/* Total & Approval Progress */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DC] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6B6B]">Approval Progress</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl font-black text-[#1A2A5E]">{summary.approvalRate}%</span>
                  <span className="text-xs text-[#6B6B6B] font-medium">Approved / Posted</span>
                </div>
              </div>
              <div className="w-full bg-[#E8E4DC] rounded-full h-2">
                <div 
                  className="rounded-full h-2 transition-all duration-500" 
                  style={{ 
                    width: `${summary.approvalRate}%`,
                    background: `linear-gradient(90deg, ${brand.brand.primary} 0%, ${brand.brand.accent || brand.brand.primary} 100%)`
                  }}
                />
              </div>
              <p className="text-xs text-[#6B6B6B] font-medium">
                {summary.posted + summary.approved} of {summary.total} posts ready or live
              </p>
            </div>

            {/* Content Formats Mix */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DC] space-y-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6B6B]">Content Format Mix</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#F0EDE6]">
                  <Film className="w-4 h-4 text-[#E91E8C]" />
                  <span className="text-[#6B6B6B]">{summary.reels} Reels</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#F0EDE6]">
                  <Layers className="w-4 h-4 text-[#0078A8]" />
                  <span className="text-[#6B6B6B]">{summary.carousels} Carousels</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#F0EDE6]">
                  <ImageIcon className="w-4 h-4 text-[#1A2A5E]" />
                  <span className="text-[#6B6B6B]">{summary.photos} Photos</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#F0EDE6]">
                  <BookOpen className="w-4 h-4 text-[#E91E8C]" />
                  <span className="text-[#6B6B6B]">{summary.stories} Stories</span>
                </div>
              </div>
            </div>

            {/* Workflow Stages */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DC] space-y-3">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B6B6B]">Workflow Stage</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#9C27B0' }} />
                    <span className="text-[#6B6B6B]">Posted / Live</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3E5F5] text-[#6A1B9A] text-[10px]">{summary.posted} posts</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#4CAF50' }} />
                    <span className="text-[#6B6B6B]">Approved</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px]">{summary.approved} posts</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FF9800' }} />
                    <span className="text-[#6B6B6B]">In Progress / Ideas</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] text-[10px]">{summary.pending} posts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: month grid */}
      <div
        className="hidden sm:block rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
      >
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #E8E4DC' }}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-3 text-center text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#6B6B6B' }}
            >
              {d}
            </div>
          ))}
        </div>

        {viewerIsAdmin && onEditPost && onCreateOnDay && onMoveDate ? (
          <CalendarAdminLayer
            posts={posts}
            brand={brand}
            today={today}
            monthYear={activeYear}
            monthIndex={activeMonthIdx}
            campaignFirst={campaignFirst}
            campaignLast={campaignLast}
            days={days}
            byDate={byDate}
            onEditPost={onEditPost}
            onCreateOnDay={onCreateOnDay}
            onMoveDate={onMoveDate}
          />
        ) : (
          partnerGrid
        )}

        <div
          className="px-5 py-4 flex flex-wrap gap-x-4 gap-y-2"
          style={{ borderTop: '1px solid #E8E4DC', background: '#FAF7F2' }}
        >
          {legendTypes.map((type) => {
            const c = TYPE_COLORS[type]
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                <span className="text-xs" style={{ color: '#6B6B6B' }}>
                  {CONTENT_TYPE_LABEL[type]}
                </span>
              </div>
            )
          })}
          {/* Today swatch — only when there's a today reference in the
              campaign month so the legend doesn't show a stray pill on
              months that aren't current. */}
          {today && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: brand.brand.primary,
                  boxShadow: `0 0 0 2px ${brand.brand.primary}33`,
                }}
              />
              <span className="text-xs" style={{ color: '#6B6B6B' }}>
                Today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: weekly grouped timeline */}
      <div className="sm:hidden space-y-5">
        {weekGroups.length === 0 && (
          <div
            className="rounded-2xl px-5 py-10 text-center"
            style={{
              background: '#FFFFFF',
              border: '1px dashed #E8E4DC',
              color: '#6B6B6B',
            }}
          >
            <p className="text-sm font-medium">No posts scheduled yet</p>
          </div>
        )}
        {weekGroups.map((group) => (
          <section key={group.week} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: '#6B6B6B' }}
              >
                Week of {formatWeekLabel(group.week)}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: '#E8E4DC' }}
              />
            </div>
            {group.posts.map((post) => {
              const colors = TYPE_COLORS[post.contentType]
              const statusColors = STATUS_COLORS[post.status]
              const isTodayAnchor = post.id === todayAnchorId
              return (
                <div key={post.id} className="space-y-2">
                  {isTodayAnchor && todayMs !== null && (
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: brand.brand.primary }}
                      />
                      <span
                        className="text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: brand.brand.primary }}
                      >
                        Today
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ background: `${brand.brand.primary}40` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleChipClick(post)}
                    className="w-full text-left rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8E4DC',
                      borderLeft: `4.5px solid ${colors.dot}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B]">
                        <span>#{post.position}</span>
                        <span>·</span>
                        <span>{formatLongDate(post.scheduledDate)}</span>
                      </div>
                      
                      <p
                        className="text-sm font-bold leading-snug line-clamp-2"
                        style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
                      >
                        {post.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {CONTENT_TYPE_LABEL[post.contentType]}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider"
                          style={{ background: statusColors.bg, color: statusColors.text }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusColors.dot }}
                          />
                          {POST_STATUS_LABEL[post.status]}
                        </span>
                      </div>
                    </div>

                    {/* Visual Preview on Right */}
                    {post.thumbnailUrl ? (
                      <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-[#E8E4DC] shadow-sm">
                        <img 
                          src={post.thumbnailUrl} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border border-[#E8E4DC] shadow-sm"
                        style={{ background: `${colors.dot}10` }}
                      >
                        {post.contentType === 'REEL' || post.contentType === 'REEL_STORY' ? (
                          <Film className="w-5 h-5" style={{ color: colors.dot }} />
                        ) : post.contentType === 'CAROUSEL' ? (
                          <Layers className="w-5 h-5" style={{ color: colors.dot }} />
                        ) : (
                          <ImageIcon className="w-5 h-5" style={{ color: colors.dot }} />
                        )}
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </section>
        ))}
        {viewerIsAdmin && onCreateOnDay && (
          <button
            type="button"
            onClick={() => {
              const today = new Date()
              const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
              onCreateOnDay(iso)
            }}
            className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors"
            style={{
              background: '#FFFFFF',
              border: `1px dashed ${brand.brand.primary}50`,
              color: brand.brand.primary,
            }}
          >
            <span className="text-base">+</span>
            <span className="text-sm font-medium">Add post</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ── Partner-side read-only chip ──────────────────────────────────────
//
// Renders the post title with status dot in the top-right corner. The
// content-type colour stays on the chip background + left border so the
// pre-Phase-5 visual language is preserved.
function ChipReadOnly({
  post,
  onClick,
}: {
  post: SerializedPost
  onClick: () => void
}) {
  const colors = TYPE_COLORS[post.contentType]
  const statusColors = STATUS_COLORS[post.status]
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left px-1.5 py-1 rounded-lg text-xs font-medium leading-tight transition-all hover:scale-[1.02]"
      style={{
        background: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.dot}`,
      }}
      title={`${post.title} · ${POST_STATUS_LABEL[post.status]}`}
    >
      <span
        className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
        style={{
          background: statusColors.dot,
          boxShadow: `0 0 0 1.5px ${colors.bg}`,
        }}
        aria-hidden
      />
      <span className="block truncate pr-3">{post.title}</span>
    </button>
  )
}
