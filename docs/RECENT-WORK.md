> **⚠️ HISTORICAL — 2026-05-18**
>
> All `/automate` routes, APIs, components, and Prisma models referenced
> below have since been **removed from this repo**. The product was
> extracted to a separate `nyx-automate` repo deployed at
> `nyx-automate.vercel.app`.
>
> Sections on "Auth — Google login for admin users" and the SEO + sitemap
> work are still accurate for *this* repo. The "Route rename
> `/automate/admin` → `/automate/admin_automate`" and "Brand Analysis bug"
> sections describe code that no longer lives here — keep them only as a
> record of what shipped in that pass.

---

# Recent Work — Session Context (May 2026)

Quick-reference log of what shipped in the recent SEO + auth + automate
hardening pass. Read this first when picking the project back up; it
links to the code locations, explains the *why* behind each commit,
and lists how to verify each fix.

## Commit map (newest first)

| SHA | Area | What changed |
|---|---|---|
| `32aa5e1` | Analyze | Gemini model rotation bumped to 2.5; `analyzeNiche` throws instead of returning silent mock |
| `5fc34fd` | Analyze | Dropped Dumpoir scraper; `/api/analyze` refuses to run Gemini on synthetic mock profiles |
| `178a989` | Automate | Rename `/automate/admin` → `/automate/admin_automate` (16 files, 9 routes) |
| `7c68168` | Auth | Explicit Google ↔ existing-user account linking in `signIn` callback |
| `45ece35` | SEO | FAQPage schema + visible FAQ section on `/services` |
| `a827ed5` | SEO | `docs/SEO.md` runbook (Reddit / LinkedIn / Featured.com / directories) |
| `48eada1` | SEO | sitemap exclude tightened; `WebSite` + `BreadcrumbList` JSON-LD |

## 1. SEO foundation (`48eada1`, `a827ed5`, `45ece35`)

### What's live

- **Sitemap.xml** + **robots.txt** tightened — private routes
  (`/portal`, `/clients`, `/automate/admin_automate`, `/automate/dashboard`,
  `/uploads`) now excluded from both. See `next-sitemap.config.js`.
- **Schema.org JSON-LD** rendered globally + per-page:
  - `Organization` + `ProfessionalService` (every page) — `src/lib/seo.ts`
  - `WebSite` + `SearchAction` (every page) — eligible for Sitelinks
    Search Box in SERPs
  - `BreadcrumbList` on `/work`, `/services`, `/contact`
  - `VideoObject` × 4 on `/work` (Dessertino, Mango Jungle, Mango
    Shower, Brioso)
  - `Service` + `Offer` graph on `/services`
  - `FAQPage` on `/services` (5 questions, also rendered visibly)
  - `ContactPage` on `/contact`
- **Meta titles** trimmed to <60 chars, descriptions ~155 chars.
- **OpenGraph + Twitter cards** on every public page via
  `createMarketingMetadata()` helper.
- **Heading hierarchy** linear (no h3 before h2 anywhere).
- **GSC + Bing** registered, sitemap submitted, ownership auto-verified.

### Manual nudges still pending (see `docs/SEO.md` for details)

- GSC → URL Inspection → Request Indexing on `/`, `/work`, `/services`,
  `/contact`, `/automate` (60 sec, one-time)
- Featured.com signup (HARO replacement) + answer 3 questions/week
- Submit to Clutch, DesignRush, GoodFirms, Crunchbase, Wellfound,
  YourStory, StartupTalky directories (15 min each)
- LinkedIn company page + founder profile copy from runbook
- Google Business Profile claim with Pune address

### Files

| Concern | File |
|---|---|
| Site URL, OG image, schemas | `src/lib/seo.ts` |
| Per-page metadata helper | `createMarketingMetadata()` in `src/lib/seo.ts` |
| Breadcrumb helper | `breadcrumbSchema()` in `src/lib/seo.ts` |
| Sitemap config | `next-sitemap.config.js` |
| Public route metadata | `src/app/{work,services,contact,automate}/page.tsx` |
| Schema injection | `<SchemaOrg schema={[...]} />` in each page |
| Distribution playbook | `docs/SEO.md` |

## 2. Auth — Google login for admin users (`7c68168`)

### Symptom

User reported: Google sign-in failing on the deployed site with
"Email already used with another provider" when using the admin email
(`pahariaatharv2005@gmail.com`).

