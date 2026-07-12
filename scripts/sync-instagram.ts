import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

interface ScrapedPost {
  caption: string
  likes: number
  imageUrl: string
  shortcode: string
  url: string
  takenAt: Date
}

async function scrapeInstagramAPI(username: string): Promise<ScrapedPost[]> {
  const rawSid = process.env.IG_SESSIONID
  if (!rawSid) {
    throw new Error('IG_SESSIONID environment variable is missing!')
  }
  const sid = decodeURIComponent(rawSid)
  const dsUserId = sid.split(':')[0] || ''
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'X-IG-App-ID': '936619743392459',
    'Cookie': `sessionid=${sid}; ds_user_id=${dsUserId}`,
    'Referer': `https://www.instagram.com/${username}/`,
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'X-Requested-With': 'XMLHttpRequest'
  }

  // 1. Get user ID
  const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`
  const profileRes = await axios.get(profileUrl, { headers })
  const userId = profileRes.data?.data?.user?.id
  if (!userId) {
    throw new Error(`Could not resolve profile user ID for @${username}`)
  }

  // 2. Fetch recent feed posts
  const feedUrl = `https://www.instagram.com/api/v1/feed/user/${userId}/?count=30`
  const feedRes = await axios.get(feedUrl, { headers })
  const items = feedRes.data?.items || []

  return items.map((node: any) => {
    const capObj = node.caption?.text || node.caption || ''
    const caption = typeof capObj === 'string' ? capObj : (capObj?.text || '')
    const likes = node.like_count ?? 0
    const imageUrl = node.image_versions2?.candidates?.[0]?.url || 
                     node.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || 
                     node.thumbnail_src || ''
    const shortcode = node.code || ''
    const url = `https://www.instagram.com/p/${shortcode}/`
    const takenAt = node.taken_at ? new Date(Number(node.taken_at) * 1000) : new Date()

    return { caption, likes, imageUrl, shortcode, url, takenAt }
  })
}

// Format Date as YYYY-MM-DD
function toDateString(date: Date): string {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

async function syncBrand(slug: string, handle: string) {
  console.log(`\n============================================================`)
  console.log(`Syncing brand "${slug}" (@${handle})...`)
  console.log(`============================================================`)

  // Step 1: Update the handle in DB
  const brand = await prisma.brandPartner.findFirst({
    where: { clientSlug: slug },
    include: { configuration: true }
  })

  if (!brand) {
    console.error(`Brand "${slug}" not found in database.`)
    return
  }

  if (brand.configuration && brand.configuration.instagramHandle !== handle) {
    console.log(`Updating configuration instagramHandle to "${handle}"...`)
    await prisma.brandConfiguration.update({
      where: { brandPartnerId: brand.id },
      data: { instagramHandle: handle }
    })
  }

  // Step 2: Fetch scheduled ContentPosts
  const scheduledPosts = await prisma.contentPost.findMany({
    where: { brandPartnerId: brand.id, archivedAt: null },
    orderBy: { scheduledDate: 'asc' }
  })
  console.log(`Found ${scheduledPosts.length} scheduled posts in database.`)

  // Step 3: Scrape Instagram posts
  let scrapedPosts: ScrapedPost[] = []
  try {
    scrapedPosts = await scrapeInstagramAPI(handle)
    console.log(`Scraped ${scrapedPosts.length} posts from Instagram.`)
  } catch (err: any) {
    console.error(`Scraping failed: ${err.message}`)
    return
  }

  // Step 4: Map and match
  let syncCount = 0
  for (const scraped of scrapedPosts) {
    const scrapedDateStr = toDateString(scraped.takenAt)
    
    // Find matching post in database
    // We look for dates within a +/- 1 day window.
    // Also we match based on caption text overlap (e.g. keywords) if date matches.
    const candidates = scheduledPosts.filter(p => {
      const scheduledDateStr = toDateString(p.scheduledDate)
      const dateDiffDays = Math.abs(
        (new Date(scheduledDateStr).getTime() - new Date(scrapedDateStr).getTime()) / (1000 * 60 * 60 * 24)
      )
      return dateDiffDays <= 1.5 // within 1.5 days
    })

    if (candidates.length === 0) {
      continue
    }

    // Pick the best candidate
    // If we have multiple candidates, match by title/caption keywords or choose the closest date.
    let bestMatch = candidates[0]
    if (candidates.length > 1) {
      let maxScore = -1
      for (const cand of candidates) {
        let score = 0
        // Check text intersection
        const scrapedWords = scraped.caption.toLowerCase().split(/\s+/)
        const candTitleWords = cand.title.toLowerCase().split(/\s+/)
        const commonWords = candTitleWords.filter(w => w.length > 3 && scrapedWords.includes(w))
        score += commonWords.length * 10
        
        // Exact date match bonus
        if (toDateString(cand.scheduledDate) === scrapedDateStr) {
          score += 5
        }
        
        if (score > maxScore) {
          maxScore = score
          bestMatch = cand
        }
      }
    }

    // Link the post!
    if (bestMatch && bestMatch.status !== 'POSTED') {
      console.log(`\nLinking:`)
      console.log(`  Scraped Date: ${scrapedDateStr}`)
      console.log(`  Scraped Link: ${scraped.url}`)
      console.log(`  Match Title : "${bestMatch.title}" (${toDateString(bestMatch.scheduledDate)})`)
      
      await prisma.contentPost.update({
        where: { id: bestMatch.id },
        data: {
          status: 'POSTED',
          instagramUrl: scraped.url,
          thumbnailUrl: scraped.imageUrl || bestMatch.thumbnailUrl
        }
      })
      syncCount++
    }
  }

  console.log(`\nLinked ${syncCount} posts for brand "${slug}".`)
}

async function main() {
  await syncBrand('dessertino', 'dessertino.vimannagar')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
