/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import axios from 'axios'

export const runtime = 'nodejs'

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
  const feedUrl = `https://www.instagram.com/api/v1/feed/user/${userId}/?count=24`
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

function toDateString(date: Date): string {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

export async function GET(req: Request) {
  // Guard with CRON_SECRET if present
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch all brands that have active configs with instagram handles
    const brands = await prisma.brandPartner.findMany({
      where: { status: 'ACTIVE' },
      include: { configuration: true }
    })

    const results = []

    for (const brand of brands) {
      const handle = brand.configuration?.instagramHandle
      if (!handle) continue

      console.log(`Syncing brand ${brand.clientSlug} (@${handle})...`)
      
      // Fetch scheduled posts
      const scheduledPosts = await prisma.contentPost.findMany({
        where: { brandPartnerId: brand.id, archivedAt: null },
        orderBy: { scheduledDate: 'asc' }
      })

      // Fetch scraped posts
      let scrapedPosts: ScrapedPost[] = []
      try {
        scrapedPosts = await scrapeInstagramAPI(handle)
      } catch (err: any) {
        console.error(`Scraping failed for @${handle}:`, err.message)
        results.push({ brand: brand.clientSlug, success: false, error: err.message })
        continue
      }

      let linkedCount = 0
      for (const scraped of scrapedPosts) {
        const scrapedDateStr = toDateString(scraped.takenAt)

        const candidates = scheduledPosts.filter(p => {
          const scheduledDateStr = toDateString(p.scheduledDate)
          const dateDiffDays = Math.abs(
            (new Date(scheduledDateStr).getTime() - new Date(scrapedDateStr).getTime()) / (1000 * 60 * 60 * 24)
          )
          return dateDiffDays <= 1.5
        })

        if (candidates.length === 0) continue

        let bestMatch = candidates[0]
        if (candidates.length > 1) {
          let maxScore = -1
          for (const cand of candidates) {
            let score = 0
            const scrapedWords = scraped.caption.toLowerCase().split(/\s+/)
            const candTitleWords = cand.title.toLowerCase().split(/\s+/)
            const commonWords = candTitleWords.filter(w => w.length > 3 && scrapedWords.includes(w))
            score += commonWords.length * 10
            
            if (toDateString(cand.scheduledDate) === scrapedDateStr) {
              score += 5
            }
            
            if (score > maxScore) {
              maxScore = score
              bestMatch = cand
            }
          }
        }

        if (bestMatch && bestMatch.status !== 'POSTED') {
          await prisma.contentPost.update({
            where: { id: bestMatch.id },
            data: {
              status: 'POSTED',
              instagramUrl: scraped.url,
              thumbnailUrl: scraped.imageUrl || bestMatch.thumbnailUrl
            }
          })
          linkedCount++
        }
      }

      results.push({ brand: brand.clientSlug, success: true, linkedCount })
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Unknown sync error' },
      { status: 500 }
    )
  }
}

// Support POST request triggers as well
export async function POST(req: Request) {
  return GET(req)
}