### Root cause

`allowDangerousEmailAccountLinking: true` on the GoogleProvider was
supposed to auto-link Google sign-ins to existing User rows sharing the
same email. But it has edge cases when the User row was created
**outside** NextAuth:
- by `prisma/setup-admin-user.ts` (admin seed)
- by `/api/auth/signup` (credentials signup)

In those cases there's no `Account` row at all, and the PrismaAdapter's
`linkAccount` path can still throw `OAuthAccountNotLinked` before
reaching the dangerous-link-grant logic.

### Fix

`signIn` callback in `src/lib/auth.ts` now manually links Google to an
existing User row:

1. When Google returns `email_verified: true` and a User exists by email
2. Look for an Account row matching `(provider=google,
   providerAccountId)`; if absent, create it
3. Pin `user.id` to the existing row's id so JWT inherits correct
   identity (prevents adapter from creating a duplicate shadow row)
4. Fail open: link errors don't block sign-in

Server logs print `AUTH_Linked_Google_To_Existing_User` on first
successful link.

### Verify

```bash
cd /Users/atharvpaharia100/Desktop/NYX-Everything/NYX
npm run dev:clean
```

1. Open `http://localhost:3000/portal/login`
2. Sign in with Google using the admin email
3. Should land on `/portal/admin` without "already registered" error
4. Subsequent Google sign-ins use the linked Account row directly

## 3. Route rename — `/automate/admin` → `/automate/admin_automate` (`178a989`)

### Why

User wanted the legacy operator-admin shell renamed so the URL reads
as "NYX automate admin panel" instead of generic "admin" and so it
doesn't collide with future automate-app paths.

### What moved

| Before | After |
|---|---|
| `/automate/admin` | `/automate/admin_automate` |
| `/automate/admin/users` | `/automate/admin_automate/users` |
| `/automate/admin/subscriptions` | `/automate/admin_automate/subscriptions` |
| `/automate/admin/tiers` | `/automate/admin_automate/tiers` |
| `/automate/admin/gates` | `/automate/admin_automate/gates` |
| `/automate/admin/analytics` | `/automate/admin_automate/analytics` |
| `/automate/admin/inquiries` | `/automate/admin_automate/inquiries` |
| `/automate/admin/audit` | `/automate/admin_automate/audit` |
| `/automate/admin/alerts` | `/automate/admin_automate/alerts` |

### Files touched

- `src/app/automate/admin/` → `src/app/automate/admin_automate/`
  (git mv preserving history)
- `src/components/admin/AdminSidebar.tsx` — 9 nav hrefs
- `src/app/automate/admin_automate/page.tsx` — 5 internal links
- `src/app/portal/admin/AdminDashboardClient.tsx` — 2 cross-portal links
- `src/middleware.ts` — gate + matcher
- `next-sitemap.config.js` — exclude pattern + robots Disallow
- `src/lib/config/admins.ts` — doc-comment

### Gate behavior

Unchanged: still uses `ADMIN_EMAIL` env var single-email check.
Currently set to `pahariaatharv2005@gmail.com` in `.env`.

### Old URL behavior

`/automate/admin` now 404s. No redirect was set — clean break since
this is internal-only. If bookmarks need to be preserved, add a
3-line `redirects()` entry to `next.config.ts`.

## 4. Brand Analysis bug — generic "Creative Tech & AI" output (`5fc34fd`, `32aa5e1`)

### Symptom

User reported: Brand Analysis on `/automate/dashboard/analysis` returns
the same generic "Creative Tech & AI (Fallback)" output for every
Instagram username (tested with @mkbhd).

### Root causes (two compounding bugs)

#### Bug 1: Dumpoir mirror returning fake captions (fixed in `5fc34fd`)

`src/lib/services/instagram-scraper.ts` ran 3 mirror strategies in
parallel (IG API, Picuki, Dumpoir) and picked the first non-null.
**Dumpoir's caption was `$(el).attr('alt')`** on `img` tags — but the
alt content is page metadata ("Instagram photo by X • 2024 views"),
not real caption text. So a "successful" Dumpoir scrape produced a
transcript made entirely of generic meta strings.

