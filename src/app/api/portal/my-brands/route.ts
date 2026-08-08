import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAccessibleBrandsForEmail } from '@/lib/portal/accessible-brands'
import { isAdminEmail } from '@/lib/config/admins'
import prisma from '@/lib/prismadb'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = session.user.email

  // If admin, return all active/paused brands
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

    const brands = allBrands.map((p) => ({
      id: p.id,
      clientSlug: p.clientSlug,
      clientName: p.clientName,
      logoUrl: p.configuration?.logoUrl ?? null,
      tagline: p.configuration?.tagline ?? null,
      primaryColor: p.configuration?.primaryColor ?? null,
      secondaryColor: p.configuration?.secondaryColor ?? null,
      accentColor: p.configuration?.accentColor ?? null,
      role: 'ADMIN' as const,
      status: p.status,
    }))

    return NextResponse.json({ brands, email, isAdmin: true })
  }

  const brands = await getAccessibleBrandsForEmail(email)
  return NextResponse.json({ brands, email, isAdmin: false })
}
