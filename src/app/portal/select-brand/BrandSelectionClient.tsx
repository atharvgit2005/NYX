'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
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
    <main
      className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#D83C14] selection:text-white"
      style={{ fontFamily: 'var(--font-work-sans), sans-serif' }}
    >
      {/* Grid pattern background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#e5e2e1 1px, transparent 1px), linear-gradient(90deg, #e5e2e1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 border-b-4 border-black bg-[#0e0e0e] px-6 md:px-12 py-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group" aria-label="NYX Studio Home">
          <div className="w-10 h-10 relative group-hover:scale-105 transition-transform">
            <Image
              src="/logo/NYX-Logo.png"
              alt="NYX Studio logo"
              width={120}
              height={40}
              unoptimized
              sizes="40px"
              className="h-full w-full object-contain"
            />
          </div>
          <span
            className="text-xl font-bold tracking-tight text-[#e5e2e1]"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            NYX <span className="text-[#D83C14]">STUDIO</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span
              className="text-[0.65rem] tracking-[0.2em] text-[#ab8981] uppercase"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              OPERATOR_ID
            </span>
            <span className="text-xs font-bold text-[#e5e2e1] truncate max-w-[200px]">
              {user.email}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-[#1c1b1b] border-2 border-black px-4 py-2 text-xs font-bold tracking-widest text-[#e4beb5] hover:text-white hover:bg-[#D83C14] transition-all"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            SIGN_OUT
          </button>
        </div>
      </header>

      {/* Main Body */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16 w-full flex-1 flex flex-col items-center">
        {/* Subheader Badge & Main Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div
            className="text-[0.65rem] md:text-[0.75rem] tracking-[0.3em] text-[#D83C14] mb-4 uppercase font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            ◆ SECURE_ROUTER // MULTI_BRAND_ACCESS
          </div>

          <h1
            className="text-4xl md:text-6xl font-black leading-[0.95] tracking-tighter uppercase mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            SELECT_<span className="text-[#D83C14] italic">BRAND_CALENDAR</span>
          </h1>

          <p className="text-[#e4beb5] text-base md:text-lg leading-relaxed">
            Your operator identity has access to multiple brand portals. Choose a brand calendar below to view schedule, review posts, and track campaign deliverables.
          </p>
        </div>

        {/* Search Bar (if > 2 brands) */}
        {brands.length > 2 && (
          <div className="w-full max-w-md mb-10 relative">
            <input
              type="text"
              placeholder="SEARCH_BRAND_NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e0e0e] border-4 border-black p-4 text-xs font-bold tracking-widest text-[#e5e2e1] placeholder-[#5b403a] focus:outline-none focus:border-[#D83C14] transition-colors"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            />
          </div>
        )}

        {/* Brand Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {filteredBrands.map((brand) => {
            const primaryColor = brand.primaryColor || '#D83C14'
            const secondaryColor = brand.secondaryColor || '#111111'

            return (
              <Link
                key={brand.clientSlug}
                href={`/portal/${brand.clientSlug}`}
                className="group relative bg-[#131313] border-4 border-black p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D83C14] hover:-translate-y-1 shadow-2xl"
              >
                {/* Brand Accent Top Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-2 transition-all duration-300 group-hover:h-3"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                <div>
                  {/* Top Row: Logo/Avatar + Role Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    {brand.logoUrl ? (
                      <div className="w-14 h-14 relative border-2 border-black bg-white p-1 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
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
                        className="w-14 h-14 border-2 border-black flex items-center justify-center font-extrabold text-2xl text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        {brand.clientName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Role Badge */}
                    {brand.role === 'OWNER' ? (
                      <span
                        className="text-[0.65rem] font-bold tracking-[0.2em] border-2 border-[#D83C14] px-3 py-1 text-[#D83C14] bg-[#D83C14]/10 uppercase"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        ◆ BRAND_OWNER
                      </span>
                    ) : brand.role === 'VIEWER' ? (
                      <span
                        className="text-[0.65rem] font-bold tracking-[0.2em] border-2 border-[#e4beb5] px-3 py-1 text-[#e4beb5] bg-white/5 uppercase"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        ◇ GUEST_VIEWER
                      </span>
                    ) : (
                      <span
                        className="text-[0.65rem] font-bold tracking-[0.2em] border-2 border-[#ffd65b] px-3 py-1 text-[#ffd65b] bg-[#ffd65b]/10 uppercase"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        ★ STUDIO_ADMIN
                      </span>
                    )}
                  </div>

                  {/* Brand Title & Tagline */}
                  <h2
                    className="text-2xl md:text-3xl font-black text-[#e5e2e1] uppercase tracking-tight mb-2 group-hover:text-[#D83C14] transition-colors"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                  >
                    {brand.clientName}
                  </h2>
                  <p className="text-sm text-[#ab8981] line-clamp-2 mb-8">
                    {brand.tagline || 'Content Calendar & Client Portal'}
                  </p>
                </div>

                {/* Card CTA Footer Button */}
                <div
                  className="w-full bg-[#D83C14] py-4 px-5 border-4 border-black flex items-center justify-between group-hover:bg-[#ffd65b] transition-all"
                >
                  <span
                    className="font-[var(--font-space-grotesk)] font-bold text-sm tracking-widest text-white group-hover:text-[#3d2f00] uppercase"
                  >
                    ENTER_PORTAL
                  </span>
                  <span className="font-bold text-white group-hover:text-[#3d2f00] text-lg">
                    →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Support Note */}
        <div className="border-t border-[#1c1b1b] pt-8 text-center max-w-md w-full">
          <p className="text-xs text-[#ab8981] leading-relaxed">
            Need access to an additional brand calendar? Reach out to your NYX Studio representative or email{' '}
            <a
              href="mailto:official.nyxstudio@gmail.com"
              className="text-[#D83C14] hover:underline font-bold"
            >
              official.nyxstudio@gmail.com
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t-4 border-black bg-[#0e0e0e] px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 opacity-70 text-[0.65rem] tracking-widest uppercase text-[#ab8981]" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
        <div>© NYX STUDIO | THE MIDNIGHT MANIFESTO</div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-[#D83C14] transition-colors">
            HOME
          </Link>
          <Link href="/work" className="hover:text-[#D83C14] transition-colors">
            WORK
          </Link>
          <a href="mailto:official.nyxstudio@gmail.com" className="hover:text-[#D83C14] transition-colors">
            SUPPORT
          </a>
        </div>
      </footer>
    </main>
  )
}
