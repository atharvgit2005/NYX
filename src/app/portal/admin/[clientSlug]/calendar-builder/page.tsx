import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { getBrandPartnerWithConfigBySlug } from '@/lib/portal/brand-store'
import CalendarBuilderClient from './CalendarBuilderClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar Builder · Portal Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function CalendarBuilderPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/portal/login')
  if (!isAdminEmail(session.user.email)) redirect('/portal')

  const { clientSlug } = await params
  const partner = await getBrandPartnerWithConfigBySlug(clientSlug)
  if (!partner) notFound()
  const cfg = partner.configuration

  return (
    <CalendarBuilderClient
      clientSlug={partner.clientSlug}
      brandName={cfg?.brandName ?? partner.clientName}
      brandPrimaryColor={cfg?.primaryColor ?? '#D83C14'}
      defaultPlatform={cfg?.platforms?.[0] ?? 'INSTAGRAM'}
      campaignStart={cfg ? isoDay(cfg.campaignStart) : ''}
      campaignEnd={cfg ? isoDay(cfg.campaignEnd) : ''}
    />
  )
}
