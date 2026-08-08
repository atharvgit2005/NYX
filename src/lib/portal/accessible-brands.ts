import prisma from '@/lib/prismadb'

export interface AccessibleBrand {
  id: string
  clientSlug: string
  clientName: string
  logoUrl?: string | null
  tagline?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  role: 'OWNER' | 'VIEWER'
  status: string
}

export async function getAccessibleBrandsForEmail(email: string): Promise<AccessibleBrand[]> {
  const targetEmail = email.toLowerCase().trim()
  if (!targetEmail) return []

  // 1. Fetch all BrandPartner rows where this email is the owner
  const ownedPartners = await prisma.brandPartner.findMany({
    where: {
      email: targetEmail,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
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

  // 2. Fetch all PortalViewer rows where this email is invited as a guest/viewer
  const viewerRows = await prisma.portalViewer.findMany({
    where: {
      email: targetEmail,
      brandPartner: {
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    },
    include: {
      brandPartner: {
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
      },
    },
    orderBy: { brandPartner: { clientName: 'asc' } },
  })

  const map = new Map<string, AccessibleBrand>()

  // Add owned brands first (OWNER role)
  for (const p of ownedPartners) {
    map.set(p.clientSlug, {
      id: p.id,
      clientSlug: p.clientSlug,
      clientName: p.clientName,
      logoUrl: p.configuration?.logoUrl ?? null,
      tagline: p.configuration?.tagline ?? null,
      primaryColor: p.configuration?.primaryColor ?? null,
      secondaryColor: p.configuration?.secondaryColor ?? null,
      accentColor: p.configuration?.accentColor ?? null,
      role: 'OWNER',
      status: p.status,
    })
  }

  // Add viewer brands if not already mapped as OWNER
  for (const v of viewerRows) {
    const p = v.brandPartner
    if (!map.has(p.clientSlug)) {
      map.set(p.clientSlug, {
        id: p.id,
        clientSlug: p.clientSlug,
        clientName: p.clientName,
        logoUrl: p.configuration?.logoUrl ?? null,
        tagline: p.configuration?.tagline ?? null,
        primaryColor: p.configuration?.primaryColor ?? null,
        secondaryColor: p.configuration?.secondaryColor ?? null,
        accentColor: p.configuration?.accentColor ?? null,
        role: 'VIEWER',
        status: p.status,
      })
    }
  }

  return Array.from(map.values())
}
