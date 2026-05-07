'use client'

import { useState } from 'react'
import { ClientConfig, Post, TYPE_COLORS } from '../types'
import PostCard from './PostCard'
import PostModal from './PostModal'

interface Props {
  config: ClientConfig
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildCalendarDays(year: number, month: number) {
  // month is 0-indexed (0 = Jan)
  const firstDay = new Date(year, month, 1)
  // getDay(): 0=Sun,1=Mon,...,6=Sat → convert to Mon-start: 0=Mon,...,6=Sun
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function postsByDate(posts: Post[]) {
  const map: Record<string, Post[]> = {}
  posts.forEach((p) => {
    map[p.date] = map[p.date] ? [...map[p.date], p] : [p]
  })
  return map
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function ContentCalendar({ config }: Props) {
  const [view, setView] = useState<'calendar' | 'cards'>('calendar')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const days = buildCalendarDays(2026, 4) // May 2026
  const byDate = postsByDate(config.posts)
  const today = `2026-05-05` // campaign start date as "today"

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Section header + toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
          >
            Content Planner
          </h2>
          <p
            className="text-sm mt-1"
            style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
          >
            May 2026 · {config.campaign.totals.posts} posts scheduled
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden shrink-0"
          style={{ border: '1px solid #E8E4DC', background: '#FAF7F2' }}
        >
          {(['calendar', 'cards'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-5 py-2.5 text-sm font-medium transition-all capitalize"
              style={{
                fontFamily: 'var(--font-inter)',
                background: view === v ? '#1A2A5E' : 'transparent',
                color: view === v ? '#FFFFFF' : '#6B6B6B',
              }}
            >
              {v === 'calendar' ? '📅 Calendar' : '🗂 Cards'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #E8E4DC' }}>
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dateStr = day ? `2026-05-${pad(day)}` : null
              const posts = dateStr ? byDate[dateStr] ?? [] : []
              const isToday = dateStr === today
              const hasPosts = posts.length > 0
              const isInCampaign = day !== null && day >= 5 && day <= 15

              return (
                <div
                  key={i}
                  className="min-h-[88px] md:min-h-[104px] p-2 relative transition-colors"
                  style={{
                    borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE6' : 'none',
                    borderBottom: i < days.length - 7 ? '1px solid #F0EDE6' : 'none',
                    background: isToday ? `${config.brand.primary}06` : hasPosts && isInCampaign ? `#FAF7F2` : 'transparent',
                  }}
                >
                  {day !== null && (
                    <>
                      {/* Day number */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors`}
                          style={{
                            fontFamily: 'var(--font-inter)',
                            background: isToday ? config.brand.primary : 'transparent',
                            color: isToday ? '#FFFFFF' : isInCampaign ? '#1A2A5E' : '#C0BAB0',
                          }}
                        >
                          {day}
                        </span>
                      </div>

                      {/* Post chips */}
                      <div className="flex flex-col gap-1">
                        {posts.map((post) => {
                          const colors = TYPE_COLORS[post.type] ?? TYPE_COLORS['Reel']
                          return (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className="w-full text-left px-1.5 py-1 rounded-lg text-xs font-medium leading-tight transition-all hover:scale-[1.02]"
                              style={{
                                background: colors.bg,
                                color: colors.text,
                                fontFamily: 'var(--font-inter)',
                                borderLeft: `3px solid ${colors.dot}`,
                              }}
                            >
                              <span className="flex items-center gap-1">
                                <span
                                  className="hidden md:block truncate"
                                  style={{ maxWidth: '100px' }}
                                >
                                  {post.title.split(' — ')[0].split(':')[0]}
                                </span>
                                <span className="md:hidden">
                                  {post.type.split(' ')[0].charAt(0)}
                                </span>
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

          {/* Legend */}
          <div
            className="px-5 py-4 flex flex-wrap gap-4"
            style={{ borderTop: '1px solid #E8E4DC', background: '#FAF7F2' }}
          >
            {['Reel', 'Carousel', 'Photo', 'Reel + Story'].map((type) => {
              const c = TYPE_COLORS[type]
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
                  <span
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
                  >
                    {type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Card View */}
      {view === 'cards' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                animation: `fadeSlideIn 0.4s ease both`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <PostCard
                post={post}
                config={config}
                onClick={() => setSelectedPost(post)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          config={config}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
