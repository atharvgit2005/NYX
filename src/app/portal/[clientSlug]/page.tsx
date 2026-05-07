import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { findApprovedClient } from '@/lib/config/clients-store'
import SignOutButton from '../components/SignOutButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ClientPlaceholderPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>
}) {
  const { clientSlug } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect(
      '/automate/login?callbackUrl=' +
        encodeURIComponent(`/portal/${clientSlug}`),
    )
  }

  const email = session.user.email

  // Admins are allowed to view any client's portal (useful for previews)
  if (!isAdminEmail(email)) {
    const approved = await findApprovedClient(email)
    if (!approved) {
      // Logged in but unknown → router decides (will land on pending screen)
      redirect('/portal')
    }
    if (approved.clientSlug !== clientSlug) {
      // Trying to access another client's slug → bounce to their own
      redirect(`/portal/${approved.clientSlug}`)
    }
  }

  // For admins viewing any slug, look it up too (for the welcome name)
  const approved = await findApprovedClient(email)
  const clientName = approved?.clientName ?? clientSlug

  // Phase 1 placeholder UI
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A2A5E] font-body flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full border-4 border-black bg-white p-8 md:p-12">
        <p className="font-label uppercase tracking-widest text-xs text-[#E8441A] mb-4">
          NYX Studio · Client Portal
        </p>
        <h1 className="font-headline font-black text-4xl md:text-6xl uppercase leading-[0.95] tracking-tighter mb-6">
          Welcome,
          <br />
          <span className="text-[#E8441A]">
            {clientName.charAt(0).toUpperCase() + clientName.slice(1)}
          </span>
        </h1>
        <p className="text-lg text-black/70 mb-2">
          Your content calendar is coming in Phase 3.
        </p>
        <p className="text-sm text-black/60 mb-8 leading-relaxed">
          For now this page just confirms the routing works. Once Phase 3 ships,
          you&rsquo;ll see your full monthly content plan, approval flows, and feed
          preview here.
        </p>

        <div className="border-t border-black/20 pt-6 mb-6">
          <p className="font-label uppercase tracking-wider text-xs text-black/50 mb-2">
            Signed in as
          </p>
          {session.user.name && (
            <p className="font-headline text-xl font-bold mb-0.5">
              {session.user.name}
            </p>
          )}
          <p className="text-sm text-black/70">{session.user.email}</p>
        </div>

        <SignOutButton variant="light" />
      </div>
    </div>
  )
}
