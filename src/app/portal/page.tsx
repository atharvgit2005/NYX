import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { addPendingClient } from '@/lib/config/clients-store'
import { getAccessibleBrandsForEmail } from '@/lib/portal/accessible-brands'
import PendingApprovalScreen from './components/PendingApprovalScreen'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal | NYX Studio',
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

  // Get all accessible brands for this email (as owner or guest viewer)
  const brands = await getAccessibleBrandsForEmail(email)

  if (brands.length === 1) {
    // Single brand → direct redirect to that portal
    redirect(`/portal/${brands[0].clientSlug}`)
  } else if (brands.length > 1) {
    // Multiple brands → brand selection page
    redirect('/portal/select-brand')
  }

  // 0 brands → record as pending and show holding screen
  await addPendingClient(email, name)

  return <PendingApprovalScreen email={email} name={name} />
}
