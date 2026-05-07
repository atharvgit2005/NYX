'use client'

import {
  CONTENT_TYPE_LABEL,
  TYPE_COLORS,
} from '@/lib/portal/content-types'
import type { ContentType } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
  posts: SerializedPost[]
  brand: BrandConfig
  onSelectPost: (post: SerializedPost) => void
}

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

export default function CalendarView({ posts, brand, onSelectPost }: Props) {
  const days = buildCalendarDays(brand.campaign.monthYear, brand.campaign.monthIndex)

  const byDate: Record<string, SerializedPost[]> = {}
  for (const p of posts) {
    const k = dateKey(p.scheduledDate)
    byDate[k] = byDate[k] ? [...byDate[k], p] : [p]
  }

  const today = brand.campaign.referenceToday
  const monthYear = brand.campaign.monthYear
  const monthIndex = brand.campaign.monthIndex

  const campaignFirst = Math.min(
    ...posts.map((p) => new Date(p.scheduledDate).getDate()),
  )
  const campaignLast = Math.max(
    ...posts.map((p) => new Date(p.scheduledDate).getDate()),
  )

  return (
    <div>
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

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = day ? `${monthYear}-${pad(monthIndex + 1)}-${pad(day)}` : null
            const cellPosts = dateStr ? byDate[dateStr] ?? [] : []
            const isToday = dateStr === today
            const hasPosts = cellPosts.length > 0
            const inCampaign = day !== null && day >= campaignFirst && day <= campaignLast

            return (
              <div
                key={i}
                className="min-h-[88px] md:min-h-[104px] p-2 relative transition-colors"
                style={{
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
                  borderBottom: i < days.length - 7 ? '1px solid #F0EDE6' : 'none',
                  background: isToday
                    ? `${brand.brand.primary}06`
                    : hasPosts && inCampaign
                    ? '#FAF7F2'
                    : 'transparent',
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
                      {cellPosts.map((post) => {
                        const colors = TYPE_COLORS[post.contentType]
                        return (
                          <button
                            key={post.id}
                            onClick={() => onSelectPost(post)}
                            className="w-full text-left px-1.5 py-1 rounded-lg text-xs font-medium leading-tight transition-all hover:scale-[1.02]"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              borderLeft: `3px solid ${colors.dot}`,
                            }}
                          >
                            <span className="hidden md:block truncate" style={{ maxWidth: '100px' }}>
                              {post.title.split(' — ')[0].split(':')[0]}
                            </span>
                            <span className="md:hidden">
                              {CONTENT_TYPE_LABEL[post.contentType].charAt(0)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div
          className="px-5 py-4 flex flex-wrap gap-4"
          style={{ borderTop: '1px solid #E8E4DC', background: '#FAF7F2' }}
        >
          {(Object.keys(TYPE_COLORS) as ContentType[]).map((type) => {
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
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden space-y-3">
        {posts.map((post) => {
          const colors = TYPE_COLORS[post.contentType]
          return (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E4DC',
                borderLeft: `4px solid ${colors.dot}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6B6B6B' }}>
                  {formatLongDate(post.scheduledDate)} · #{post.position}
                </p>
                <p
                  className="text-sm font-bold leading-snug"
                  style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
                >
                  {post.title}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                style={{ background: colors.bg, color: colors.text }}
              >
                {CONTENT_TYPE_LABEL[post.contentType]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
