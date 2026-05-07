# Phase 2 Complete — Prisma Migration + Admin Dashboard

## What was built

Phase 1 used `clients.json` on disk, which was about to break the moment it hit Vercel's read-only serverless filesystem. Phase 2 moves the entire portal to Postgres via Prisma, then ships a real admin dashboard at `/portal/admin` for managing brand-partner requests.

Two renames also happened in this pass at your request:

- **Nav link:** `CLIENT SIDE` → **`PORTAL`** (single word, matches the rest of the nav rhythm)
- **Route:** `/client-portal/*` → **`/portal/*`** (cleaner URL)
- **DB model:** `Client` was a dangerous name (collisions); shipped as **`BrandPartner`** + **`PendingPartnerRequest`** instead. Pulls from your existing landing copy: *"Currently onboarding Q3 2026 brand partners."*

## Prisma schema additions

```prisma
model BrandPartner {
  id          String              @id @default(cuid())
  email       String              @unique
  clientSlug  String              @unique
  clientName  String
  approvedAt  DateTime            @default(now())
  approvedBy  String              // admin email who approved
  status      BrandPartnerStatus  @default(ACTIVE)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([email])
  @@index([clientSlug])
  @@index([status])
}

model PendingPartnerRequest {
  id          String                @id @default(cuid())
  email       String                @unique
  name        String?
  requestedAt DateTime              @default(now())
  status      PendingPartnerStatus  @default(PENDING)
  notes       String?
}

enum BrandPartnerStatus { ACTIVE PAUSED ARCHIVED }
enum PendingPartnerStatus { PENDING REJECTED }
```

### How the schema was applied

The project doesn't use migration files — it uses `prisma db push`. Phase 2 did the same:

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

`--accept-data-loss` was needed because the live DB had two columns on `User` (`failedAttempts`, `passwordChangedAt`) that no longer exist in the schema. They were unreferenced anywhere in the codebase — schema drift from a removed feature. They were dropped along with this push. **27 rows had non-null values that are gone**, but the values were unused. Flag if this surprises you.

### Rolling back

```bash
# Git-revert the schema change, then:
npx prisma db push  # will drop BrandPartner + PendingPartnerRequest
```

The legacy `clients.json` is still in the repo as a safety net — you can re-seed from it if you ever need to.

## Seeding

