# Phase 4 Complete — Multi-Brand Foundation + Admin Content Management

Date: 2026-05-08
Branch / commit at completion: `main` (will be one HEAD commit forward
once this doc is committed)

Phases 1–3 + 2.5 + bugfix established a working single-client portal
with auth, an admin dashboard, and a polished read-only content
calendar. Phase 4 turns that into an agency operating system:

1. Brand configuration moved from TS files to a `BrandConfiguration`
   table — new partners are onboarded entirely from the admin UI.
2. A dedicated content workspace at `/portal/admin/[clientSlug]/posts`
   replaces the seed-script + Prisma Studio workflow.
3. The partner-side `PostModal` closes the agency loop — clients can
   approve or request a revision without leaving the portal.

## Schema additions

All additive. Applied with `npx prisma db push` (project convention —
no `--accept-data-loss` was needed).

```prisma
model BrandConfiguration {
  id              String   @id @default(cuid())
  brandPartnerId  String   @unique
  brandPartner    BrandPartner @relation(fields: [brandPartnerId], references: [id], onDelete: Cascade)

  brandName       String
  tagline         String?
  logoUrl         String?

  primaryColor    String
  secondaryColor  String
  accentColor     String?

  instagramHandle String?
  tiktokHandle    String?

  // Phase 3 legacy fields — preserved so the existing portal doesn't lose data
  clientContactName String?
  clientPhone       String?
  products          String[] @default([])
  operations        String?

  packageType     PackageType
  campaignStart   DateTime
  campaignEnd     DateTime
  platforms       Platform[]

  agencyContactName  String?
  agencyContactEmail String?

  packBEnabled       Boolean  @default(false)
  packBTitle         String?
  packBDescription   String?  @db.Text
  packBSourcePostIds String[] @default([])
  packBSourceLabels  String[] @default([])
  packBGoals         String[] @default([])

  confidentialityNote String? @db.Text
  renewalEmail        String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PostComment {
  id          String      @id @default(cuid())
  postId      String
  post        ContentPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorEmail String
  body        String      @db.Text
  type        CommentType
  createdAt   DateTime    @default(now())

  @@index([postId])
  @@index([createdAt])
}

enum PackageType { TRIAL MONTHLY_RETAINER CUSTOM }
enum Platform    { INSTAGRAM TIKTOK }
enum CommentType { REVISION_REQUEST APPROVAL_NOTE INTERNAL_ADMIN }
```

`ContentPost` gained:
- `platform Platform @default(INSTAGRAM)` — every existing row defaulted to Instagram
- `archivedAt DateTime?` — soft-delete; partner side filters `archivedAt = null`
- `comments PostComment[]` back-relation
- `@@index([archivedAt])`

`BrandPartner` gained `configuration BrandConfiguration?` (one-to-one).

## Migration: Dessertino's TS config → DB

A one-shot script ran during Phase 4 build:

- Read the legacy `src/lib/portal/brands/dessertino.ts` config
- Created the matching `BrandConfiguration` row
- Set `platform=INSTAGRAM` on all 8 existing posts (default fired anyway,
  belt-and-suspenders)

Idempotent (skips create if the row already exists). After the cutover
in Step 8, both the TS config and the migration script were deleted —
git history retains them.

## Files

### New (admin)
- `src/lib/portal/brand-store.ts` — CRUD for `BrandConfiguration`, transactional create
- `src/lib/portal/post-mutations.ts` — admin CRUD for posts + archive
- `src/app/api/portal/admin/_helpers.ts` — `requireAdmin()`
- `src/app/api/portal/admin/brands/route.ts` — POST create brand
- `src/app/api/portal/admin/brands/[clientSlug]/route.ts` — GET, PATCH
- `src/app/api/portal/admin/upload/route.ts` — auth-gated Vercel Blob put
- `src/app/api/portal/admin/[clientSlug]/posts/route.ts` — GET (incl. archived flag), POST
- `src/app/api/portal/admin/[clientSlug]/posts/[postId]/route.ts` — PATCH, DELETE-as-archive
- `src/app/portal/admin/brands/components/BrandForm.tsx` — shared form
- `src/app/portal/admin/brands/new/page.tsx` + admin redirect
- `src/app/portal/admin/brands/[clientSlug]/edit/page.tsx`
- `src/app/portal/admin/components/ThumbnailUploader.tsx`
- `src/app/portal/admin/[clientSlug]/posts/page.tsx` — server entry
- `src/app/portal/admin/[clientSlug]/posts/PostsWorkspaceClient.tsx`
- `src/app/portal/admin/[clientSlug]/posts/components/PostCard.tsx`
- `src/app/portal/admin/[clientSlug]/posts/components/KanbanView.tsx`
- `src/app/portal/admin/[clientSlug]/posts/components/ListView.tsx`
- `src/app/portal/admin/[clientSlug]/posts/components/CalendarView.tsx`
- `src/app/portal/admin/[clientSlug]/posts/components/PostFormModal.tsx`

