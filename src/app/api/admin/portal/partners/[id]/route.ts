import { NextResponse } from 'next/server'
import { setBrandPartnerStatus } from '@/lib/config/clients-store'
import { requireAdmin } from '../../_helpers'

// PATCH /api/admin/portal/partners/[id]
//   body: { status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  const { id } = await params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status } = body ?? {}
  if (status !== 'ACTIVE' && status !== 'PAUSED' && status !== 'ARCHIVED') {
    return NextResponse.json(
      { error: 'status must be ACTIVE, PAUSED, or ARCHIVED' },
      { status: 400 },
    )
  }

  try {
    const partner = await setBrandPartnerStatus(id, status)
    return NextResponse.json({ partner })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Update failed' },
      { status: 400 },
    )
  }
}