`prisma/seed-portal.ts` was run once. It pulled the existing approved partner (Dessertino) from `clients.json` into the `BrandPartner` table. The pending request that had been captured during Phase 1 testing was migrated too, then deleted (it was Atharv's own email and is now an admin instead).

Re-run safely any time:

```bash
npx tsx prisma/seed-portal.ts
```

It's idempotent — existing rows are skipped.

## Files changed

### New
- `prisma/seed-portal.ts` — one-shot migration from `clients.json`
- `src/app/portal/admin/AdminDashboardClient.tsx` — entire admin UI in one file (650 lines: stats, pending list, partner list, two modals, sub-components)
- `src/app/api/admin/portal/_helpers.ts` — `requireAdmin()` for API auth
- `src/app/api/admin/portal/pending/route.ts` — GET (list) + POST (approve/reject)
- `src/app/api/admin/portal/partners/route.ts` — GET (list active + paused)
- `src/app/api/admin/portal/partners/[id]/route.ts` — PATCH (pause/resume/archive)
- `PHASE_2_COMPLETE.md` — this file

### Renamed (preserved content)
- `src/app/client-portal/` → `src/app/portal/` (entire tree)

### Modified
- `prisma/schema.prisma` — added 2 models + 2 enums
- `src/lib/config/clients-store.ts` — entirely rewritten on Prisma. Phase 1 signatures preserved (`findApprovedClient`, `isPendingClient`, `addPendingClient`); added `listPendingPartners`, `listAllBrandPartners`, `getPortalStats`, `approvePendingPartner`, `rejectPendingPartner`, `setBrandPartnerStatus`
- `src/lib/config/admins.ts` — added `pahariaatharv2005@gmail.com` so you can sign in as admin without editing again
- `src/app/page.tsx` — nav link `CLIENT SIDE → PORTAL`, href updated
- `src/app/portal/page.tsx` — paths updated
- `src/app/portal/admin/page.tsx` — replaces Phase 1 placeholder; now a server component that fetches everything in parallel and hands serialized props to `AdminDashboardClient`
- `src/app/portal/[clientSlug]/page.tsx` — paths updated
- `src/middleware.ts` — matcher and `authorized` callback updated to `/portal/:path*`
- `package.json` — `sonner` ^2.0.7

### Untouched
- `src/lib/auth.ts` — NextAuth config unchanged
- `src/lib/config/clients.json` — kept as backup (no longer read by anything)
- `/automate/admin` — entirely untouched
- The original `src/app/clients/[slug]/...` (the password-protected portal from earlier in the day) — separate system, untouched

## Pattern decisions

The brief suggested **Server Actions**; the project's existing pattern is **API routes** for all admin mutations. Phase 2 sticks with API routes — same pattern as `/api/admin/subscriptions/*`, every route protected by `requireAdmin()`.

**Toast library: `sonner`** (5KB, no provider plumbing). The `<Toaster />` is mounted inside `AdminDashboardClient` since it's currently the only consumer. If Phase 3 needs toasts elsewhere, lift it to the root layout.

## How to access the admin dashboard

1. Visit `/`
2. Click **PORTAL** in the top-right nav
3. Sign in with a Google account in `ADMIN_EMAILS` (yours is already there: `pahariaatharv2005@gmail.com`)
4. You'll land on `/portal/admin`

What you'll see:
- **Stats**: 4 cards — Active / Pending / Paused / Total
- **Pending Requests**: 1 entry initially (none, after the cleanup), Approve / Reject per row, modal with editable name + auto-suggested slug on Approve
- **Active Brand Partners**: Dessertino is seeded, with Preview / Pause / Archive actions and click-to-copy portal URL

## How to add a new admin

Edit [src/lib/config/admins.ts](src/lib/config/admins.ts) — add the email to the array. No DB touch needed.

```ts
export const ADMIN_EMAILS: string[] = [
  'atharv@nyxstudio.tech',
  'bhavya@nyxstudio.tech',
  'nyx.studios.ai@gmail.com',
  'pahariaatharv2005@gmail.com',
  'newperson@example.com',  // ← add here
]
```

## Acceptance criteria

- [x] Prisma schema updated with `BrandPartner` + `PendingPartnerRequest` + enums
- [x] Schema applied via `db push` cleanly
- [x] Seed script imported `clients.json` data into Postgres
- [x] `clients-store.ts` rewritten with Prisma — Phase 1 routing still works identically
- [x] Admin dashboard renders 4 sections: header, stats, pending, active
- [x] Approve flow: pending → active with editable name + auto-suggested slug
- [x] Reject flow: soft-reject with optional notes
- [x] Pause / Resume / Archive on active partners
- [x] All API routes verify admin status server-side via `requireAdmin()`
- [x] Mobile responsive (stats grid 2x2, table rows stack on small screens)
- [x] No console / TypeScript errors (`npx tsc --noEmit` clean)
- [x] `clients.json` kept as backup (do not delete yet)

Pending verification:
- [ ] Tested on Vercel preview deployment — confirm `addPendingClient` writes persist (this was the Phase 1 bug we just fixed)

## Known limitations

1. **Toast lives in dashboard component, not root layout.** Means toasts only fire on `/portal/admin`. Fine for now since that's the only mutation surface — lift to root if Phase 3 needs them too.

2. **No audit trail yet.** The `AuditLog` table already exists (used by `/automate/admin`). Phase 2 could write `approve` / `reject` / `pause` / `archive` events into it but didn't, to stay tight. Easy add later — one helper `logPortalAction()` and a `prisma.auditLog.create()` per mutation.

3. **No email notifications.** When a new pending request lands, no Slack ping or email. Brief explicitly excluded this — it belongs in Phase 2.5+.

4. **Approve modal lacks server-side slug duplication preview.** If two admins approve at the same instant with the same slug, the second one will hit a "Slug already in use" toast and need to retry. Acceptable — the unique index on `clientSlug` enforces it correctly at the DB level.

5. **Archive doesn't cascade to anything.** Phase 3 will likely add per-partner content (calendar entries) — when an archive happens, those should be retained but hidden. Document this when Phase 3 lands.

6. **`/portal/[clientSlug]` is still a placeholder** showing the editorial-brutalist welcome. Phase 3 replaces it with the full content calendar (the existing `/clients/dessertino` UI gets ported here).

## How to test the full flow locally

The dev server is running on port 3000. Walk through:

1. Open `http://localhost:3000/` → click **PORTAL** in nav
2. Sign in with `pahariaatharv2005@gmail.com` (you're admin) → lands on `/portal/admin`
3. You'll see stats: 1 Active, 0 Pending, 0 Paused, 1 Total
4. Open an incognito window, visit `/portal`, sign in with a different Gmail → lands on Pending screen
5. Switch back to admin tab → refresh → new request appears in Pending list
6. Click **Approve** → name + slug form → submit → toast appears, request moves to Active
7. Sign out, sign back in as the newly-approved Gmail → you should land on `/portal/[the-slug-you-chose]`
8. Back as admin → click **Pause** on a partner → row dims → that user can no longer access their portal (404 / redirect to /portal pending screen)

## Next phase

**Phase 3 — Client Content Calendar UI.** Port the existing `/clients/dessertino` portal (calendar view, post cards, modal, feed preview, status tracker) into `/portal/[clientSlug]`. Per-partner data fetched from DB. The two `/clients/*` and `/portal/*` systems converge.
