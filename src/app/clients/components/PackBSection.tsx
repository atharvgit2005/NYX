'use client'

import { ClientConfig } from '../types'

interface Props {
  config: ClientConfig
}

export default function PackBSection({ config }: Props) {
  const { packB, brand } = config

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid #E8E4DC', background: '#FAF7F2' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: brand.secondary }}
          />
          <h2
            className="text-base font-semibold tracking-wide"
            style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E', letterSpacing: '0.04em' }}
          >
            PACK B — {packB.title.toUpperCase()}
          </h2>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Description + sources */}
          <div>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              {packB.description}
            </p>

            <p
              className="text-xs tracking-widest uppercase mb-3"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              Content Sources
            </p>
            <div className="space-y-2">
              {packB.sources.map((source, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ background: brand.secondary }}
                  >
                    {i + 1}
                  </div>
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
                  >
                    {source}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div
            className="rounded-xl p-5"
            style={{ background: `${brand.secondary}08`, border: `1px solid ${brand.secondary}20` }}
          >
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-inter)', color: '#0078A8' }}
            >
              Strategic Goals
            </p>
            <div className="space-y-3">
              {packB.goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0"
                  >
                    <circle cx="8" cy="8" r="7.5" stroke={brand.secondary} />
                    <path
                      d="M4.5 8L7 10.5L11.5 5.5"
                      stroke={brand.secondary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
                  >
                    {goal}
                  </p>
                </div>
              ))}
            </div>

            {/* Visual note */}
            <div
              className="mt-5 pt-5 flex items-start gap-2"
              style={{ borderTop: `1px solid ${brand.secondary}20` }}
            >
              <span className="text-base">🖥️</span>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
              >
                Content formatted for in-store vertical displays (portrait mode loop).
                Final delivery as MP4 + JPG stills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
