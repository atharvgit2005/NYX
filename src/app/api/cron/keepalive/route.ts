import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'

export const runtime = 'nodejs'

// Keep-alive: a Vercel Cron hits this daily so the free Supabase project never
// sits idle for 7 days (which is what triggers the auto-pause).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'db error' },
      { status: 500 }
    )
  }
}
