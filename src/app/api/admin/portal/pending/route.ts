/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../../../portal/admin/_helpers'
import { approvePendingPartner, rejectPendingPartner } from '@/lib/config/clients-store'

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, email } = body
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  if (action === 'approve') {
    const mode = body.mode ?? 'new' // 'new' | 'existing'
    const targetEmail = email.toLowerCase()

    if (mode === 'existing') {
      const { existingPartnerId, existingRole } = body
      if (!existingPartnerId) {
        return NextResponse.json({ error: 'Existing brand ID is required' }, { status: 400 })
      }

      // Check if brand exists
      const brand = await prisma.brandPartner.findUnique({
        where: { id: existingPartnerId }
      })
      if (!brand) {
        return NextResponse.json({ error: 'Brand partner not found' }, { status: 404 })
      }

      try {
        if (existingRole === 'viewer') {
          // Add as read-only viewer guest
          await prisma.$transaction([
            prisma.pendingPartnerRequest.deleteMany({ where: { email: targetEmail } }),
            prisma.portalViewer.upsert({
              where: { brandPartnerId_email: { brandPartnerId: existingPartnerId, email: targetEmail } },
              create: {
                brandPartnerId: existingPartnerId,
                email: targetEmail,
                name: body.clientName ?? targetEmail.split('@')[0],
                addedBy: auth.email
              },
              update: {}
            })
          ])
        } else {
          // Promote as main Brand Partner
          await prisma.$transaction([
            prisma.pendingPartnerRequest.deleteMany({ where: { email: targetEmail } }),
            prisma.brandPartner.update({
              where: { id: existingPartnerId },
              data: { email: targetEmail }
            })
          ])
        }

        return NextResponse.json({ ok: true })
      } catch (err: any) {
        return NextResponse.json({ error: err.message ?? 'Approval failed' }, { status: 500 })
      }
    } else {
      // Create new brand portal
      const { clientName, clientSlug, featuresAccess } = body
      if (!clientName || !clientSlug) {
        return NextResponse.json({ error: 'Client name and slug are required' }, { status: 400 })
      }

      try {
        // Step 1: Approve pending partner (creates BrandPartner row)
        const partner = await approvePendingPartner({
          email: targetEmail,
          clientSlug,
          clientName,
          approvedBy: auth.email
        })

        // Step 2: Create a default BrandConfiguration row with custom featuresAccess
        const campaignStart = new Date()
        const campaignEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        
        await prisma.brandConfiguration.create({
          data: {
            brandPartnerId: partner.id,
            brandName: clientName,
            primaryColor: '#D83C14',
            secondaryColor: '#ffd65b',
            platforms: ['INSTAGRAM'],
            packageType: 'TRIAL',
            campaignStart,
            campaignEnd,
            featuresAccess: featuresAccess ?? null
          }
        })

        return NextResponse.json({ ok: true })
      } catch (err: any) {
        return NextResponse.json({ error: err.message ?? 'Approval failed' }, { status: 500 })
      }
    }
  } else if (action === 'reject') {
    const { notes } = body
    try {
      await rejectPendingPartner({ email, notes })
      return NextResponse.json({ ok: true })
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Rejection failed' }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
  }
}
