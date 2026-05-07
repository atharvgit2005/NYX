import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import {
  listPendingPartners,
  listAllBrandPartners,
  getPortalStats,
} from '@/lib/config/clients-store'
import AdminDashboardClient from './AdminDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/automate/login?callbackUrl=' + encodeURIComponent('/portal/admin'))
  }
  if (!isAdminEmail(session.user.email)) {
    redirect('/portal')
  }

  const [pending, partners, stats] = await Promise.all([
    listPendingPartners(),
    listAllBrandPartners(),
    getPortalStats(),
  ])

  return (
    <AdminDashboardClient
      adminEmail={session.user.email}
      adminName={session.user.name ?? null}
      initialPending={pending.map(serializePending)}
      initialPartners={partners.map(serializePartner)}
      initialStats={stats}
    />
  )
}

// Prisma returns Date objects; client components want plain strings.
function serializePending(p: Awaited<ReturnType<typeof listPendingPartners>>[number]) {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    requestedAt: p.requestedAt.toISOString(),
    status: p.status,
    notes: p.notes,
  }
}

function serializePartner(p: Awaited<ReturnType<typeof listAllBrandPartners>>[number]) {
  return {
    id: p.id,
    email: p.email,
    clientSlug: p.clientSlug,
    clientName: p.clientName,
    approvedAt: p.approvedAt.toISOString(),
    approvedBy: p.approvedBy,
    status: p.status,
  }
}

export type SerializedPending = ReturnType<typeof serializePending>
export type SerializedPartner = ReturnType<typeof serializePartner>
