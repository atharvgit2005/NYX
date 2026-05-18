# NYX Studio — SEO Runbook

Living document. Update as steps are completed.

## ✅ Shipped (technical foundation)

- `sitemap.xml` + `robots.txt` via `next-sitemap.config.js` — private routes (portal, clients, uploads) excluded
- Schema.org JSON-LD: `Organization` + `ProfessionalService`, `WebSite` + `SearchAction`, `BreadcrumbList` on `/work` `/services` `/contact`, `VideoObject` on each /work item, `ContactPage` on /contact
- Meta titles trimmed to <60 chars, descriptions to ~155 chars
- Heading hierarchy linear (no h3 before h2)
- OpenGraph + Twitter cards on every public page
- Canonicals set per route via `createMarketingMetadata` helper in `src/lib/seo.ts`

## ✅ Search Console / Indexing

- **Google Search Console**: domain property `nyxstudio.tech` added, ownership auto-verified, sitemap submitted (5 pages discovered, status: Success)
- **Bing Webmaster Tools**: imported from GSC (1-click flow at bing.com/webmasters)
- 2 pages already indexed by Google as of May 2026

## 🟡 Manual nudges (do once)

### Request Indexing in GSC (60 sec)
GSC → URL Inspection → paste each → Request Indexing:
- `https://www.nyxstudio.tech/`
- `https://www.nyxstudio.tech/work`
- `https://www.nyxstudio.tech/services`
- `https://www.nyxstudio.tech/contact`

Daily cap is ~10 URLs, so 4 fits fine. Re-run anytime you push a meaningful copy/page change.

### Google Business Profile (10 min)
Address in `src/lib/seo.ts` is Pune, Maharashtra 411047. Claim at `business.google.com`:
- Category: **Advertising agency** (primary), **Marketing agency** (secondary)
- Hours: Mon–Fri 10:00–19:00 IST
- Service area: India
- Add 4-5 photos: logo, founders, behind-the-scenes shoots, sample reels (screen-recording the partner canvas works)
- Posts feature: weekly drop a new reel/case study — directly indexed by Google

### Bing IndexNow API (5 min, one-time)
Bing's IndexNow auto-pings new URLs within minutes. After Bing import, get your API key from the Bing Webmaster dashboard, then add to your deploy hook (or future Vercel deploy webhook):

```bash
curl -X POST "https://www.bing.com/indexnow?url=https://www.nyxstudio.tech/work&key=YOUR_KEY"
```

## 🟢 Distribution & backlinks (the actual SEO work)

Technical SEO gets you crawled. **Backlinks get you ranked.** Below is the realistic week-1 push.

### Reddit (drafts below — post yourself)

Reddit hates self-promo accounts. Rules:
- Use a personal account with >30 karma and >30-day age
- Never link-drop. Comment authentically in 5-10 threads first this week
- One post per subreddit per month max
- The post should genuinely help — your portfolio is the credibility, not the ask

**Target subreddits (Indian D2C-aware):**
- r/IndianStartups (490k) — high signal, allows founder posts
- r/StartUpIndia (210k)
- r/d2cIndia (smaller but qualified)
- r/IndianMarketing (45k)
- r/Entrepreneur (4M, global, strict on promo)

**Post draft 1 — r/IndianStartups (Show & Tell)**

> **Title:** I built an AI-native content studio for D2C brands — sharing what's working in May 2026
>
> Hey r/IndianStartups,
>
> I'm Atharv. With my co-founder Bhavya, I run NYX Studio — we build content systems for D2C food/beverage/lifestyle brands. Pune-based, ~6 months in.
>
> A few things I've learned this quarter that might be useful if you're a D2C founder figuring out content:
>
> 1. **AI-generated product films are now indistinguishable from a 5-figure shoot** for ~70% of social use cases. We use them for hero reels; only do live shoots when the founder needs to be on camera.
> 2. **The conversion lift on D2C ads is in the first 1.2 seconds.** No sound. No text. The first frame has to look like nothing else in the feed.
> 3. **One reel a week beats one campaign a quarter.** Velocity is the moat.
>
> Happy to answer questions on AI workflow, costs, what we charge, or look at a brand's current content honestly (free, in DMs).
>
> Portfolio if useful: https://www.nyxstudio.tech/work

> Don't link-drop in the title. Put the link at the end as the "if useful" touch.

**Post draft 2 — r/d2cIndia (Help/Give)**

> **Title:** Free reel critique — drop your D2C brand below, I'll give you 3 specific changes
>
> Running a content studio in Pune, looking at probably 40 D2C reels a week. Drop a link to your brand's IG below and I'll reply with 3 things I'd change about your top reel — hook, edit pacing, and CTA.
>
> No pitch, no DM funnel. Genuinely just want to see what people are putting out.

> This earns karma, surfaces leads organically, and the subreddit will love it. Do this BEFORE post 1.

### LinkedIn (post yourself)

**Founder post (Atharv) — Day 1:**

