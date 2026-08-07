/**
 * Seed Habibs BrandPartner, BrandConfiguration, and 8 ContentPost rows into Postgres (Prisma).
 *
 * Pulls posts from src/app/clients/data/habibs.config.json.
 *
 * Idempotent — safe to re-run.
 *
 * Run: npx tsx prisma/seed-habibs.ts
 */
import { PrismaClient, ContentType, PostStatus, PackageType, Platform } from '@prisma/client'
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
  client: {
    name: string
    tagline: string
    contact: string
    email: string
    phone: string
    products: string[]
    operations: string
    logoUrl: string
  }
  brand: {
    primary: string
    secondary: string
    accent: string
  }
  posts: JsonPost[]
  packB: {
    title: string
    description: string
    sources: string[]
    goals: string[]
  }
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
  const jsonPath = path.join(
    process.cwd(),
    'src/app/clients/data/habibs.config.json',
  )
  const raw = await fs.readFile(jsonPath, 'utf8')
  const data = JSON.parse(raw) as JsonConfig

  // 1. Upsert BrandPartner
  const partner = await prisma.brandPartner.upsert({
    where: { clientSlug: 'habibs' },
    update: {
      clientName: 'Habibs',
      email: 'habibs@nyxstudio.in',
      status: 'ACTIVE',
    },
    create: {
      clientSlug: 'habibs',
      clientName: 'Habibs',
      email: 'habibs@nyxstudio.in',
      approvedBy: 'atharv@nyxstudio.tech',
      status: 'ACTIVE',
    },
  })

  // 2. Upsert BrandConfiguration
  await prisma.brandConfiguration.upsert({
    where: { brandPartnerId: partner.id },
    update: {
      brandName: 'Habibs',
      tagline: data.client.tagline,
      logoUrl: data.client.logoUrl,
      primaryColor: '#E50914',
      secondaryColor: '#111111',
      accentColor: data.brand.accent,
      instagramHandle: 'habibssalon',
      clientContactName: data.client.contact,
      clientPhone: data.client.phone,
      products: data.client.products,
      operations: data.client.operations,
      packageType: PackageType.TRIAL,
      campaignStart: new Date('2026-08-10T00:00:00Z'),
      campaignEnd: new Date('2026-08-20T00:00:00Z'),
      platforms: [Platform.INSTAGRAM],
      agencyContactName: 'NYX Studio',
      agencyContactEmail: 'official.nyxstudio@gmail.com',
      packBEnabled: true,
      packBTitle: data.packB.title,
      packBDescription: data.packB.description,
      packBSourcePostIds: [],
      packBSourceLabels: data.packB.sources,
      packBGoals: data.packB.goals,
      featuresAccess: { calendar: true, cards: true, feed: true, tracker: true, packB: true },
    },
    create: {
      brandPartnerId: partner.id,
      brandName: 'Habibs',
      tagline: data.client.tagline,
      logoUrl: data.client.logoUrl,
      primaryColor: '#E50914',
      secondaryColor: '#111111',
      accentColor: data.brand.accent,
      instagramHandle: 'habibssalon',
      clientContactName: data.client.contact,
      clientPhone: data.client.phone,
      products: data.client.products,
      operations: data.client.operations,
      packageType: PackageType.TRIAL,
      campaignStart: new Date('2026-08-10T00:00:00Z'),
      campaignEnd: new Date('2026-08-20T00:00:00Z'),
      platforms: [Platform.INSTAGRAM],
      agencyContactName: 'NYX Studio',
      agencyContactEmail: 'official.nyxstudio@gmail.com',
      packBEnabled: true,
      packBTitle: data.packB.title,
      packBDescription: data.packB.description,
      packBSourcePostIds: [],
      packBSourceLabels: data.packB.sources,
      packBGoals: data.packB.goals,
      featuresAccess: { calendar: true, cards: true, feed: true, tracker: true, packB: true },
    },
  })

  // 3. Create posts if none exist
  const existing = await prisma.contentPost.count({
    where: { brandPartnerId: partner.id },
  })

  if (existing === 0) {
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
    console.log(`Seed complete: ${created} content posts inserted for Habibs.`)
  } else {
    console.log(`Habibs already has ${existing} content posts in database.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
