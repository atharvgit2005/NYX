import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { findApprovedClient, addPendingClient } from '@/lib/config/clients-store'
import { listBrandsForViewer } from '@/lib/portal/viewer-store'
import PendingApprovalScreen from './components/PendingApprovalScreen'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ClientPortalRouter() {
  const session = await getServerSession(authOptions)

  // Not signed in → bounce to existing login with callback back here
  if (!session?.user?.email) {
    redirect('/portal/login?callbackUrl=' + encodeURIComponent('/portal'))
  }

  const email = session.user.email
  const name = session.user.name ?? undefined

  // Admin → admin dashboard
  if (isAdminEmail(email)) {
    redirect('/portal/admin')
  }

  // Approved client → their portal
  const approved = await findApprovedClient(email)
  if (approved) {
    redirect(`/portal/${approved.clientSlug}`)
  }

  // Read-only viewer → first brand they're invited to
  // (single-brand viewer is the common case; multi-brand viewers land on
  // their first brand and can navigate manually if they need to switch.)
  const viewerOf = await listBrandsForViewer(email)
  const activeViewerEntry = viewerOf.find(
    (v) => v.brandPartner.status === 'ACTIVE' || v.brandPartner.status === 'PAUSED',
  )
  if (activeViewerEntry) {
    redirect(`/portal/${activeViewerEntry.brandPartner.clientSlug}`)
  }

  // Unknown → record as pending and show holding screen
  await addPendingClient(email, name)

  return <PendingApprovalScreen email={email} name={name} />
}
