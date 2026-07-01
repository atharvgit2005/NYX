import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../../admin/_helpers'

async function partnerIdForSlug(slug: string): Promise<string | null> {
  const p = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    select: { id: true },
  })
  return p?.id ?? null
}

// GET /api/portal/[clientSlug]/monthly-summary?year=2026&monthIndex=6
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> }
) {
  const { clientSlug } = await params
  const partnerId = await partnerIdForSlug(clientSlug)
  if (!partnerId) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const year = parseInt(url.searchParams.get('year') ?? '', 10)
  const monthIndex = parseInt(url.searchParams.get('monthIndex') ?? '', 10)

  if (isNaN(year) || isNaN(monthIndex)) {
    return NextResponse.json({ error: 'Invalid year or monthIndex' }, { status: 400 })
  }

  const summary = await prisma.monthlySummary.findUnique({
    where: {
      brandPartnerId_year_monthIndex: {
        brandPartnerId: partnerId,
        year,
        monthIndex,
      },
    },
  })

  return NextResponse.json({ content: summary?.content ?? '' })
}

// POST /api/portal/[clientSlug]/monthly-summary
// Body: { year: number, monthIndex: number, content: string }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  const { clientSlug } = await params
  const partnerId = await partnerIdForSlug(clientSlug)
  if (!partnerId) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  let body: { year?: number; monthIndex?: number; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { year, monthIndex, content = '' } = body

  if (year === undefined || monthIndex === undefined || isNaN(year) || isNaN(monthIndex)) {
    return NextResponse.json({ error: 'Invalid year or monthIndex' }, { status: 400 })
  }

  const summary = await prisma.monthlySummary.upsert({
    where: {
      brandPartnerId_year_monthIndex: {
        brandPartnerId: partnerId,
        year,
        monthIndex,
      },
    },
    update: {
      content,
    },
    create: {
      brandPartnerId: partnerId,
      year,
      monthIndex,
      content,
    },
  })

  return NextResponse.json({ summary })
}
