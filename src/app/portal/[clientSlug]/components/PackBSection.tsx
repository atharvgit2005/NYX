'use client'

import { useState } from 'react'
import { Film, Monitor } from 'lucide-react'
import type { BrandConfig } from '@/lib/portal/brand-config'

interface Props {
  brand: BrandConfig
}

export default function PackBSection({ brand }: Props) {
  const [open, setOpen] = useState(true)
  const { packB, brand: colors } = brand

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full px-6 py-5 flex items-center gap-3 transition-colors"
          style={{
            borderBottom: open ? '1px solid #E8E4DC' : 'none',
            background: '#FAF7F2',
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
          <h2
            className="text-base font-semibold tracking-wide flex-1 text-left flex items-center gap-2"
            style={{ color: '#1A2A5E', letterSpacing: '0.04em' }}
          >
            <Film className="w-4 h-4" aria-hidden />
            PACK B — {packB.title.toUpperCase()}
          </h2>
          <span
            className="text-xs font-semibold transition-transform"
            style={{
              color: '#6B6B6B',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
              display: 'inline-block',
            }}
          >
            ▼
          </span>
        </button>

        {open && (
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B6B6B' }}>
                {packB.description}
              </p>

              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#6B6B6B' }}>
                Content Sources
              </p>
              <div className="space-y-2">
                {packB.sources.map((source, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                      style={{ background: colors.secondary }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm" style={{ color: '#1A2A5E' }}>
                      {source}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{
                background: `${colors.secondary}08`,
                border: `1px solid ${colors.secondary}20`,
              }}
            >
              <p
                className="text-xs tracking-widest uppercase mb-4"
                style={{ color: '#0078A8' }}
              >
                Strategic Goals
              </p>
              <div className="space-y-3">
                {packB.goals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <circle cx="8" cy="8" r="7.5" stroke={colors.secondary} />
                      <path
                        d="M4.5 8L7 10.5L11.5 5.5"
                        stroke={colors.secondary}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#1A2A5E' }}>
                      {goal}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 pt-5 flex items-start gap-2"
                style={{ borderTop: `1px solid ${colors.secondary}20` }}
              >
                <Monitor className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#6B6B6B' }} aria-hidden />
                <p className="text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>
                  Content formatted for in-store vertical displays (portrait mode loop).
                  Final delivery as MP4 + JPG stills.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
