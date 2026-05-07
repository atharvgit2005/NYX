'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { BrandConfig } from '@/lib/portal/brand-config'

interface Props {
  brand: BrandConfig
  signedInAs: { name: string | null; email: string }
  viewerIsAdmin: boolean
}

export default function PortalHeader({ brand, signedInAs, viewerIsAdmin }: Props) {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E8E4DC',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${brand.brand.primary}, ${brand.brand.secondary})`,
            }}
          >
            {brand.client.avatarLetter}
          </div>
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: '#6B6B6B' }}
            >
              {brand.campaign.platform}
            </p>
            <p
              className="text-sm font-bold leading-tight truncate"
              style={{ fontFamily: 'var(--font-portal-display)', color: '#1A2A5E' }}
            >
              {brand.client.name}
              <span style={{ color: brand.brand.primary }}> ×</span>{' '}
              {brand.agency.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {viewerIsAdmin && (
            <Link
              href="/portal/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors"
              style={{
                background: '#FAF7F2',
                color: '#6B6B6B',
                border: '1px solid #E8E4DC',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = '#E8E4DC'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = '#FAF7F2'
              }}
            >
              ← Admin
            </Link>
          )}

          <div className="hidden md:block text-right max-w-[160px]">
            {signedInAs.name && (
              <p className="text-xs font-bold leading-tight truncate" style={{ color: '#1A2A5E' }}>
                {signedInAs.name}
              </p>
            )}
            <p
              className="text-[11px] leading-tight truncate"
              style={{ color: '#6B6B6B' }}
            >
              {signedInAs.email}
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors"
            style={{
              background: '#FFFFFF',
              color: brand.brand.primary,
              border: `1px solid ${brand.brand.primary}30`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = brand.brand.primary
              el.style.color = '#FFFFFF'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#FFFFFF'
              el.style.color = brand.brand.primary
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
