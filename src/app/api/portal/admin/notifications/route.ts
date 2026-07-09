import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../_helpers'

// GET /api/portal/admin/notifications?brandPartnerId=XYZ
// Exposes unread activity log notifications to admin portal & external agents.
export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const brandPartnerId = searchParams.get('brandPartnerId')

  const where: Prisma.NotificationWhereInput = {}
  if (brandPartnerId) {
    where.brandPartnerId = brandPartnerId
  }

  try {
    const list = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        brandPartner: {
          select: {
            clientName: true,
            clientSlug: true,
          },
        },
      },
    })
    return NextResponse.json({ notifications: list })
  } catch (err) {
    console.error('[notifications GET]', err)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST /api/portal/admin/notifications/mark-read
// Marks specific or all notifications as read.
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { notificationIds, brandPartnerId } = body

    if (Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { read: true },
      })
    } else if (brandPartnerId) {
      await prisma.notification.updateMany({
        where: { brandPartnerId, read: false },
        data: { read: true },
      })
    } else {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notifications POST]', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
