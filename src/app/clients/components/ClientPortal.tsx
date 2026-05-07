'use client'

import { ClientConfig } from '../types'
import AuthGate from './AuthGate'
import ClientHero from './ClientHero'
import ClientInfoCard from './ClientInfoCard'
import ContentCalendar from './ContentCalendar'
import FeedPreview from './FeedPreview'
import StatusTracker from './StatusTracker'
import PackBSection from './PackBSection'

interface Props {
  config: ClientConfig
  slug: string
}

export default function ClientPortal({ config, slug }: Props) {
  return (
    <AuthGate config={config} slug={slug}>
      <div
        className="min-h-screen"
        style={{ background: '#FAF7F2', fontFamily: 'var(--font-inter)' }}
      >
        {/* Staggered fade-in sections */}
        <div style={{ animation: 'portalFadeIn 0.5s ease both' }}>
          <ClientHero config={config} />
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.1s both' }}>
          <ClientInfoCard config={config} />
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.2s both' }}>
          <div style={{ borderTop: '1px solid #E8E4DC' }}>
            <ContentCalendar config={config} />
          </div>
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.3s both' }}>
          <FeedPreview config={config} />
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.35s both' }}>
          <div style={{ borderTop: '1px solid #E8E4DC' }}>
            <StatusTracker config={config} />
          </div>
        </div>

        <div style={{ animation: 'portalFadeIn 0.5s ease 0.4s both' }}>
          <div style={{ borderTop: '1px solid #E8E4DC' }}>
            <PackBSection config={config} />
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid #E8E4DC',
            background: '#FFFFFF',
            animation: 'portalFadeIn 0.5s ease 0.45s both',
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p
                className="text-xs"
                style={{ color: '#6B6B6B' }}
              >
                Client Portal · {config.campaign.title} · {config.campaign.period}
              </p>
              <p
                className="text-xs"
                style={{ color: '#C0BAB0' }}
              >
                Content strategy and production by {config.agency.name}
              </p>
            </div>

            <a
              href={config.agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
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
              <span className="text-xs font-medium">Built by {config.agency.name}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </footer>

        <style>{`
          @keyframes portalFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </AuthGate>
  )
}
