import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import Link from 'next/link'
import BrandForm, { type BrandFormValues } from '../../components/BrandForm'
import { getBrandPartnerWithConfigBySlug } from '@/lib/portal/brand-store'
import { listViewersForBrand } from '@/lib/portal/viewer-store'
import ViewersSection, { type ViewerRow } from './ViewersSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit brand · Portal Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/portal/login')
  }
  if (!isAdminEmail(session.user.email)) {
    redirect('/portal')
  }

  const { clientSlug } = await params
  const partner = await getBrandPartnerWithConfigBySlug(clientSlug)
  if (!partner) notFound()
  const cfg = partner.configuration

  const rawViewers = await listViewersForBrand(partner.id)
  const initialViewers: ViewerRow[] = rawViewers.map((v) => ({
    id: v.id,
    email: v.email,
    name: v.name,
    addedBy: v.addedBy,
    addedAt: v.addedAt.toISOString(),
  }))

  const initial: Partial<BrandFormValues> = {
    brandName: cfg?.brandName ?? partner.clientName,
    clientSlug: partner.clientSlug,
    contactEmail: partner.email,
    tagline: cfg?.tagline ?? '',
    primaryColor: cfg?.primaryColor ?? '#E8441A',
    secondaryColor: cfg?.secondaryColor ?? '#ffd65b',
    accentColor: cfg?.accentColor ?? '',
    instagramHandle: cfg?.instagramHandle ?? '',
    tiktokHandle: cfg?.tiktokHandle ?? '',
    platforms: cfg?.platforms ?? ['INSTAGRAM'],
    packageType: cfg?.packageType ?? 'TRIAL',
    campaignStart: cfg ? isoDay(cfg.campaignStart) : '',
    campaignEnd: cfg ? isoDay(cfg.campaignEnd) : '',
    agencyContactName: cfg?.agencyContactName ?? 'NYX Studio',
    agencyContactEmail: cfg?.agencyContactEmail ?? '',
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
      <div className="max-w-3xl mx-auto">
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
            Edit · {partner.clientName}
          </div>
          <span
            className="text-xs px-2 py-0.5 font-bold uppercase mb-1"
            style={{
              backgroundColor: '#76dc83',
              color: '#00320f',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
            }}
          >
            *{partner.status}
          </span>
        </div>
        <p
          className="text-[#e4beb5] text-sm mb-10 max-w-xl font-mono"
          style={{ fontFamily: 'var(--font-work-sans), sans-serif' }}
        >
          /portal/{partner.clientSlug}
          {!cfg && (
            <span className="block mt-2 text-[#ffb4ab] not-italic">
              Configuration row is missing — saving will create it.
            </span>
          )}
        </p>

        <BrandForm mode="edit" initial={initial} lockSlug />

        <ViewersSection clientSlug={partner.clientSlug} initialViewers={initialViewers} />
      </div>
    </div>
  )
}
