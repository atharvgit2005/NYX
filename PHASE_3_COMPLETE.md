# Phase 3 Complete — Brand Partner Content Calendar UI

## What was built

`/portal/[clientSlug]` was a Phase-1 placeholder that just said *"your content calendar is coming in Phase 3."* This phase replaced it with a polished, agency-tier content calendar that runs on per-partner DB-backed data, with three switchable views (Calendar / Cards / Feed Preview), a click-through post modal, a status pipeline, and a Pack B section.

The legacy `/clients/[slug]` portal (still mounted, untouched) was the design source — its 8 components were ported, refactored to consume the DB schema, and split into smaller view-specific files. Result: the cream-editorial deliverable look the agency wanted, hooked up to live data via Prisma.

## Prisma schema additions

```prisma
model ContentPost {
  id              String       @id @default(cuid())
  brandPartnerId  String
  brandPartner    BrandPartner @relation(fields: [brandPartnerId], references: [id], onDelete: Cascade)

  title           String
  scheduledDate   DateTime
  contentType     ContentType
  status          PostStatus   @default(IDEA)
  caption         String       @db.Text
  hashtags        String[]
  visualDirection String       @db.Text
  productionNotes String?      @db.Text
  thumbnailUrl    String?
  mediaUrls       String[]     @default([])

  position        Int

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([brandPartnerId])
  @@index([scheduledDate])
  @@index([status])
}

enum ContentType { REEL CAROUSEL STATIC_POST STORY REEL_STORY }
enum PostStatus  { IDEA DRAFTING NEEDS_APPROVAL NEEDS_REVISION APPROVED POSTED }
```

Back-relation added to `BrandPartner` (`contentPosts ContentPost[]`).

### How the schema was applied

Project convention is `db push`, not migration files. Phase 3 followed suit:

```bash
npx prisma db push
npx prisma generate
```

**No `--accept-data-loss` needed.** This was a purely additive change — no columns dropped, no rows touched.

### Rolling back

```bash
# Git-revert the schema change, then:
npx prisma db push  # will drop ContentPost + the two new enums
```

## Seeding

`prisma/seed-dessertino-content.ts` reads Dessertino's 8 posts from the existing `src/app/clients/data/dessertino.config.json` (the legacy portal's data file — single source of truth, no risk of drift) and inserts them with the right enum mappings.

```bash
npx tsx prisma/seed-dessertino-content.ts
```

It's idempotent — exits early if Dessertino already has any `ContentPost` rows. Safe to re-run.

### Why read from JSON instead of inlining the 8 posts

The brief listed all 8 posts in TypeScript. The same 8 posts already lived in the legacy JSON. Inlining them would duplicate ~200 lines of caption/hashtag content and make future copy edits a two-place chore. Reading the JSON keeps the legacy `/clients/dessertino` UI and the new `/portal/dessertino` UI bit-identical until the legacy is deprecated.

## Files changed

### New

#### Library code
- `src/lib/portal/content-store.ts` — read-only DB helpers (`getContentPosts`, `getContentPostById`, `getPostStatusCounts`)
- `src/lib/portal/brand-config.ts` — `BrandConfig` type + `getBrandConfig(slug)` resolver
- `src/lib/portal/brands/dessertino.ts` — Dessertino's brand colours, social handle, campaign meta, Pack B copy, agency block
- `src/lib/portal/content-types.ts` — display labels, type colours/gradients/icons, status colours, status pipeline order

#### Portal route
- `src/app/portal/[clientSlug]/layout.tsx` — loads Playfair Display + Inter into `--font-portal-display` / `--font-portal-body` CSS vars (scoped to this route only — does not affect the marketing site)
- `src/app/portal/[clientSlug]/components/types.ts` — `SerializedPost` shape (Dates → ISO strings)
- `src/app/portal/[clientSlug]/components/BrandPartnerPortalClient.tsx` — orchestrator, owns view + selected-post state
- `src/app/portal/[clientSlug]/components/PortalHeader.tsx` — sticky header with brand logo, sign-out, "← Admin" shortcut for admin viewers
- `src/app/portal/[clientSlug]/components/StatStrip.tsx` — campaign-meta band + 5 stat tiles
- `src/app/portal/[clientSlug]/components/CalendarView.tsx` — month grid (desktop) + vertical timeline (mobile)
- `src/app/portal/[clientSlug]/components/CardsView.tsx` — 3-col responsive card grid
- `src/app/portal/[clientSlug]/components/FeedView.tsx` — IG 3-col feed mockup with profile bar
- `src/app/portal/[clientSlug]/components/PostCard.tsx` — single card
- `src/app/portal/[clientSlug]/components/PostModal.tsx` — bottom sheet on mobile / centered modal on desktop, ESC to close, scroll-lock
- `src/app/portal/[clientSlug]/components/StatusTrackerSection.tsx` — horizontal pipeline (desktop) / vertical list (mobile)
- `src/app/portal/[clientSlug]/components/PackBSection.tsx` — collapsible (open by default), source list + strategic-goals card
- `src/app/portal/[clientSlug]/components/PortalFooter.tsx` — confidentiality note + "Renew →" mailto + "Built by NYX" pill
- `prisma/seed-dessertino-content.ts` — content seed
- `PHASE_3_COMPLETE.md` — this file

