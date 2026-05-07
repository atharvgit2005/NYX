/**
 * One-shot seed: migrates Phase 1 src/lib/config/clients.json into the
 * BrandPartner + PendingPartnerRequest tables.
 *
 * Idempotent — safe to run multiple times. Existing rows are left alone.
 *
 * Run: npx tsx prisma/seed-portal.ts
 */
import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ApprovedClient {
  email: string
  clientSlug: string
  clientName?: string
  approvedAt: string
  approvedBy: string
}

interface PendingClient {
  email: string
  name?: string
  requestedAt: string
}

interface ClientsJson {
  approvedClients: ApprovedClient[]
  pendingClients: PendingClient[]
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'src/lib/config/clients.json')
  const raw = await fs.readFile(jsonPath, 'utf8')
  const data = JSON.parse(raw) as ClientsJson

  let approvedCreated = 0
  let approvedSkipped = 0

  for (const c of data.approvedClients ?? []) {
    const result = await prisma.brandPartner.upsert({
      where: { email: c.email.toLowerCase() },
      update: {},
      create: {
        email: c.email.toLowerCase(),
        clientSlug: c.clientSlug,
        clientName: c.clientName ?? c.clientSlug,
        approvedAt: new Date(c.approvedAt),
        approvedBy: c.approvedBy,
      },
    })
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      approvedCreated++
    } else {
      approvedSkipped++
    }
  }

  let pendingCreated = 0
  let pendingSkipped = 0

  for (const p of data.pendingClients ?? []) {
    const existing = await prisma.pendingPartnerRequest.findUnique({
      where: { email: p.email.toLowerCase() },
    })
    if (existing) {
      pendingSkipped++
      continue
    }
    await prisma.pendingPartnerRequest.create({
      data: {
        email: p.email.toLowerCase(),
        name: p.name ?? null,
        requestedAt: new Date(p.requestedAt),
      },
    })
    pendingCreated++
  }

  console.log('Seed complete:')
  console.log(`  Approved partners — created: ${approvedCreated}, already existed: ${approvedSkipped}`)
  console.log(`  Pending requests   — created: ${pendingCreated}, already existed: ${pendingSkipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
