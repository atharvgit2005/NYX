import { NextResponse } from 'next/server'
import {
  approvePendingPartner,
  listPendingPartners,
  rejectPendingPartner,
} from '@/lib/config/clients-store'
import { requireAdmin } from '../_helpers'

// GET /api/admin/portal/pending — list all pending requests
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const items = await listPendingPartners()
  return NextResponse.json({ items })
}

// POST /api/admin/portal/pending — approve OR reject a pending request
//   body: { action: 'approve', email, clientName, clientSlug }
//   body: { action: 'reject',  email, notes? }
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, email } = body ?? {}
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  try {
    if (action === 'approve') {
      const { clientName, clientSlug } = body
      if (typeof clientName !== 'string' || !clientName.trim()) {
        return NextResponse.json({ error: 'clientName required' }, { status: 400 })
      }
      if (typeof clientSlug !== 'string' || !clientSlug.trim()) {
        return NextResponse.json({ error: 'clientSlug required' }, { status: 400 })
      }
      const partner = await approvePendingPartner({
        email,
        clientSlug,
        clientName,
        approvedBy: auth.email,
      })
      return NextResponse.json({ partner })
    }

    if (action === 'reject') {
      const updated = await rejectPendingPartner({ email, notes: body.notes })
      return NextResponse.json({ pending: updated })
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 },
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Operation failed' },
      { status: 400 },
    )
  }
}
