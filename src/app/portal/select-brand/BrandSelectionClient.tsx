'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Sparkles,
  Search,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Eye,
  Crown,
  Building2,
  Calendar,
} from 'lucide-react'
import type { AccessibleBrand } from '@/lib/portal/accessible-brands'

interface Props {
  brands: AccessibleBrand[]
  user: {
    name?: string | null
    email: string
  }
}

export default function BrandSelectionClient({ brands, user }: Props) {
  const [search, setSearch] = useState('')

  const filteredBrands = brands.filter((b) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      b.clientName.toLowerCase().includes(q) ||
      b.clientSlug.toLowerCase().includes(q) ||
      (b.tagline && b.tagline.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#E5E2E1] font-sans relative overflow-x-hidden selection:bg-[#E50914] selection:text-white flex flex-col">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#E50914]/15 via-purple-600/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0C0E17]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#B00610] flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-[#E50914]/20 group-hover:scale-105 transition-transform duration-300">
              N
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              NYX <span className="text-[#E50914]">STUDIO</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              {user.name && (
                <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                  {user.name}
                </span>
              )}
              <span className="text-[11px] text-white/60 truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col items-center">
        {/* Badge & Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E50914]/10 text-[#FF525C] border border-[#E50914]/20 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>PORTAL SELECTION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Select Your Brand Calendar
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
            Your account has access to multiple brand portals. Choose a brand below to view the content calendar, review posts, and track workflow.
          </p>
        </div>

        {/* Search Bar (Shown if > 2 brands) */}
        {brands.length > 2 && (
          <div className="w-full max-w-md mb-8 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#131625] text-white placeholder-white/40 border border-white/10 focus:border-[#E50914] focus:outline-none text-sm transition-colors"
            />
          </div>
        )}

        {/* Brands Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredBrands.map((brand) => {
            const primaryColor = brand.primaryColor || '#E50914'
            const secondaryColor = brand.secondaryColor || '#111111'

            return (
              <Link
                key={brand.clientSlug}
                href={`/portal/${brand.clientSlug}`}
                className="group relative bg-[#121422]/90 hover:bg-[#16192B] border border-white/10 hover:border-[#E50914]/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#E50914]/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top Brand Color Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                <div>
                  {/* Header Row: Logo/Avatar + Role Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {brand.logoUrl ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden relative border border-white/15 bg-white p-1 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={brand.logoUrl}
                          alt={brand.clientName}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        {brand.clientName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Role Pill */}
                    {brand.role === 'OWNER' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 shadow-sm">
                        <Crown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Brand Owner</span>
                      </span>
                    ) : brand.role === 'VIEWER' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-sm">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Guest Viewer</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Studio Admin</span>
                      </span>
                    )}
                  </div>

                  {/* Brand Title & Tagline */}
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight group-hover:text-[#FF525C] transition-colors">
                    {brand.clientName}
                  </h2>
                  <p className="text-sm text-white/60 line-clamp-2 mb-6">
                    {brand.tagline || 'Content Calendar & Client Portal'}
                  </p>
                </div>

                {/* Footer Action Row */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white/70 group-hover:text-white">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>View Calendar</span>
                  </span>
                  <div className="flex items-center gap-1 text-[#FF525C] group-hover:translate-x-1 transition-transform duration-300 font-bold">
                    <span>Open Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-auto text-center py-6 px-4 rounded-2xl bg-white/[0.02] border border-white/5 max-w-lg">
          <p className="text-xs text-white/50 leading-relaxed">
            Need access to an additional brand calendar? Contact your NYX Studio account representative or email{' '}
            <a
              href="mailto:official.nyxstudio@gmail.com"
              className="text-[#FF525C] hover:underline font-semibold"
            >
              official.nyxstudio@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
