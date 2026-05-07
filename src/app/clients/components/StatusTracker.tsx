'use client'

import { ClientConfig, STATUS_PIPELINE, PostStatus } from '../types'

interface Props {
  config: ClientConfig
}

const STAGE_COLORS: Record<PostStatus, { bg: string; text: string; dot: string }> = {
  Idea: { bg: '#FFF9E6', text: '#B8860B', dot: '#FFC107' },
  Drafting: { bg: '#E8F4FF', text: '#0066CC', dot: '#2196F3' },
  'Needs Approval': { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
  'Needs Revision': { bg: '#FCE4EC', text: '#C62828', dot: '#F44336' },
  Approved: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  Posted: { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
}

export default function StatusTracker({ config }: Props) {
  const stageCounts: Record<PostStatus, number> = {
    Idea: 0,
    Drafting: 0,
    'Needs Approval': 0,
    'Needs Revision': 0,
    Approved: 0,
    Posted: 0,
  }

  config.posts.forEach((post) => {
    const status = post.status as PostStatus
    if (status in stageCounts) stageCounts[status]++
  })

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
        >
          Status Tracker
        </h2>
        <p
          className="text-sm mt-1"
          style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
        >
          Production pipeline for {config.campaign.totals.posts} posts
        </p>
      </div>

      {/* Pipeline */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E4DC' }}
      >
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:block">
          <div className="flex items-start relative">
            {/* Connector line */}
            <div
              className="absolute top-4 left-0 right-0 h-0.5"
              style={{ background: '#E8E4DC', zIndex: 0 }}
            />
            {/* Active portion */}
            <div
              className="absolute top-4 left-0 h-0.5 transition-all"
              style={{
                background: `linear-gradient(90deg, ${config.brand.primary}, ${config.brand.secondary})`,
                width: stageCounts.Posted > 0 ? '100%' : stageCounts.Approved > 0 ? '83%' : '0%',
                zIndex: 0,
              }}
            />

            {STATUS_PIPELINE.map((stage, i) => {
              const count = stageCounts[stage]
              const colors = STAGE_COLORS[stage]
              const isActive = count > 0
              const isPast = i < STATUS_PIPELINE.findIndex((s) => stageCounts[s] > 0)

              return (
                <div key={stage} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Dot */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: isActive ? colors.dot : '#FFFFFF',
                      border: `2px solid ${isActive ? colors.dot : '#E8E4DC'}`,
                      color: isActive ? '#FFFFFF' : '#C0BAB0',
                      boxShadow: isActive ? `0 0 0 4px ${colors.dot}20` : 'none',
                    }}
                  >
                    {isActive ? count : ''}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center px-1">
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: isActive ? '#1A2A5E' : '#C0BAB0',
                      }}
                    >
                      {stage}
                    </p>
                    {isActive && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ fontFamily: 'var(--font-inter)', color: colors.text }}
                      >
                        {count} post{count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden space-y-3">
          {STATUS_PIPELINE.map((stage, i) => {
            const count = stageCounts[stage]
            const colors = STAGE_COLORS[stage]
            const isActive = count > 0

            return (
              <div key={stage} className="flex items-center gap-4">
                {/* Number */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: isActive ? colors.dot : '#E8E4DC' }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: isActive ? '#1A2A5E' : '#C0BAB0',
                    }}
                  >
                    {stage}
                  </p>
                </div>
                {isActive ? (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: colors.bg, color: colors.text, fontFamily: 'var(--font-inter)' }}
                  >
                    {count} post{count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-inter)', color: '#C0BAB0' }}
                  >
                    —
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap gap-3">
        {STATUS_PIPELINE.filter((s) => stageCounts[s] > 0).map((stage) => {
          const colors = STAGE_COLORS[stage]
          return (
            <div
              key={stage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{
                background: colors.bg,
                color: colors.text,
                fontFamily: 'var(--font-inter)',
                border: `1px solid ${colors.dot}30`,
              }}
            >
              <span className="font-bold">{stageCounts[stage]}</span>
              <span>{stage}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
