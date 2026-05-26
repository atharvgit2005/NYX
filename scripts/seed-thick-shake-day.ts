/**
 * Apply the 15-post "Thick Shake Day" campaign calendar to Dessertino.
 *
 * One-off. Run: `npx tsx scripts/seed-thick-shake-day.ts`
 *
 * Idempotent on (brandPartnerId, scheduledDate, title): re-running
 * skips any post whose triple is already present.
 *
 * Times are encoded as IST (UTC+5:30) — stored as the equivalent UTC
 * instant so the portal renders them correctly regardless of viewer TZ.
 */
import { PrismaClient, ContentType, Platform, PostStatus } from '@prisma/client'

const prisma = new PrismaClient()

const BRAND_SLUG = 'dessertino'
const CAMPAIGN_LABEL = 'campaign: thick-shake-day-june25'

interface Seed {
  /** IST date in YYYY-MM-DD */
  date: string
  /** IST time in HH:MM (24h) */
  time: string
  title: string
  contentType: ContentType
  platform: Platform
  caption: string
  visualDirection: string
  hashtags: string[]
  productionNotes: string
}

/** Convert an IST date+time string to a UTC Date object. */
function istToUtc(date: string, time: string): Date {
  // IST = UTC + 5:30. To turn an IST wall-clock into the UTC instant
  // we *subtract* 5:30. Constructing the Date as "+05:30" does that.
  return new Date(`${date}T${time}:00+05:30`)
}

