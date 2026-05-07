import { NextResponse } from 'next/server'
import { listAllBrandPartners } from '@/lib/config/clients-store'
import { requireAdmin } from '../_helpers'

// GET /api/admin/portal/partners — list active + paused partners
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const items = await listAllBrandPartners()
  return NextResponse.json({ items })
}
