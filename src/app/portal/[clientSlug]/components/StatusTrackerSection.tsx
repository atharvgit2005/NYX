'use client'

import {
  POST_STATUS_LABEL,
  POST_STATUS_PIPELINE,
  STATUS_COLORS,
} from '@/lib/portal/content-types'
import type { PostStatus } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'

interface Props {
  brand: BrandConfig
  statusCounts: Record<PostStatus, number>
  totalPosts: number
}

export default function StatusTrackerSection({
  brand,
  statusCounts,
  totalPosts,
}: Props) {
  const firstActiveIdx = POST_STATUS_PIPELINE.findIndex((s) => statusCounts[s] > 0)
  const lastActiveIdx = (() => {
    for (let i = POST_STATUS_PIPELINE.length - 1; i >= 0; i--) {
      if (statusCounts[POST_STATUS_PIPELINE[i]] > 0) return i
    }
    return -1
  })()

  // Active line width: from start of first active stage to end of last active stage
  const lineWidth =
    lastActiveIdx >= 0
      ? `${((lastActiveIdx + 1) / POST_STATUS_PIPELINE.length) * 100}%`
      : '0%'

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
        >
          Status Tracker
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
          Production pipeline for {totalPosts} post{totalPosts === 1 ? '' : 's'}
        </p>
      </div>

      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ background: '#FFFFFF', border: '1px solid #E8E4DC' }}
      >
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:block">
          <div className="flex items-start relative">
            <div
              className="absolute top-4 left-0 right-0 h-0.5"
              style={{ background: '#E8E4DC', zIndex: 0 }}
            />
            <div
              className="absolute top-4 left-0 h-0.5 transition-all"
              style={{
                background: `linear-gradient(90deg, ${brand.brand.primary}, ${brand.brand.secondary})`,
                width: lineWidth,
                zIndex: 0,
              }}
            />

            {POST_STATUS_PIPELINE.map((stage) => {
              const count = statusCounts[stage]
              const colors = STATUS_COLORS[stage]
              const isActive = count > 0

              return (
                <div key={stage} className="flex-1 flex flex-col items-center relative z-10">
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

                  <div className="mt-3 text-center px-1">
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{ color: isActive ? '#1A2A5E' : '#C0BAB0' }}
                    >
                      {POST_STATUS_LABEL[stage]}
                    </p>
                    {isActive && (
                      <p className="text-xs mt-0.5" style={{ color: colors.text }}>
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
          {POST_STATUS_PIPELINE.map((stage) => {
            const count = statusCounts[stage]
            const colors = STATUS_COLORS[stage]
            const isActive = count > 0

            return (
              <div key={stage} className="flex items-center gap-4">
                <div className="flex items-center gap-3 w-44 shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: isActive ? colors.dot : '#E8E4DC' }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: isActive ? '#1A2A5E' : '#C0BAB0' }}
                  >
                    {POST_STATUS_LABEL[stage]}
                  </p>
                </div>
                {isActive ? (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {count} post{count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: '#C0BAB0' }}>—</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {firstActiveIdx >= 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {POST_STATUS_PIPELINE.filter((s) => statusCounts[s] > 0).map((stage) => {
            const colors = STATUS_COLORS[stage]
            return (
              <div
                key={stage}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.dot}30`,
                }}
              >
                <span className="font-bold">{statusCounts[stage]}</span>
                <span>{POST_STATUS_LABEL[stage]}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
