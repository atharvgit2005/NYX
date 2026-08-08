import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'
import { getAccessibleBrandsForEmail } from '@/lib/portal/accessible-brands'
import prisma from '@/lib/prismadb'
import BrandSelectionClient from './BrandSelectionClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Select Brand Portal | NYX Studio',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SelectBrandPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/portal/login?callbackUrl=' + encodeURIComponent('/portal/select-brand'))
  }

  const email = session.user.email
  const name = session.user.name ?? undefined

  let brands = await getAccessibleBrandsForEmail(email)

  // If admin, load all active/paused brands
  if (isAdminEmail(email)) {
    const allBrands = await prisma.brandPartner.findMany({
      where: { status: { in: ['ACTIVE', 'PAUSED'] } },
      include: {
        configuration: {
          select: {
            logoUrl: true,
            tagline: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true,
          },
        },
      },
      orderBy: { clientName: 'asc' },
    })

    brands = allBrands.map((p) => ({
      id: p.id,
      clientSlug: p.clientSlug,
      clientName: p.clientName,
      logoUrl: p.configuration?.logoUrl ?? null,
      tagline: p.configuration?.tagline ?? null,
      primaryColor: p.configuration?.primaryColor ?? null,
      secondaryColor: p.configuration?.secondaryColor ?? null,
      accentColor: p.configuration?.accentColor ?? null,
      role: 'OWNER' as const,
      status: p.status,
    }))
  }

  if (brands.length === 0) {
    redirect('/portal')
  }

  return (
    <BrandSelectionClient
      brands={brands}
      user={{
        name,
        email,
      }}
    />
  )
}
