/**
 * Seed Dessertino's 8 content calendar posts into ContentPost.
 *
 * Pulls the 8 posts from the existing
 * src/app/clients/data/dessertino.config.json (single source of truth)
 * to avoid drift between the legacy /clients UI and the Phase 3 portal.
 *
 * Idempotent — if Dessertino already has any ContentPost rows, the script
 * does nothing. Re-run safely.
 *
 * Run: npx tsx prisma/seed-dessertino-content.ts
 */
import { PrismaClient, ContentType, PostStatus } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface JsonPost {
  id: number
  title: string
  date: string
  type: string
  status: string
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string
}

interface JsonConfig {
  posts: JsonPost[]
}

function mapType(s: string): ContentType {
  switch (s) {
    case 'Reel':
      return ContentType.REEL
    case 'Carousel':
      return ContentType.CAROUSEL
    case 'Photo':
      return ContentType.STATIC_POST
    case 'Story':
      return ContentType.STORY
    case 'Reel + Story':
      return ContentType.REEL_STORY
    default:
      throw new Error(`Unknown content type: "${s}"`)
  }
}

function mapStatus(s: string): PostStatus {
  switch (s) {
    case 'Idea':
      return PostStatus.IDEA
    case 'Drafting':
      return PostStatus.DRAFTING
    case 'Needs Approval':
      return PostStatus.NEEDS_APPROVAL
    case 'Needs Revision':
      return PostStatus.NEEDS_REVISION
    case 'Approved':
      return PostStatus.APPROVED
    case 'Posted':
      return PostStatus.POSTED
    default:
      throw new Error(`Unknown post status: "${s}"`)
  }
}

async function main() {
  const partner = await prisma.brandPartner.findUnique({
    where: { clientSlug: 'dessertino' },
  })
  if (!partner) {
    throw new Error(
      'Dessertino BrandPartner not found. Run prisma/seed-portal.ts first.',
    )
  }

  const existing = await prisma.contentPost.count({
    where: { brandPartnerId: partner.id },
  })
  if (existing > 0) {
    console.log(
      `Dessertino already has ${existing} content posts — skipping seed (idempotent).`,
    )
    return
  }

  const jsonPath = path.join(
    process.cwd(),
    'src/app/clients/data/dessertino.config.json',
  )
  const raw = await fs.readFile(jsonPath, 'utf8')
  const data = JSON.parse(raw) as JsonConfig

  let created = 0
  for (const p of data.posts) {
    await prisma.contentPost.create({
      data: {
        brandPartnerId: partner.id,
        title: p.title,
        scheduledDate: new Date(p.date + 'T10:00:00Z'),
        contentType: mapType(p.type),
        status: mapStatus(p.status),
        caption: p.caption,
        hashtags: p.hashtags,
        visualDirection: p.visualDirection,
        productionNotes: p.productionNotes,
        position: p.id,
      },
    })
    created++
  }

  console.log(`Seed complete: ${created} content posts inserted for Dessertino.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