### Modified
- `prisma/schema.prisma` — added `ContentPost`, `ContentType`, `PostStatus`; back-relation on `BrandPartner`
- `src/app/portal/[clientSlug]/page.tsx` — was the placeholder; now: auth gate → resolve partner → `getBrandConfig` → fetch posts + counts → serialise → render `BrandPartnerPortalClient`

### Untouched
- `src/lib/auth.ts` — auth gating in the page server component reuses existing `authOptions` + `isAdminEmail`
- `src/app/portal/admin/*` — admin dashboard unchanged
- `src/app/clients/[slug]/*` — legacy portal still mounted at `/clients/dessertino`, not deprecated yet (Phase 4.5 cleanup will consolidate)
- `src/app/layout.tsx` — root layout untouched; portal fonts scoped to `[clientSlug]/layout.tsx` so Playfair + Inter don't leak into the marketing site

## How brand-specific theming works

Each brand gets a config file at `src/lib/portal/brands/[slug].ts` exporting a `BrandConfig`. To onboard a new brand partner:

1. Approve them in `/portal/admin` (creates the `BrandPartner` row)
2. Copy `brands/dessertino.ts` to `brands/<their-slug>.ts`, update fields (brand colours, social handle, campaign dates, Pack B sources, contact)
3. Register in `src/lib/portal/brand-config.ts`:
   ```ts
   const BRANDS: Record<string, BrandConfig> = {
     dessertino: dessertinoBrand,
     newpartner: newpartnerBrand, // ← here
   }
   ```
4. Seed their content (write a brand-specific `seed-<slug>-content.ts` based on `seed-dessertino-content.ts`, or build the admin-side post creator in Phase 4)

If a brand is approved in DB but no config exists in code, the page renders a graceful "configuration pending" message instead of crashing.

### Why config-as-code, not config-as-DB

Brand colours, agency block, campaign dates, Pack B copy — these change rarely and per partner, not per post. Storing them in code means:
- They're versioned with the deploy (rollback is git revert, not a DB migration)
- The TypeScript compiler catches typos in colour fields
- No separate admin UI needed for visual config — Phase 4 admin can focus on content

If a partner needs runtime-configurable theming later, lift `BrandConfig` to a Prisma model.

## Auth gating

Server-side, in `page.tsx`. Same pattern as Phase 2:

| Viewer | Behaviour |
|---|---|
| Not signed in | → `/automate/login?callbackUrl=/portal/[slug]` |
| Admin (any `clientSlug`) | Renders that partner's portal — header shows "← Admin" shortcut |
| Approved partner viewing **own** slug | Renders portal |
| Approved partner viewing **another** slug | → `/portal/[their-own-slug]` |
| Signed in but not approved | → `/portal` (Pending screen) |
| Slug exists in URL but no `BrandPartner` row | Admin → `/portal/admin`; partner → `/portal` |

## Mobile responsiveness

Tested at 375px width. Behaviour:

| Element | Desktop | Mobile (<640px) |
|---|---|---|
| Header | Logo + brand title + email + sign-out | Logo + title only, email/admin-link hidden |
| Stat strip | 5 cols | 2 cols (wraps) |
| View toggle | Icon + label | Icon + first word only |
| Calendar view | 7-col month grid | **Vertical timeline** (date headers + post cards stacked) |
| Cards view | 3 cols (lg) / 2 cols (md) | 1 col |
| Feed view | 3-col grid (always — matches IG aesthetic) | Same |
| Status tracker | Horizontal pipeline | Vertical list of stages |
| Post modal | Centered modal | Bottom sheet with drag-handle |

The mobile calendar deliberately drops the grid metaphor — at 375px, a 7-col grid with post chips becomes unreadable. The vertical timeline preserves all info (date, type, title, status) in one tap-target per post.