> NYX Studio is live.
>
> 6 months ago Bhavya and I started building content systems for D2C brands in India that don't have time to figure out reels, paid media, and influencer ops separately.
>
> Today our first 4 brand films are public. Dessertino. Brioso. Mango Jungle.
>
> The thesis: D2C founders are bottlenecked on content velocity, not strategy. So we built one studio that does cinematic film + paid creative + influencer production under one roof, with AI accelerating the parts that used to need a 10-person crew.
>
> If you're a D2C founder doing >₹50L MRR and your content stack feels held together with duct tape, we should talk.
>
> www.nyxstudio.tech
>
> Q3-Q4 2026 partner slots open now.

**Company page** (post the same, then re-share each founder's version)

**LinkedIn settings:**
- Company page → website field → `https://www.nyxstudio.tech`
- Founders' profiles → Experience section → "NYX Studio" with link
- Featured section → pin one /work case study link

### Instagram

Bio link — use a Linktree alternative OR just `nyxstudio.tech/work`:
```
NYX Studio | AI-native content for D2C
🎬 Reels that convert
📍 Pune, India
👇 Portfolio
nyxstudio.tech/work
```

Story highlights: "WORK", "PROCESS", "CLIENTS", "BTS"

### Twitter / X

Pinned tweet:
> We make brands impossible to scroll past.
>
> Cinematic reels + paid creative + influencer ops, all under one roof. AI-native, built for Indian D2C.
>
> Q3-Q4 2026 onboarding now → nyxstudio.tech

### Agency directories (do all of these — free, high-DA backlinks)

Submit NYX as a listed agency on each. Most take 5-10 min:

- [ ] **Clutch.co** — most important, AI/Content Marketing category
- [ ] **DesignRush** — Video Production + Digital Marketing
- [ ] **GoodFirms**
- [ ] **Sortlist** (India)
- [ ] **The Manifest** (sister to Clutch, free)
- [ ] **Agency Spotter**
- [ ] **TopAgency**
- [ ] **Crunchbase** — create a company profile (DA 91)
- [ ] **AngelList / Wellfound** — even if not raising
- [ ] **YourStory company directory** (Indian)
- [ ] **StartupTalky directory** (Indian)
- [ ] **Tracxn** (free tier)

### HARO / Featured.com / Qwoted (founder PR)

Sign up at `featured.com` and `qwoted.com` (HARO got bought, these replaced it). Journalists post questions like "Looking for D2C founders to comment on AI in marketing." You answer 2-3 a week. ~10% land you a backlink from a real publication (Forbes, Entrepreneur India, YourStory, etc.). This is the highest-leverage SEO activity for a young agency.

### Guest posts (month 2-3)

Pitch 1 article each to:
- **YourStory** — "How AI changed the D2C content game in 12 months"
- **Inc42** — "The economics of D2C content in 2026"
- **The Ken** (paywall, but huge in founder circles)
- **VCCircle**

## 🟡 Remaining technical polish (low priority)

- [x] ~~FAQPage schema on `/services`~~ — shipped with 5 visible Q/As + matching JSON-LD
- [ ] `aria-hidden="true"` on decorative `<span class="material-symbols-outlined">` icons that have no semantic meaning (~28 instances across public pages — needs per-icon judgement)
- [ ] Footer `<span>NYX STUDIO</span>` → consider semantic `<p>` (h3 would break hierarchy)
- [ ] Image `alt` audit — every `<Image>` should have descriptive alt text, not just brand name
- [ ] Add `priority` to LCP image on each page (Next.js hint)
- [ ] OpenGraph image audit — generate per-page OG images instead of single default (Vercel `@vercel/og` makes this trivial)

## 📊 Measurement cadence

**Weekly (10 min):**
- GSC → Performance → impressions trend
- GSC → Pages → coverage (any new "not indexed"?)
- Bing Webmaster → similar

**Monthly:**
- `site:nyxstudio.tech` count (rough indexed-page proxy)
- Backlink count via Ahrefs free tier or `ahrefs.com/backlink-checker`
- Top-3 competitor backlink delta

**Quarterly:**
- Re-audit titles/descriptions against current Q3 brand goals
- Refresh sitemap if route structure changed
- New case study posts → Request Indexing in GSC

## Reference: where things live in code

| Concern | File |
|---|---|
| Default site URL, OG image | `src/lib/seo.ts` |
| Per-page metadata helper | `src/lib/seo.ts` → `createMarketingMetadata()` |
| Breadcrumb schema helper | `src/lib/seo.ts` → `breadcrumbSchema()` |
| Organization schema | `src/lib/seo.ts` → `organizationSchema` |
| WebSite schema | `src/lib/seo.ts` → `websiteSchema` |
| Sitemap config | `next-sitemap.config.js` |
| robots.txt rules | `next-sitemap.config.js` → `robotsTxtOptions.transformRobotsTxt` |
| Public route metadata | `src/app/{work,services,contact}/page.tsx` |
| Schema injection | `<SchemaOrg schema={[...]} />` in each page |
