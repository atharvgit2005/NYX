import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'

export const runtime = 'nodejs'

// Keep-alive: a Vercel Cron hits this daily so the free Supabase project never
// sits idle for 7 days (which is what triggers the auto-pause).
export async function GET() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const durationMs = Date.now() - start
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      latencyMs: durationMs,
      message: 'Supabase database ping successful',
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'db error',
      },
      { status: 500 }
    )
  }
}