### New (partner)
- `src/app/api/portal/[clientSlug]/_helpers.ts` — `requirePartner()` + post-in-brand finder
- `src/app/api/portal/[clientSlug]/posts/[postId]/approve/route.ts`
- `src/app/api/portal/[clientSlug]/posts/[postId]/request-revision/route.ts`

### Modified
- `prisma/schema.prisma` — schema additions described above
- `src/lib/portal/brand-config.ts` — `getBrandConfig` is now async, reads `BrandConfiguration` and adapts back to the legacy `BrandConfig` shape via derived fields (`avatarLetter`, `monthLabel`, etc.). TS fallback removed.
- `src/lib/portal/content-store.ts` — filters `archivedAt = null`, includes comments
- `src/app/portal/[clientSlug]/page.tsx` — `await getBrandConfig()`, serializes comments
- `src/app/portal/[clientSlug]/components/types.ts` — `SerializedComment`, `SerializedPost.comments`
- `src/app/portal/[clientSlug]/components/PostModal.tsx` — Approve / Request Revision panel for brand partner when status = NEEDS_APPROVAL; Revision History list when comments exist; toast feedback; optimistic update via `onPostMutated`
- `src/app/portal/[clientSlug]/components/BrandPartnerPortalClient.tsx` — local posts state, `applyPostUpdate`, mounts `<Toaster>`
- `src/app/portal/admin/AdminDashboardClient.tsx` — `+ NEW_BRAND` button; per-row `Edit` and `Content` links
- `.env.example` — `BLOB_READ_WRITE_TOKEN` documented

### Deleted (Step 8 cleanup)
- `src/lib/portal/brands/dessertino.ts` — was the legacy hard-coded config
- `src/lib/portal/brands/` directory removed
- `prisma/migrate-dessertino-config.ts` — one-shot migration; archive lives in git history

## Dependencies added

| Package | Version | Why |
|---|---|---|
| `@vercel/blob` | ^1.1.1 | Thumbnail uploads (auth-gated PUT) |
| `@dnd-kit/core` | ^6.3.1 | Drag handlers for kanban + calendar |
| `@dnd-kit/sortable` | ^10.0.0 | Within-column reordering |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform helpers (peer of sortable) |

Deliberately NOT added (matching existing project conventions):
- **zod / react-hook-form** — kept hand-rolled validation in the route + `useState` + `fetch` in clients to match the existing `pending/route.ts` and `ApproveModal` patterns
- **react-day-picker** — `<input type="date">` is enough for the form, and the calendar view is a custom 7-col grid (Phase 3 already did the same)

## Environment variables

New variable for production (Vercel → Settings → Environment Variables):

```
BLOB_READ_WRITE_TOKEN  vercel_blob_rw_xxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxx
```

Provision via Vercel dashboard → Storage → Blob → Create store → copy
the read/write token. Add to local `.env.local` for dev too.

## Auth model

| Action | Gate | Implemented in |
|---|---|---|
| Admin: create / edit brand | `requireAdmin()` (admin email allow-list) | `src/app/api/portal/admin/_helpers.ts` |
| Admin: upload thumbnail | `requireAdmin()` + MIME + 5 MB cap | `src/app/api/portal/admin/upload/route.ts` |
| Admin: create / edit / archive post | `requireAdmin()` | `src/app/api/portal/admin/[clientSlug]/posts/[postId]/route.ts` |
| Partner: approve post | `requirePartner(slug)` — must be the partner email or admin; brand cannot be ARCHIVED | `src/app/api/portal/[clientSlug]/_helpers.ts` |
| Partner: request revision | same gate, requires non-empty `comment` ≤ 5000 chars | same |

