import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import Link from 'next/link'
import BrandForm from '../components/BrandForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New brand · Portal Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NewBrandPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/portal/login?callbackUrl=' + encodeURIComponent('/portal/admin/brands/new'))
  }
  if (!isAdminEmail(session.user.email)) {
    redirect('/portal')
  }

  return (
    <div
      className="min-h-screen p-8 md:p-12"
      style={{
        backgroundColor: '#0e0e0e',
        color: '#e5e2e1',
        fontFamily: 'var(--font-work-sans), sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <Link
          href="/portal/admin"
          className="text-xs uppercase tracking-widest text-[#e4beb5] hover:text-[#E8441A] inline-block mb-6"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          ← Back to admin
        </Link>
        <div className="flex flex-wrap items-end gap-4 mb-2">
          <div
            className="text-4xl md:text-5xl font-black tracking-tighter leading-none uppercase"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            role="heading"
            aria-level={1}
          >
            New Brand
          </div>
          <span
            className="text-xs px-2 py-0.5 font-bold uppercase mb-1"
            style={{
              backgroundColor: '#ffd65b',
              color: '#3d2f00',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
            }}
          >
            *ADMIN_FORM
          </span>
        </div>
        <p
          className="text-[#e4beb5] text-sm mb-10 max-w-xl"
          style={{ fontFamily: 'var(--font-work-sans), sans-serif' }}
        >
          Onboard a new brand partner directly. Creates the BrandPartner row
          (status ACTIVE) plus the matching configuration. The brand can sign
          in with the contact email immediately.
        </p>

        <BrandForm mode="create" />
      </div>
    </div>
  )
}