**Plus:** when all 3 strategies failed, the scraper silently returned
a hardcoded mock profile ("Creative Technologist • Building next-gen
AI tools") with no flag indicating it was synthetic. The route then
ran Gemini on the mock, producing the same canned analysis for every
brand.

#### Bug 2: Stale Gemini model rotation (fixed in `32aa5e1`)

`src/lib/gemini.ts` rotated through `gemini-2.0-flash` +
`gemini-1.5-flash-*` family. As of May 2026 the 1.5 family is fully
sunset and 2.0 is deprecating — every model call returned 404, and
the catch path in `analyzeNiche()` silently returned `getMockAnalysis()`
with a "Creative Tech & AI (Fallback)" niche string.

### Fixes

**Scraper (`instagram-scraper.ts`):**
- Dropped Dumpoir entirely (deleted)
- Switched parallel scrape to `Promise.allSettled` with quality-ranked
  selection (most posts with non-trivial captions wins)
- Added `isMock: boolean` flag to `ScrapedProfile`; fallback path sets
  it to `true`

**Route (`/api/analyze/route.ts`):**
- Refuses to invoke Gemini when `isMock === true`; returns 502 with a
  user-facing message instead

**Gemini wrapper (`gemini.ts`):**
- New model rotation: `gemini-2.5-flash` → `gemini-2.5-flash-lite` →
  `gemini-2.5-pro` → `gemini-2.0-flash` → `gemini-2.0-flash-lite`

**AI analysis (`ai-analysis.ts`):**
- `analyzeNiche()` now **throws** distinct errors instead of returning
  mock data dressed as success. Differentiates rate-limit vs other
  model failure vs malformed JSON.
- Removed `getMockAnalysis()` — dead code, no fallback path remains
- `getMockIdeas()` is unrelated and unchanged (used by `generateIdeas`)

### Verify

1. Hard-refresh `/automate/dashboard/analysis`
2. Click "REGENERATE ANALYSIS" on any real public IG account
3. Should see real niche/tone/audience analysis (not "Creative Tech")
4. If Gemini key is invalid/exhausted, red error pane shows actual
   error reason — never silent mock data

Console-side: real success logs `[Scraper] Best result: ...`. Real
Gemini call logs `[Gemini Sync] Attempting generation with
gemini-2.5-flash...` → returns valid JSON. Failures throw with
specific messages.

### Related — YouTube + LinkedIn analyzers

`/api/analyze-youtube` and `/api/analyze-linkedin` likely have the
same fallback-to-mock pattern. Not yet audited. Apply the same
fix-template if they exhibit similar symptoms.

## Environment notes

- `.env` lives at `/Users/atharvpaharia100/Desktop/NYX-Everything/NYX/.env`
  (NOT in any worktree)
- Key env vars in play:
  - `ADMIN_EMAIL` — single email gating `/automate/admin_automate/*`
  - `GEMINI_API_KEY` — required, throws clear error if missing now
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — NextAuth OAuth
  - `NEXTAUTH_SECRET` — JWT signing
  - `NEXTAUTH_URL` — auth callback base
- Vercel auto-deploys on push to `main`; redeploy takes ~90s.

## When stale `.next` chunks cause "Cannot find module './XXXX.js'"

Next.js's webpack runtime writes numbered chunk files in
`.next/server/`. When a build is interrupted (Ctrl-C, hot-reload
crash, branch switch), the manifest can reference a chunk that
wasn't finished writing. The manifest is binary and won't self-heal.

**Fix:**
```bash
npm run dev:clean
```
which runs `rm -rf .next node_modules/.cache && next dev`. Use this
instead of plain `npm run dev` whenever switching branches that
touch many files or after any chunk-not-found error.

## Build verification

Across all the above changes:
- `npx tsc --noEmit` → clean
- `npx next build` → clean, all routes prerendered as expected
- Only pre-existing warnings (`isPast` unused in some calendar code,
  unused `i` in another file) — unrelated to this work

## What's still on the table

| Task | Where |
|---|---|
| Per-page `@vercel/og` dynamic OG images | New work |
| YouTube + LinkedIn analyzer same-fix audit | `src/app/api/analyze-{youtube,linkedin}/route.ts` |
| `aria-hidden` audit on decorative material-symbols icons (~28) | `src/app/**/page.tsx` |
| IndexNow deploy hook for Bing | `next.config.ts` or Vercel webhook |
| Bing Webmaster manual import from GSC | bing.com/webmasters |
| Featured.com expert profile + 3 questions/week | featured.com |
| Directory submissions (Clutch, DesignRush, etc.) | See `docs/SEO.md` |