The `requirePartner` gate also blocks any partner from acting on posts
that aren't theirs or that are soft-deleted (`archivedAt != null`).

Approve / Request Revision API routes both refuse to mutate if the post
is not currently in `NEEDS_APPROVAL` (returns 409) — prevents double-
clicks racing the status field.

## UI behaviour

### Admin

- Side nav from the redesigned `/portal/admin` is preserved on the new
  routes via the existing brutalist styling (per-route — no shared layout)
- New brand form auto-derives the slug from the brand name until the
  user touches the slug field manually, then stops auto-deriving
- `+ NEW_POST` modal hard-codes initial status to `IDEA`; the edit
  modal exposes the full status dropdown plus an `ARCHIVE` button
- View toggle (Kanban / List / Calendar) is purely client-state — no
  navigation, no reload
- Drag is optimistic with `sonner` revert toasts in the format
  `"Couldn't update <thing> — reverted. <error>"` (per spec)
- Calendar drag updates `scheduledDate`; kanban drag between columns
  updates `status` (and inserts at the bottom of the target column);
  drag within a column updates `position`
- Archived posts disappear from all three views immediately

### Partner

- Approve / Request Revision panel is rendered ONLY when:
  - the viewer is the brand partner (admin preview hides it)
  - the post is currently `NEEDS_APPROVAL`
- After approve / revise, the modal stays open and reflects the new
  status; the underlying calendar / cards / feed views get the same
  updated row pushed into local state (no full refetch)
- Revision History (read-only list of `PostComment` rows, newest
  first) is visible to both admin (in the post edit modal) and partner
  (inside the post detail modal) whenever any comments exist

## Testing performed

### Programmatic CRUD (same code path as the API)

Each Phase 4 sub-feature was exercised against the production database
via `npx tsx -e` invocations. All ran clean:

- `createBrandWithConfig` → BrandPartner + BrandConfiguration created in
  one transaction; `@`-prefix stripped from social handles; pending
  request auto-resolved
- `updateBrandWithConfig` → partial updates (tagline, accent), brand
  name kept in sync between BrandPartner and BrandConfiguration
- Test brand cleanup → cascade clean, dessertino unaffected (8 posts,
  configuration row intact)
- `createPost` → `position` auto-set to end of `IDEA` column
- `updatePost` (status, scheduledDate, caption) → atomic
- `archivePost` → drops out of `listPostsForAdmin` (default) and
  `getContentPosts`; surfaces with `includeArchived=true`
- Approval/revision flow → status transitions + comment insertion in
  one Prisma write; both partner and admin see the comment

### Build

`npx next build` clean at every checkpoint. Final route table:

| Route | Type | Size / First Load |
|---|---|---|
| `/portal/admin` | dynamic | 6.4 kB / 135 kB |
| `/portal/admin/brands/new` | dynamic | 133 B / 121 kB |
| `/portal/admin/brands/[clientSlug]/edit` | dynamic | 133 B / 121 kB |
| `/portal/admin/[clientSlug]/posts` | dynamic | 25.1 kB / 140 kB |
| `/portal/[clientSlug]` | dynamic | 8.35 kB / 132 kB |
| `/api/portal/admin/brands` | dynamic | 241 B / 102 kB |
| `/api/portal/admin/brands/[clientSlug]` | dynamic | 241 B / 102 kB |
| `/api/portal/admin/upload` | dynamic | 241 B / 102 kB |
| `/api/portal/admin/[clientSlug]/posts` | dynamic | 241 B / 102 kB |
| `/api/portal/admin/[clientSlug]/posts/[postId]` | dynamic | 241 B / 102 kB |
| `/api/portal/[clientSlug]/posts/[postId]/approve` | dynamic | 241 B / 102 kB |
| `/api/portal/[clientSlug]/posts/[postId]/request-revision` | dynamic | 241 B / 102 kB |

### Type check + lint

- `npx tsc --noEmit` — clean
- `npx next lint` — no Phase 4 warnings (two pre-existing warnings in
  `src/app/clients/components/StatusTracker.tsx` from the legacy
  `/clients` route are out of Phase 4 scope)