## Production build

```bash
npm run build
```

Build is clean. Phase 3 page weight:

| Route | Size | First Load JS |
|---|---|---|
| `/portal/[clientSlug]` | 7.18 kB | 121 kB |
| `/portal/admin` | 16.1 kB | 136 kB |
| `/portal` | 445 B | 111 kB |
| `/clients/[slug]` (legacy) | 7.2 kB | 109 kB |

The new portal is roughly equivalent in weight to the legacy `/clients/[slug]` it ports from. The slight bump (+12 kB on First Load JS) comes from `next-auth/react`'s `signOut` import for the sign-out button.

## How to access locally

1. `npm run dev`
2. Visit `http://localhost:3000/portal`
3. Sign in with `pahariaatharv2005@gmail.com` (admin) → lands on `/portal/admin`
4. Click **Preview** on Dessertino → lands on `/portal/dessertino` with the full content calendar
5. Or sign in with `ca.priyankabaheti@gmail.com` (Dessertino partner) → bypasses admin, lands directly on her own portal

## What's still pending

These were explicitly out of scope for Phase 3 — listed here so they don't get forgotten:

1. **Vercel preview verification.** The build passes locally; Vercel deploy is the next gate. Cold-start the lambda, sign in incognito, confirm the calendar renders for both admin preview and partner login. Phase 2 was never properly verified on Vercel either, so the same cold-start flow validates both phases at once.

2. **Admin-side content management** (Phase 4). Right now content can only be added/edited via:
   - the seed script (one-shot per brand)
   - direct `prisma.contentPost.create()` calls in `npx tsx` one-liners
   - Prisma Studio (`npx prisma studio`)

   No admin UI exists yet for moving a post through the pipeline (`IDEA → DRAFTING → NEEDS_APPROVAL → APPROVED → POSTED`). That's Phase 4.

3. **Client approval flow** (Phase 4 or 5). Today the partner sees status pills as read-only. There's no "Approve / Request revision" button on the post modal. Adding that is a Phase 4+ admin-mediated flow.

4. **Real thumbnails.** `ContentPost.thumbnailUrl` is in the schema but always null right now. The Feed view falls back to gradient + icon placeholders. Once Pack A photography is delivered, an admin tool can populate these.

5. **`/clients/[slug]` legacy portal still exists** at `/clients/dessertino`. Untouched in Phase 3 — it's a separate password-gated system from earlier in the day. Phase 4.5 (or whenever Dessertino's trial ends) should deprecate it. The new `/portal/dessertino` is the canonical replacement.

6. **No analytics / event tracking.** Page-load is fresh from DB on every request (`force-dynamic`), but there's no telemetry on view-toggle clicks, modal opens, time-on-page. Add when there's a reason to measure.

7. **Pack B is collapsible but defaults to open.** When more brands have Pack B content, this might want to default to collapsed for cleaner first-paint. Decide per partner.

## Phase 3 acceptance criteria

- [x] Discovery findings reported and decisions confirmed
- [x] `ContentPost` model + `ContentType` + `PostStatus` enums added
- [x] Schema applied via `db push` cleanly (no data loss)
- [x] Dessertino's 8 posts seeded
- [x] Auth gating: brand partner sees own portal, admin can preview any, others redirected
- [x] Three views render: Calendar, Cards, Feed Preview
- [x] View toggle smoothly switches without page reload
- [x] Post modal opens on click in any view, shows full content
- [x] Status tracker reflects actual counts from DB
- [x] Pack B section renders with correct source posts
- [x] Brand colours applied tastefully (pink + sky blue + navy, not garish)
- [x] Mobile responsive at 375px (vertical timeline replaces calendar grid)
- [x] No console / TypeScript errors (`npm run build` clean)

Pending external verification:
- [ ] Tested on Vercel preview deployment
- [ ] Screenshot sent to Priyanka for impression check

## Next phase

**Phase 4 — Admin Content Management.** Add an admin-side editor at `/portal/admin/[clientSlug]/posts` so Atharv/Bhavya can:
- Create new `ContentPost` rows for any partner (today: only via seed script)
- Move posts through the status pipeline
- Reorder posts (drag-handle on `position`)
- Upload thumbnails (populate `thumbnailUrl`)
- Optionally: a partner-side "approve / request revision" button that flips `NEEDS_APPROVAL → APPROVED` or `→ NEEDS_REVISION` (the existing schema supports it; Phase 3 just doesn't expose the UI)
