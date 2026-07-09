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
  activeYear: number
  activeMonthIdx: number
  onMonthChange: (year: number, monthIdx: number) => void
  allMonthsInRange: Date[]
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
  activeYear,
  activeMonthIdx,
  onMonthChange,
  allMonthsInRange,
}: Props) {
  const days = buildCalendarDays(activeYear, activeMonthIdx)

  const byDate: Record<string, SerializedPost[]> = {}
  for (const p of posts) {
    const k = dateKey(p.scheduledDate)
    byDate[k] = byDate[k] ? [...byDate[k], p] : [p]
  }

  const today = brand.campaign.referenceToday

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)

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

  useEffect(() => {
    const todayDate = new Date()
    const isCurrentMonth = todayDate.getFullYear() === activeYear && todayDate.getMonth() === activeMonthIdx
    if (isCurrentMonth) {
      setSelectedDateStr(`${activeYear}-${pad(activeMonthIdx + 1)}-${pad(todayDate.getDate())}`)
    } else {
      const firstPost = sortedPosts[0]
      if (firstPost) {
        setSelectedDateStr(dateKey(firstPost.scheduledDate))
      } else {
        setSelectedDateStr(`${activeYear}-${pad(activeMonthIdx + 1)}-01`)
      }
    }
  }, [activeYear, activeMonthIdx, sortedPosts])

  const sliderIndex = useMemo(() => {
    return allMonthsInRange.findIndex(
      (m) =>
        m.getUTCFullYear() === activeYear &&
        m.getUTCMonth() === activeMonthIdx
    )
  }, [allMonthsInRange, activeYear, activeMonthIdx])

  const [monthlySummaryText, setMonthlySummaryText] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isSavingSummary, setIsSavingSummary] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  useEffect(() => {
    let active = true
    const fetchSummary = async () => {
      setIsLoadingSummary(true)
      try {
        const res = await fetch(`/api/portal/${brand.slug}/monthly-summary?year=${activeYear}&monthIndex=${activeMonthIdx}`)
        const data = await res.json()
        if (active) {
          setMonthlySummaryText(data.content ?? '')
        }
      } catch (err) {
        console.error('Failed to fetch monthly summary', err)
      } finally {
        if (active) {
          setIsLoadingSummary(false)
        }
      }
    }
    fetchSummary()
    return () => {
      active = false
    }
  }, [activeYear, activeMonthIdx, brand.slug])

  const handleSaveSummary = async () => {
    setIsSavingSummary(true)
    setShowSaveSuccess(false)
    try {
      await fetch(`/api/portal/${brand.slug}/monthly-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: activeYear,
          monthIndex: activeMonthIdx,
          content: monthlySummaryText,
        }),
      })
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save monthly summary', err)
    } finally {
      setIsSavingSummary(false)
    }
  }

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
        const isSelected = selectedDateStr === dateStr

        return (
          <div
            key={i}
            onClick={() => {
              if (dateStr) setSelectedDateStr(dateStr)
            }}
            className="min-h-[50px] sm:min-h-[88px] md:min-h-[104px] p-1 sm:p-2 relative transition-colors cursor-pointer select-none"
            style={{
              borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
              borderBottom: !isLastRow ? '1px solid #F0EDE6' : 'none',
              background: isToday
                ? `${brand.brand.primary}0D`
                : hasPosts && inCampaign
                  ? '#FAF7F2'
                  : 'transparent',
              // Strong outline if today or selected
              boxShadow: isSelected
                ? `inset 0 0 0 2px ${brand.brand.primary}`
                : isToday
                  ? `inset 0 0 0 2px ${brand.brand.primary}50`
                  : undefined,
            }}
          >
            {day !== null && (
              <>
                <div className="flex justify-between items-center mb-1 sm:mb-1.5">
                  <span
                    className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold transition-colors"
                    style={{
                      background: isToday
                        ? brand.brand.primary
                        : isSelected
                          ? `${brand.brand.primary}20`
                          : 'transparent',
                      color: isToday
                        ? '#FFFFFF'
                        : isSelected
                          ? brand.brand.primary
                          : inCampaign
                            ? '#1A2A5E'
                            : '#C0BAB0',
                      border: isSelected && !isToday ? `1px solid ${brand.brand.primary}` : 'none'
                    }}
                  >
                    {day}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {/* Desktop: full chip */}
                  <div className="hidden sm:block space-y-1">
                    {cellPosts.map((post) => (
                      <ChipReadOnly
                        key={post.id}
                        post={post}
                        onClick={() => onSelectPost(post)}
                      />
                    ))}
                  </div>
                  {/* Mobile: compact event lines */}
                  {cellPosts.length > 0 && (
                    <div className="sm:hidden flex flex-col gap-0.5 mt-0.5 items-stretch">
                      {cellPosts.map((post) => {
                        const colors = TYPE_COLORS[post.contentType]
                        return (
                          <div
                            key={post.id}
                            className="h-1 rounded-full w-full"
                            style={{ background: colors.dot }}
                            title={post.title}
                          />
                        )
                      })}
                    </div>
                  )}
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
                const targetMonth = allMonthsInRange[idx]
                if (targetMonth) {
                  onMonthChange(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth())
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
                      onMonthChange(m.getUTCFullYear(), m.getUTCMonth())
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

      {/* Month Preview Note Section */}
      <div 
        className="p-5 rounded-2xl bg-white space-y-4 shadow-sm transition-all"
        style={{ border: '1px solid #E8E4DC' }}
      >
        <div className="flex items-center gap-2 border-b border-[#FAF7F2] pb-2">
          <ImageIcon className="w-5 h-5 text-[#1A2A5E]" style={{ color: brand.brand.primary }} />
          <span className="text-sm font-bold uppercase tracking-wider text-[#1A2A5E]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {"Month's Visual Direction & Focus"}
          </span>
        </div>

        {viewerIsAdmin ? (
          <div className="space-y-3">
            <p className="text-xs text-[#6B6B6B]">
              {"Describe the theme, aesthetic, styling, or key focus for this month's content. Partners will see this note at the top of their calendar."}
            </p>
            <textarea
              value={monthlySummaryText}
              onChange={(e) => setMonthlySummaryText(e.target.value)}
              placeholder="e.g. This month focuses on launching the summer dessert collection. We will use bright, natural lighting, warm tones, and dynamic transition reels..."
              className="w-full min-h-[120px] p-3 border border-[#E8E4DC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A2A5E] bg-[#FAF7F2] text-sm resize-y"
              style={{ fontFamily: 'var(--font-portal-body)' }}
              disabled={isLoadingSummary}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveSummary}
                disabled={isSavingSummary || isLoadingSummary}
                className="px-4 py-2 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: brand.brand.primary }}
              >
                {isSavingSummary ? 'Saving...' : 'Save Notes'}
              </button>
              {showSaveSuccess && (
                <span className="text-xs font-semibold text-green-600 animate-pulse">
                  ✓ Notes saved successfully
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[60px] flex flex-col justify-center">
            {isLoadingSummary ? (
              <p className="text-xs text-[#6B6B6B] animate-pulse">Loading visual direction notes...</p>
            ) : monthlySummaryText ? (
              <div 
                className="text-sm leading-relaxed text-[#1A2A5E] whitespace-pre-wrap bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DC]"
                style={{ fontFamily: 'var(--font-portal-body)' }}
              >
                {monthlySummaryText}
              </div>
            ) : (
              <p className="text-xs italic text-[#6B6B6B] bg-[#FAF7F2] p-4 rounded-xl border border-dashed border-[#E8E4DC]">
                No specific visual direction notes set for this month yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Month grid (desktop & mobile) */}
      <div
        className="block rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
      >
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #E8E4DC' }}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold tracking-widest uppercase"
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
            selectedDateStr={selectedDateStr}
            onSelectDate={setSelectedDateStr}
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

      {/* Mobile only: selected day posts list */}
      <div className="sm:hidden space-y-4">
        {selectedDateStr && (
          <>
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A2A5E]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Posts for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-[10px] font-semibold text-[#6B6B6B]">
                {(byDate[selectedDateStr] ?? []).length} post{((byDate[selectedDateStr] ?? []).length) === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-3">
              {(byDate[selectedDateStr] ?? []).length === 0 ? (
                <div
                  className="rounded-2xl px-5 py-8 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1px dashed #E8E4DC',
                    color: '#6B6B6B',
                  }}
                >
                  <p className="text-xs font-medium">No posts scheduled for this day</p>
                </div>
              ) : (
                (byDate[selectedDateStr] ?? []).map((post) => {
                  const colors = TYPE_COLORS[post.contentType]
                  const statusColors = STATUS_COLORS[post.status]
                  return (
                    <button
                      key={post.id}
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
                  )
                })
              )}

              {/* Admin quick add post affordance for selected date */}
              {viewerIsAdmin && onCreateOnDay && (
                <button
                  type="button"
                  onClick={() => onCreateOnDay(selectedDateStr)}
                  className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                  style={{
                    background: '#FFFFFF',
                    border: `1px dashed ${brand.brand.primary}50`,
                    color: brand.brand.primary,
                  }}
                >
                  <span className="text-base">+</span>
                  <span className="text-sm font-medium">Add post to this day</span>
                </button>
              )}
            </div>
          </>
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