/** Strip leading # from hashtags; collapse whitespace. */
function clean(tags: string[]): string[] {
  return tags
    .map((t) => t.trim().replace(/^#+/, ''))
    .filter(Boolean)
}

const POSTS: Seed[] = [
  {
    date: '2026-05-26',
    time: '21:00',
    title: 'Teaser #1 — The First Pour',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `some things take time to pour. 🖤\nsomething is coming. stay close.`,
    visualDirection: `Extreme close-up of thick shake slowly pouring. Zero branding. End card: black screen, white text — "05.06.25" only. Cinematic, no music — just pour sound ASMR or minimal dark beat.`,
    hashtags: clean(['#DessertinoSecrets', '#SomethingThick', '#PuneFood', '#ComingSoon', '#PuneDesserts']),
    productionNotes: `No Dessertino name or logo anywhere on this post. Mystery is the entire hook. Post at 9 PM sharp for maximum evening engagement.`,
  },
  {
    date: '2026-05-27',
    time: '11:00',
    title: 'Story — The Guess Poll',
    contentType: ContentType.STORY,
    platform: Platform.INSTAGRAM,
    caption: `Slide 1: "can you guess what's coming? 👀" | Poll: "Yes I know 👀" / "No idea 🤷"\nSlide 2: "DM us the word THICK to find out first 🤫" | Dark background, bold white text, link sticker to bio.`,
    visualDirection: `Slide 1 — blurred shake shot. Slide 2 — plain dark bg, large text only.`,
    hashtags: [],
    productionNotes: `Anyone who DMs "THICK" gets the reveal info sent back manually or via auto-reply. This builds a warm DM lead list before the reveal drops.`,
  },
  {
    date: '2026-05-27',
    time: '19:00',
    title: 'Teaser #2 — Texture Close-Up',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `this isn't your regular shake. 🖤\n05.06.25`,
    visualDirection: `Extreme macro shot — spoon dragging through a thick shake showing the texture. No branding still. Different angle from Post 1. End card same — "05.06.25" black screen. Keep under 15 seconds.`,
    hashtags: clean(['#SomethingThick', '#DessertinoSecrets', '#PuneFood', '#ComingSoon', '#ThickIsComing']),
    productionNotes: `Second teaser same day as the poll story — maintains the mystery for one more day before the reveal tomorrow.`,
  },
  {
    date: '2026-05-28',
    time: '11:00',
    title: 'THE REVEAL — Thick Shake Day Announcement',
    contentType: ContentType.STATIC_POST,
    platform: Platform.INSTAGRAM,
    caption: `We kept it secret long enough.\nJune 5 is Thick Shake Day at Dessertino. 🥤\nSmall Thick Shake for just ₹89 — one day only, all 3 outlets.\nWakad | Viman Nagar | Kharadi\nSave this post. Tell your people. See you June 5. 🖤`,
    visualDirection: `Hero shot of Dessertino's thickest shake. Bold text overlay: "THICK SHAKE DAY — 05.06.25". Subtext: "Small Thick Shake @ ₹89 | One Day Only". Brand colours. Clean, confident.`,
    hashtags: clean(['#ThickShakeDay', '#Dessertino', '#PuneFood', '#ThickShake', '#DessertinoOffer', '#PuneDesserts', '#June5', '#PuneEats', '#WakadFood', '#VimanNagarFood', '#KharadiFood']),
    productionNotes: `[BOOST] Run as Meta ad from May 28. Target: Pune, age 17–32, interests in food, cafes, desserts. Budget ₹300–500/day, run until June 5.`,
  },
  {
    date: '2026-05-28',
    time: '19:00',
    title: 'Mini Shakes — Big Flavour, Mini Price',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `Who said good things can't come small? 🤏\nBig flavour. Wallet-friendly price. Our Mini Shakes are built different.\nAvailable at all Dessertino outlets — Wakad | Viman Nagar | Kharadi`,
    visualDirection: `Fast-cut reel — all Mini Shake flavours in sequence, price reveal moment on screen, ends with sip + reaction shot. Upbeat trending audio. Under 30 seconds.`,
    hashtags: clean(['#MiniShakes', '#PuneShakes', '#AffordableDesserts', '#Dessertino', '#PuneEats', '#SmallButMighty', '#DessertinoMenu', '#PuneFood']),
    productionNotes: `Keep this post fully separate from the Thick Shake Day campaign messaging — Mini Shakes is its own product story. No ₹89 mention here.`,
  },
  {
    date: '2026-05-29',
    time: '12:00',
    title: `USP Carousel — What's Really In Your Thick Shake?`,
    contentType: ContentType.CAROUSEL,
    platform: Platform.INSTAGRAM,
    caption: `Your thick shake should taste like dessert, not a lab experiment.\nNo artificial colours. No ice crystals. No chemicals. Just real. 🥤\nThick Shake Day — June 5. Small thick shake ₹89, one day only.`,
    visualDirection: `5 slides:\n1. "What's actually in your thick shake?" — dark bg, large bold type.\n2. "No artificial colours. Ever." — product close-up background, clean text.\n3. "Zero ice crystals. Real thick texture." — macro shot of shake texture.\n4. "Chemical free. Real ingredients only." — flat-lay of raw ingredients.\n5. Dessertino logo + "This is what real tastes like." + outlet locations.`,
    hashtags: clean(['#RealIngredients', '#ChemicalFree', '#NaturalDesserts', '#Dessertino', '#NoArtificialColours', '#RealFood', '#PuneFood', '#ThickShakeDay', '#PureDessert', '#DessertinoUSP']),
    productionNotes: `[BOOST] Brand awareness ad May 29 onwards. No offer price needed in the boosted version — this is a trust ad. Same Pune targeting.`,
  },
  {
    date: '2026-05-29',
    time: '19:00',
    title: 'Story — Mini Shakes Flavour Poll + Location Tags',
    contentType: ContentType.STORY,
    platform: Platform.INSTAGRAM,
    caption: `Slide 1: "Which Mini Shake wins? 🥤" | Poll: [Top 2 flavours — use real names]\nSlide 2: "Come settle the debate IRL 👀 All outlets open today."\nSlide 3: Location sticker tags for all 3 outlets.`,
    visualDirection: `Bright product shots, playful energy, brand colours.`,
    hashtags: [],
    productionNotes: `Use actual flavour names in the poll. This drives micro-engagement and same-day footfall.`,
  },
  {
    date: '2026-05-30',
    time: '18:00',
    title: 'Behind The Thick — Making Of',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `This is what thick really looks like. 👀🥤\nNo shortcuts. No fillers. Just how we do it.\nThick Shake Day — June 5. ₹89 small thick shake. One day only.`,
    visualDirection: `Behind-the-scenes reel showing the shake being made — ingredients going in, blending, the pour, final product. Focus on the process to reinforce the USP (real ingredients, no chemicals). Can use voiceover or text overlays. Under 45 seconds.`,
    hashtags: clean(['#BehindTheScenes', '#HowItsMade', '#Dessertino', '#ThickShakeDay', '#RealIngredients', '#PuneFood', '#ChemicalFree', '#ThickShake', '#PuneDesserts']),
    productionNotes: `This doubles as USP content and hype content. Show the care that goes into making it — this is the "reason to believe" post.`,
  },
  {
    date: '2026-05-31',
    time: '17:00',
    title: 'Location Callouts Carousel — All 3 Outlets',
    contentType: ContentType.CAROUSEL,
    platform: Platform.INSTAGRAM,
    caption: `Wherever you are in Pune — we're coming for you. 🥤\nJune 5. Thick Shake Day. ₹89 Small Thick Shake.\nWakad | Viman Nagar | Kharadi`,
    visualDirection: `3 slides:\n1. Wakad: "Wakad 📍 — Thick Shake Day is coming to you. June 5 | ₹89 Small Thick Shake." Tag: Dessertino Wakad location.\n2. Viman Nagar: same pattern, tag Dessertino Viman Nagar.\n3. Kharadi: same pattern, tag Dessertino Kharadi.`,
    hashtags: clean(['#WakadFood', '#VimanNagarFood', '#KharadiFood', '#PuneFood', '#Dessertino', '#ThickShakeDay', '#PuneEats', '#June5']),
    productionNotes: `Also post 3 separate story versions of this — one per outlet — with location sticker on each story.`,
  },
  {
    date: '2026-06-02',
    time: '19:00',
    title: 'Countdown Hype — 3 Days to Go',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `3 days. One price you didn't expect. 🥤🔥\nJune 5 | ₹89 Small Thick Shake | All Dessertino Outlets\nYou coming or not?`,
    visualDirection: `Fast-cut — best product clips from all shoots so far. Text on screen: "3 DAYS. ₹89. JUNE 5." End frame holds for 2 seconds. Trending high-energy audio. Under 20 seconds.`,
    hashtags: clean(['#3DaysToGo', '#ThickShakeDay', '#PuneFood', '#Dessertino', '#June5', '#ThickShake', '#DessertinoOffer', '#PuneDesserts', '#Countdown']),
    productionNotes: `Urgency is the entire point. Reuse best clips, no need for new shoot.`,
  },
  {
    date: '2026-06-03',
    time: '18:00',
    title: 'Story — Send This to Your Thick Shake Partner',
    contentType: ContentType.STORY,
    platform: Platform.INSTAGRAM,
    caption: `Tag someone you're dragging to Dessertino on June 5 🥤👇`,
    visualDirection: `Bold shareable graphic — "June 5. Thick Shake Day. ₹89." Countdown sticker to June 5, 10 AM. Large share sticker. Reads well as a screenshot.`,
    hashtags: [],
    productionNotes: `Designed to be forwarded in DMs and group chats. Shareable over polished. Add "forward this" nudge text.`,
  },
  {
    date: '2026-06-04',
    time: '12:00',
    title: 'Final Reminder Carousel — Offer Breakdown',
    contentType: ContentType.CAROUSEL,
    platform: Platform.INSTAGRAM,
    caption: `Tomorrow. 🖤\nThick Shake Day — June 5.\nSmall Thick Shake @ ₹89. Today only.\nAll 3 outlets — Wakad, Viman Nagar, Kharadi.\nDon't say we didn't tell you.`,
    visualDirection: `4 slides:\n1. "Tomorrow. 🖤 Thick Shake Day — June 5."\n2. "Small Thick Shake @ ₹89. One day only."\n3. "Chemical free. No ice crystals. Real thick." — USP reminder.\n4. "All 3 outlets. Wakad | Viman Nagar | Kharadi. Come early."`,
    hashtags: clean(['#Tomorrow', '#ThickShakeDay', '#Dessertino', '#PuneFood', '#June5', '#TomorrowIsTheDay', '#89', '#PuneDesserts']),
    productionNotes: `Also post a Story version at 8:00 PM with countdown timer sticker to June 5, 10:00 AM and "Send this to your group chat" text.`,
  },
  {
    date: '2026-06-05',
    time: '09:30',
    title: 'D-DAY — Thick Shake Day Is Here',
    contentType: ContentType.STATIC_POST,
    platform: Platform.INSTAGRAM,
    caption: `It's here. 🥤\nThick Shake Day — June 5.\nSmall Thick Shake for ₹89. All day. All outlets.\nWakad | Viman Nagar | Kharadi\nCome get it. 🖤`,
    visualDirection: `Best product shot of the entire campaign. Text overlay: "THICK SHAKE DAY IS HERE." and "₹89 TODAY ONLY." Minimal. Bold. High-impact.`,
    hashtags: clean(['#ThickShakeDay', '#Dessertino', '#June5', '#PuneFood', '#TodayOnly', '#ThickShake', '#DessertinoOffer', '#PuneDesserts', '#WakadFood', '#VimanNagarFood', '#KharadiFood', '#89']),
    productionNotes: `[BOOST] Boost immediately on post. ₹500/day, 1-day run, Pune targeting. Simultaneously post a Story version with the offer price in large text + "Come now" CTA + each outlet tagged separately.`,
  },
  {
    date: '2026-06-05',
    time: '14:00',
    title: 'Story Series — In-Store: Crowd, Queue, Reactions',
    contentType: ContentType.STORY,
    platform: Platform.INSTAGRAM,
    caption: `Slide 1: Raw footage of shakes being made in-store.\nSlide 2: Customer receiving their shake — reaction clip.\nSlide 3: Queue or crowd shot if available.\nSlide 4: Text slide — "Still time to come. All 3 outlets open. ₹89 thick shake — today only."`,
    visualDirection: `No polish needed. Raw, real, in-the-moment. This is social proof in real time.`,
    hashtags: [],
    productionNotes: `Someone at each outlet needs to be briefed to shoot and send footage by 12 PM so stories can go up by 2 PM. FOMO is the driver — people watching mid-afternoon see the crowd and come in.`,
  },
  {
    date: '2026-06-05',
    time: '21:30',
    title: 'Day Recap — That Was Thick Shake Day',
    contentType: ContentType.REEL,
    platform: Platform.INSTAGRAM,
    caption: `That was Thick Shake Day. 🥤\nThank you Pune. Every outlet. Every shake. Every face. We saw you.\nWe'll be back. 🖤\n— Dessertino`,
    visualDirection: `Montage of the full day — staff making shakes, customers, reactions, crowds, close-ups. Slow it down toward the end. Emotional, warm audio. End on Dessertino logo. Post at 9:00–10:00 PM.`,
    hashtags: clean(['#ThickShakeDay', '#ThankYouPune', '#Dessertino', '#WeWillBeBack', '#PuneFood', '#DessertinoFamily', '#June5', '#PuneDesserts']),
    productionNotes: `Save all June 5 content to a "Thick Shake Day" Instagram Highlight. This reel is the final entry in that highlight. Sets up next campaign emotionally.`,
  },
]

async function main() {
  const partner = await prisma.brandPartner.findUnique({
    where: { clientSlug: BRAND_SLUG },
    select: { id: true, clientName: true },
  })
  if (!partner) {
    console.error(`Brand "${BRAND_SLUG}" not found.`)
    process.exit(1)
  }
  console.log(`Applying ${POSTS.length} posts to ${partner.clientName} (${partner.id})`)

  // Auto-position at end of the IDEA column (mirrors createPost in
  // post-mutations.ts — replicated here to keep this script standalone).
  const last = await prisma.contentPost.findFirst({
    where: { brandPartnerId: partner.id, status: PostStatus.IDEA, archivedAt: null },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  let nextPosition = (last?.position ?? -1) + 1

  let created = 0
  let skipped = 0

  for (const p of POSTS) {
    const scheduledDate = istToUtc(p.date, p.time)
    const dup = await prisma.contentPost.findFirst({
      where: {
        brandPartnerId: partner.id,
        title: p.title,
        scheduledDate,
      },
      select: { id: true },
    })
    if (dup) {
      console.log(`  · skip (exists): ${p.title}`)
      skipped++
      continue
    }

    await prisma.contentPost.create({
      data: {
        brandPartnerId: partner.id,
        title: p.title,
        scheduledDate,
        contentType: p.contentType,
        platform: p.platform,
        status: PostStatus.IDEA,
        caption: p.caption,
        hashtags: p.hashtags,
        visualDirection: p.visualDirection,
        productionNotes: `${CAMPAIGN_LABEL}\n\n${p.productionNotes}`,
        position: nextPosition++,
      },
    })
    created++
    console.log(`  + ${p.title}  (${p.date} ${p.time} IST)`)
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
