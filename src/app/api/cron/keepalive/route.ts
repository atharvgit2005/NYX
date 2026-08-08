import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'

export const runtime = 'nodejs'

function getSupabaseRestUrl(): string | null {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL

  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
  const match = directUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/)
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`
  }
  const matchHost = directUrl.match(/@([a-z0-9.-]+\.supabase\.co)/)
  if (matchHost && matchHost[1]) {
    const ref = matchHost[1].replace('db.', '')
    return `https://${ref}`
  }
  return null
}

// Multi-layered keep-alive:
// 1. Prisma Postgres SELECT 1 query
// 2. Direct Supabase HTTP REST API Gateway ping
export async function GET() {
  const timestamp = new Date().toISOString()
  const results: Record<string, unknown> = {
    timestamp,
    db: { ok: false },
    rest: { ok: false },
  }

  // 1. Ping PostgreSQL via Prisma
  try {
    const startDb = Date.now()
    await prisma.$queryRaw`SELECT 1`
    results.db = {
      ok: true,
      latencyMs: Date.now() - startDb,
      message: 'Prisma PostgreSQL query successful',
    }
  } catch (err) {
    results.db = {
      ok: false,
      error: err instanceof Error ? err.message : 'Prisma DB connection failed',
    }
  }

  // 2. Direct HTTP Ping to Supabase API Gateway to wake/keep alive
  const supabaseUrl = getSupabaseRestUrl()
  if (supabaseUrl) {
    try {
      const startRest = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'NYX-Keepalive-Cron/1.0',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      results.rest = {
        ok: response.status >= 200 && response.status < 500,
        status: response.status,
        latencyMs: Date.now() - startRest,
        url: `${supabaseUrl}/rest/v1/`,
      }
    } catch (err) {
      results.rest = {
        ok: false,
        error: err instanceof Error ? err.message : 'Supabase REST ping failed',
      }
    }
  }

  const dbOk = Boolean((results.db as { ok?: boolean })?.ok)
  const restOk = Boolean((results.rest as { ok?: boolean })?.ok)
  const isOk = dbOk || restOk

  return NextResponse.json(
    {
      ok: isOk,
      message: isOk
        ? 'Supabase keepalive ping successful'
        : 'Supabase keepalive ping failed for both DB and REST',
      details: results,
    },
    { status: isOk ? 200 : 500 }
  )
}

