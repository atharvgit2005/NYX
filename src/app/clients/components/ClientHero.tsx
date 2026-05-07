'use client'

import { ClientConfig } from '../types'

interface Props {
  config: ClientConfig
}

export default function ClientHero({ config }: Props) {
  const { campaign, brand, client } = config

  const stats = [
    { label: 'Total Posts', value: campaign.totals.posts },
    { label: 'Reels', value: campaign.totals.reels },
    { label: 'Carousels', value: campaign.totals.carousels },
    { label: 'Photos', value: campaign.totals.photos },
    { label: 'Stories', value: campaign.totals.stories },
  ]

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E4DC' }}
    >
      {/* Decorative accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${brand.primary}, ${brand.secondary})` }}
      />

      <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: `${brand.primary}15`,
              color: brand.primary,
              fontFamily: 'var(--font-inter)',
            }}
          >
            {campaign.platform}
          </span>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: `${brand.secondary}15`,
              color: '#0078A8',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {campaign.title}
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-3"
          style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
        >
          {client.name}
          <span style={{ color: brand.primary }}> ×</span> NYX Studio
        </h1>

        <p
          className="text-xl md:text-2xl mb-2"
          style={{ fontFamily: 'var(--font-playfair)', color: '#6B6B6B', fontStyle: 'italic' }}
        >
          Content Calendar — May 2026
        </p>

        {/* Period badge */}
        <div className="flex items-center gap-2 mt-4 mb-10">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: brand.primary }}
          />
          <span
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
          >
            Trial Period · {campaign.period}
          </span>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap gap-4 pt-8"
          style={{ borderTop: '1px solid #E8E4DC' }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col"
              style={{ minWidth: '80px' }}
            >
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs tracking-wider uppercase mt-0.5"
                style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