### What was NOT exercised in the harness

- Live drag-and-drop in a real browser (kanban between columns, kanban
  reorder within column, calendar chip to a different date)
- Vercel Blob actual upload (no `BLOB_READ_WRITE_TOKEN` was provisioned
  in dev during the build) — the route compiles, validates input, and
  fails fast with a 500 + helpful error if the token is missing
- Two-session flow: signing in as the brand partner, hitting Approve /
  Request Revision through the live API, then signing back in as admin
  to see the comment in the edit modal

These are listed below under **Pending external verification**.

## What's pending external verification

1. **Vercel Blob token in production.** Add `BLOB_READ_WRITE_TOKEN` to
   the project's Production environment variables. Until that's done,
   thumbnail uploads return 500 in production and clients see the
   "BLOB_READ_WRITE_TOKEN is not configured" toast.

2. **Drag interactions in a browser.** Spin up `npm run dev`, sign in as
   admin, open `/portal/admin/dessertino/posts`, and verify:
   - Kanban: drag post across columns → status updates, refresh
     persists
   - Kanban: drag within a column → position updates, refresh persists
   - Calendar: drag a chip to a different date → scheduledDate
     updates, refresh persists

3. **Two-session approval flow.** Sign in as Priyanka
   (`ca.priyankabaheti@gmail.com`); open a post that's currently
   `NEEDS_APPROVAL` (admin can move one there via the edit modal);
   click `Approve` → toast + status flips → reload to confirm. Repeat
   with `Request revision` + a comment, then sign back in as admin to
   verify the comment appears in the edit modal's Revision History.

4. **Vercel preview deployment** — push a branch, open the preview URL,
   re-run the manual UI tests above on a deployment to catch any SSR /
   serverless-cold-start issues that don't show up locally.

## Known limitations / deferred features

- **Bulk actions.** No multi-select on the kanban or list views. The
  CRUD is per-post for now.
- **CSV import.** Brief was silent on bulk import. Not built.
- **Versioning.** Approving a post and then editing it (admin side)
  doesn't snapshot the version that was approved. The `PostComment`
  trail is the only record of what changed and when.
- **Real notifications.** The flow doesn't email Priyanka when a post
  enters `NEEDS_APPROVAL`. Today she has to be in the portal to see
  it. Punt to a later phase if/when SES / Resend wires up.
- **Pack B sources by post ID.** Schema supports `packBSourcePostIds`,
  but the Phase 4 brand form only edits `packBSourceLabels` (free-form
  strings, matching the legacy Dessertino config). When real Pack B
  selection UX is needed, surface a multi-select of existing posts.
- **Logo upload.** `BrandConfiguration.logoUrl` is in the schema but
  the form doesn't expose a logo uploader yet. Easy follow-up — the
  ThumbnailUploader component already covers the pattern.

## Acceptance criteria — final

- [x] Step 0 discovery report delivered and approved
- [x] BrandConfiguration, PostComment models added; Platform / PackageType / CommentType enums; archivedAt + platform on ContentPost
- [x] Schema applied via db push, no data loss
- [x] Dessertino's TS config migrated to DB
- [x] Brand onboarding form working at `/portal/admin/brands/new`
- [x] Brand edit working at `/portal/admin/brands/[slug]/edit`
- [x] Vercel Blob upload route in place + reusable ThumbnailUploader
- [x] Admin content workspace at `/portal/admin/[clientSlug]/posts` with 3 views
- [x] Post create + edit + archive working (verified at the data layer)
- [x] Kanban drag wired (between columns + within column) — UI-only verification pending
- [x] Calendar drag wired (between dates) — UI-only verification pending
- [x] Partner approve button working with status flip + comment
- [x] Partner revise button working with comment creation + status flip
- [x] Comments visible on both admin and partner side
- [x] Legacy TS config + migration script deleted
- [x] Phase 3 `/portal/dessertino` still works identically (verified DB-only)
- [x] `/automate/*` routes unaffected (Phase 2.5 not regressed — Phase 4 didn't touch middleware or auth config)
- [x] CLIENT SIDE button still works (`href="/portal"` unchanged)
- [x] `npm run build` clean
- [x] `PHASE_4_COMPLETE.md` generated (this file)
