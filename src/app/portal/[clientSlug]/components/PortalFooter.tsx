'use client'

import type { BrandConfig } from '@/lib/portal/brand-config'

interface Props {
  brand: BrandConfig
}

export default function PortalFooter({ brand }: Props) {
  const renewMail = `mailto:${brand.agency.email}?subject=${encodeURIComponent(
    `${brand.client.name} — extending past ${brand.campaign.title}`,
  )}`

  return (
    <footer
      className="border-t"
      style={{ borderColor: '#E8E4DC', background: '#FFFFFF' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-5">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <p className="text-xs" style={{ color: '#6B6B6B' }}>
            {brand.client.name} portal · {brand.campaign.title} · {brand.campaign.period}
          </p>
          <p className="text-xs" style={{ color: '#C0BAB0' }}>
            Confidential — for {brand.client.name} team only
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={renewMail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-semibold"
            style={{
              background: brand.brand.primary,
              color: '#FFFFFF',
              border: `1px solid ${brand.brand.primary}`,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 6px 16px ${brand.brand.primary}40`
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            Renew →
          </a>

          <a
            href={brand.agency.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs"
            style={{
              background: '#FAF7F2',
              border: '1px solid #E8E4DC',
              color: '#1A2A5E',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#1A2A5E'
              el.style.color = '#FFFFFF'
              el.style.borderColor = '#1A2A5E'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#FAF7F2'
              el.style.color = '#1A2A5E'
              el.style.borderColor = '#E8E4DC'
            }}
          >
            <span className="font-medium">Built by {brand.agency.name}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
