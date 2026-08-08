import 'dotenv/config'
import prisma from '../src/lib/prismadb'

async function runKeepalive() {
  console.log('🔄 Starting Supabase keepalive ping...')
  const timestamp = new Date().toISOString()
  
  // 1. Prisma Query Ping
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    console.log(`✅ [DB] Prisma PostgreSQL query succeeded in ${Date.now() - start}ms`)
  } catch (err) {
    console.error('❌ [DB] Prisma query failed:', err instanceof Error ? err.message : err)
  }

  // 2. Supabase Gateway REST Ping
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
  const match = directUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/)
  const projectRef = match?.[1] || 'tjoojjnxrtgonqucxpbc'
  const restUrl = `https://${projectRef}.supabase.co/rest/v1/`

  try {
    const start = Date.now()
    const res = await fetch(restUrl, { headers: { 'User-Agent': 'NYX-Keepalive-CLI/1.0' } })
    console.log(`✅ [REST Gateway] Pinged ${restUrl} -> HTTP ${res.status} in ${Date.now() - start}ms`)
  } catch (err) {
    console.error('❌ [REST Gateway] Ping failed:', err instanceof Error ? err.message : err)
  }

  console.log(`✨ Keepalive completed at ${timestamp}`)
}

runKeepalive()
  .catch((err) => {
    console.error('Fatal error during keepalive:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
