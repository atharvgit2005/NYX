'use client'

import {
  CONTENT_TYPE_LABEL,
  TYPE_COLORS,
} from '@/lib/portal/content-types'
import type { ContentType } from '@prisma/client'
import type { BrandConfig } from '@/lib/portal/brand-config'

interface Props {
  brand: BrandConfig
  totalPosts: number
  typeCounts: Record<ContentType, number>
}

const ORDER: ContentType[] = ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY']

export default function StatStrip({ brand, totalPosts, typeCounts }: Props) {
  const visible = ORDER.filter((t) => typeCounts[t] > 0)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid #E8E4DC' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: '#FAF7F2', borderBottom: '1px solid #E8E4DC' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: brand.brand.primary }} />
        <p
          className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: '#6B6B6B' }}
        >
          {brand.campaign.title} · {brand.campaign.period} · {brand.campaign.platform}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px" style={{ background: '#F0EDE6' }}>
        <Stat label="Posts" value={totalPosts} dot={brand.brand.accent} />
        {visible.map((t) => (
          <Stat
            key={t}
            label={CONTENT_TYPE_LABEL[t] + (typeCounts[t] === 1 ? '' : 's')}
            value={typeCounts[t]}
            dot={TYPE_COLORS[t].dot}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="px-5 py-4 flex flex-col" style={{ background: '#FFFFFF' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
        <span className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: '#6B6B6B' }}>
          {label}
        </span>
      </div>
      <span
        className="text-3xl font-bold leading-none"
        style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
      >
        {value}
      </span>
    </div>
  )
}
