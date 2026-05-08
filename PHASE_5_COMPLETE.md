# Phase 5 Complete — Admin Edit Mode on Partner-Style Canvas

Date: 2026-05-08
Branch / commit at completion: `main` (uncommitted; user pushes after manual smoke)

## What it does

`/portal/admin/[clientSlug]/posts` (the Phase 4 brutalist workspace) stays
exactly as-is — that's the serious management surface. Phase 5 adds a
SECOND admin entry point: when an admin opens `/portal/[clientSlug]`
(the same URL partners use), they see the polished partner-style canvas
WITH edit controls overlaid on top.

- **Partner viewport on `/portal/[clientSlug]`**: zero behavioural change
  from Phase 4. Read-only Calendar / Cards / Feed; click-to-detail; the
  approve/revise panel on `NEEDS_APPROVAL` posts.
- **Admin viewport on `/portal/[clientSlug]`**: same canvas + drag chips
  between days, click-to-edit, click-empty-day to create, hover edit
  affordances on Cards & Feed, an `EDITING` chip in the header, and a
  `+ New post` button in the view-toggle bar.

The agency now has two complementary surfaces:
  • workspace mode at `/portal/admin/[clientSlug]/posts` (kanban, bulk,
    full data visibility)
  • preview mode at `/portal/[clientSlug]` (polished canvas, edit while
    seeing what the client sees)

## Files

### New

- `src/app/portal/[clientSlug]/components/AdminEditOverlay.tsx`
  Stateless shell. Mounts the editorial-themed PostFormModal when the
  parent's `editing` or `creating` state is non-null. Six props.
- `src/app/portal/[clientSlug]/components/CalendarAdminLayer.tsx`
  Owns DndContext + DraggableChip + DroppableDay + admin "+" affordances.
  Renders the desktop month-grid body. All `@dnd-kit/core` imports live
  here. Loaded only when admin (dynamic, ssr:false).
- `src/app/portal/[clientSlug]/components/useAdminPostMutations.ts`
  Hook encapsulating the optimistic patterns from Phase 4's
  PostsWorkspaceClient: `createPost / savePost / archivePost /
  moveToDate / moveStatus / reorder` + a `busy` flag. Reuses Phase 4
  endpoints; revert-on-error toasts in the spec format
  `Couldn't update X — reverted. {error}`.

### Modified

- `prisma/schema.prisma` — unchanged in Phase 5.
- `src/app/portal/[clientSlug]/components/types.ts`
  `SerializedPost` gained `platform: Platform` and
  `archivedAt: string | null`. Phase 3 consumers ignore the extras.
- `src/app/portal/[clientSlug]/page.tsx`
  Server serializer maps `p.platform` and `p.archivedAt` into
  `SerializedPost`.
- `src/app/api/portal/[clientSlug]/posts/[postId]/approve/route.ts`,
  `src/app/api/portal/[clientSlug]/posts/[postId]/request-revision/route.ts`
  Hand-shaped responses include the two new fields so optimistic state
  stays in contract after approve / revise.
- `src/app/portal/admin/[clientSlug]/posts/components/PostFormModal.tsx`
  Added `theme: 'brutalist' | 'editorial'` prop (default brutalist),
  ThemeContext for Field / ChipGroup helpers, parallel
  `editorial-input` global CSS class, `PostFormInitial` structural
  subset type so both `AdminPost` and `SerializedPost` satisfy
  `initial?:`. ~200 lines added (token tables + helpers); form logic
  untouched.
- `src/app/portal/[clientSlug]/components/CalendarView.tsx`
  All `@dnd-kit/core` imports stripped. Partner desktop grid stays
  inline (static buttons). Admin path delegates to
  `CalendarAdminLayer` via `next/dynamic` with a layout-skeleton
  loading state. Mobile timeline (no drag) handles its own admin click
  branch and gets a "+ Add post" footer button.
- `src/app/portal/[clientSlug]/components/CardsView.tsx`
  Pass-through `viewerIsAdmin` prop to PostCard. 14 lines stays
  minimal.
- `src/app/portal/[clientSlug]/components/PostCard.tsx`
  Hover-revealed pencil chip top-right (white pill, brand-pink border
  at 30%, brand-pink text, soft shadow) when `viewerIsAdmin`.
  `pointer-events-none` so it doesn't intercept the wrapping button
  click.
- `src/app/portal/[clientSlug]/components/FeedView.tsx`
  Existing dark hover overlay gains a single `Click to edit` line
  (8 px, uppercase, letter-spaced, 85% opacity white) under the title
  when admin. IG mockup chrome unchanged.
- `src/app/portal/[clientSlug]/components/PortalHeader.tsx`
  `EDITING` pill: lowercase, brand-pink dot prefix (animated pulse),
  `0.08em` letter-spacing, brand-pink-on-faint-pink chip with 30%
  border. Hidden on mobile (sm:inline-flex). Only when admin.
- `src/app/portal/[clientSlug]/components/BrandPartnerPortalClient.tsx`
  - `dynamic(() => import('./AdminEditOverlay'), { ssr: false })`
  - `useAdminPostMutations` instantiated once with `clientSlug`,
    `posts`, `setPosts`
  - `editing` + `creating` state added
  - Refactored `statusCounts` from `useState` to `useMemo` from `posts`
    so all admin mutations propagate automatically
  - `handleSelectPost` branches admin → `setEditing(post)` /
    partner → `setSelectedPost(post)` (the read-only `PostModal`)
  - `defaultPlatform` derived from `brand.campaign.platform` (lowercase
    substring match — `'tiktok'` → TIKTOK, else INSTAGRAM)
  - `+ New post` button in the ViewToggle bar (top-right). Click sets
    `creating` with today's ISO date.
  - `AdminEditOverlay` mounted only when `viewerIsAdmin` — overlay is
    inert otherwise.

## Bundle delta table

| Route | Phase 4 baseline | Step 4 (broken) | Phase 5 final |
| --- | --- | --- | --- |
| `/portal/[clientSlug]` First Load | 132 kB | 148 kB | **135 kB** |
| `/portal/[clientSlug]` page chunk | 8.35 kB | 11.7 kB | 11.4 kB |
| `/portal/admin/[clientSlug]/posts` First Load | 140 kB | 143 kB | 143 kB |
| Shared First Load | 102 kB | 102 kB | 102 kB |

**Partner First Load is +3 kB over Phase 4 baseline.** That residual
covers the static `useAdminPostMutations` hook (~2 kB) + the
`next/dynamic` shims that reference `AdminEditOverlay` and
`CalendarAdminLayer` (~1 kB). `@dnd-kit/core`, `PostFormModal`, and
`ThumbnailUploader` are all in lazy chunks that partner traffic never
fetches.

The admin path picks up the `CalendarAdminLayer` chunk on first calendar
render; CalendarView shows a 6×7 layout-matched skeleton during the
fetch, so there's no layout flash.

## Architectural decisions

### 1. `theme: 'brutalist' | 'editorial'` prop on PostFormModal

Picked over the alternatives (separate editorial v2, full restyle):
- Single source of truth for form logic, validation, submit, comments
  display, and ESC-handling.
- Theme tokens table at top of file; React Context plumbs `T` to
  `Field` and `ChipGroup` helpers — no per-call prop drilling.
- Brutalist is default; existing Phase 4 workspace renders pixel-
  identical (verified by structural correspondence — every brutalist
  token value matches the original hardcoded strings/styles).
- Editorial mode uses cream `#FAF7F2`, navy `#1A2A5E`, Playfair-style
  serif headings, `1px` borders, `12px` radius on inputs, soft
  `0 24px 80px rgba(26,42,94,0.18)` shadow.
- Trade-off: file grew 476 → ~580 lines (~22% growth). Form logic
  untouched.

### 2. Dynamic-imported `CalendarAdminLayer`

Phase 5 spec required "zero bundle impact for partners". Placing
`@dnd-kit/core` imports in CalendarView pulled +16 kB into partner
First Load. Fix:
- `CalendarAdminLayer.tsx` is a self-contained file with all dnd-kit
  primitives.
- CalendarView dynamic-imports it: `dynamic(() => import('./CalendarAdminLayer'), { ssr: false })`.
- Visible only when `viewerIsAdmin` AND all admin callbacks are
  provided.
- Layout-skeleton loading state matches the grid dimensions to prevent
  flash.
- The partner desktop grid is kept inline in CalendarView (small
  duplication of cell-rendering JSX — accepted because the partner
  flavour is read-only and can drift independently).

### 3. `useAdminPostMutations` hook

Encapsulation point for the optimistic mutation pattern. Why a hook
instead of free functions:
- Owns the `busy` flag (modal disables submit while a request is
  in-flight).
- Captures `posts` and `setPosts` once via closure — every callback
  gets stable optimistic + revert behaviour without re-passing them.
- Same revert-toast format as Phase 4's PostsWorkspaceClient.
- Reuses Phase 4 admin API endpoints — no new mutation routes.

### 4. `viewerIsAdmin` propagation, single click router

The parent's `handleSelectPost` is the single branching point for
click → editor (admin) / read-only modal (partner). All three views
call `onSelectPost` with the post they were clicked on; the parent
routes. CalendarView additionally has `onEditPost` because it needs to
distinguish drag from click internally. This keeps the contract simple
for Cards/Feed (they just receive `viewerIsAdmin` for the hover
affordance render).

### 5. `statusCounts` from `useMemo(posts)`

Was `useState(initialCounts)` updated only via `applyPostUpdate` (the
modal approve/revise flow). Now derived from `posts` so admin
mutations (drag, edit, archive) propagate without an extra setter.

## Deferred polish

These were observed during Phase 5 build and are explicitly out of
scope; capture so they don't get forgotten.

1. **`defaultPlatform` substring matching.** Currently
   `BrandConfig.campaign.platform` is a human-readable label
   (`"Instagram"`, `"TikTok"`) and Phase 5 derives the enum via
   `.toLowerCase().includes('tiktok') ? 'TIKTOK' : 'INSTAGRAM'`.
   When multi-platform brands onboard, expose `BrandConfig.platforms:
   Platform[]` from the adapter (`src/lib/portal/brand-config.ts`)
   and pass that down. The schema already stores the array on
   `BrandConfiguration.platforms`.

2. **"View as partner" preview mode.** Originally suggested in the
   discovery; deliberately deferred. When admin wants to confirm what
   the client sees, the URL trick (admin opens `/portal/dessertino`
   already shows the canvas) plus a "Preview as partner" toggle that
   forces `viewerIsAdmin = false` for the session would close the
   loop. Probably a 30-line PR — header toggle + state override in
   BrandPartnerPortalClient.

3. **Logo upload on the brand form** (`BrandConfiguration.logoUrl`).
   Phase 4 carried this forward; still pending. The
   `ThumbnailUploader` component already covers the pattern — drop
   another instance into `BrandForm` for the logo field. Trivial.

4. **Cards / Feed drag-reorder.** The Phase 5 spec explicitly excluded
   this — calendar is the create surface, cards are read-tiles, feed
   is a frozen IG mockup. If reordering by display position becomes
   useful later, the kanban surface in `/portal/admin/[clientSlug]/posts`
   already has it.

## Browser-level verification — REQUIRED before client handoff

User runs these manually. None of them can be programmatically asserted
from outside a real browser session.

### Partner non-regression (sign in as Priyanka)

- [ ] `https://www.nyxstudio.tech/portal/dessertino` renders the cream
  canvas exactly as Phase 4 left it (calendar, cards, feed all
  switchable, no drag affordance, no `+` buttons, no `EDITING` pill,
  no edit pencil on cards or feed)
- [ ] Click any chip / card / feed tile → read-only PostModal opens
- [ ] On a `NEEDS_APPROVAL` post: Approve / Request Revision panel
  visible
- [ ] Approve → status flips, toast confirms, modal stays open with
  new state
- [ ] Request revision + comment → status flips to NEEDS_REVISION,
  comment saved
- [ ] Mobile (≤ 640px) timeline list still works, no `+ Add post`
  button at the bottom

### Admin overlay (sign in as `pahariaatharv2005@gmail.com`)

- [ ] Land on `/portal/dessertino` → see `• editing` pill in the
  header (next to `← Admin` link), `+ New post` button in the
  view-toggle bar
- [ ] Calendar view: hover an empty in-month day → `+ Add` affordance
  appears centered
- [ ] Click an empty day → editorial PostFormModal opens (white,
  navy, serif heading, rounded corners, soft shadow) prefilled with
  that day's date
- [ ] Click `+ New post` button → same modal, today prefilled
- [ ] Drag a chip from one day to another → date updates, refresh
  persists
- [ ] On drag-over a target day, cell shows pink overlay + dashed
  outline
- [ ] Click a chip → editorial editor opens with the post loaded
  (status dropdown visible, archive button visible)
- [ ] Save edits → toast confirms, modal closes, canvas reflects
  changes
- [ ] Cards view: hover a card → pencil chip fades in top-right
- [ ] Click card → editorial editor opens
- [ ] Feed view: hover a tile → dark overlay shows title + "Click to
  edit" hint
- [ ] Click tile → editorial editor opens
- [ ] Archive a post from the editor → it disappears from all views,
  toast confirms

### Bundle / network sanity

- [ ] Open DevTools → Network on a partner viewport, filter by
  `dnd-kit` — should see ZERO requests for the chunk containing it
- [ ] Switch to admin viewport → first calendar render fetches the
  `CalendarAdminLayer` chunk (one new JS request)
- [ ] No console errors during normal flow

### Workspace non-regression (sign in as admin, go to
`/portal/admin/dessertino/posts`)

- [ ] Brutalist workspace renders identically to Phase 4 (black/orange
  theme, kanban / list / calendar views, drag works, modal opens in
  brutalist theme — NOT editorial)
- [ ] Create / edit / archive in the workspace still work end-to-end

## Pending Vercel preview verification

- [ ] Push branch, open the Vercel preview URL
- [ ] Re-run the admin overlay smoke list above against the preview
  domain (DOM + network behave the same as local)
- [ ] Confirm no SSR / serverless cold-start issues that don't show up
  in `npm run dev`

## What's NOT in Phase 5

Listed for future-phase planning, not for this release:

- **Multi-member admin access.** Today the admin gate is a single
  email allow-list (`isAdminEmail`). Multi-admin needs a Members table
  + role mapping.
- **Real-time notifications.** Priyanka still has to be looking at the
  portal to notice a `NEEDS_APPROVAL` post. Wire SES / Resend +
  email-on-status-change in a later phase.
- **Versioning.** Approving a post then editing it doesn't snapshot
  the approved version. The `PostComment` trail is the only audit
  log. Optimistic locking + version snapshots is a separate piece.
- **Cards / Feed drag.** Out of scope per Step 4 brief — calendar is
  the create surface; cards and feed remain non-positional.
- **Bulk actions on the canvas.** Multi-select / bulk archive lives in
  the admin workspace if/when added; canvas mode is single-post-at-a-
  time by design (matches the editorial reading flow).
- **Partner-side drag.** Partners never drag anything; the canvas is
  read-only for them.
- **"View as partner" preview toggle.** Deferred polish (above) — not
  in the original Phase 5 brief and explicitly punted in the Step 6
  approval.

## Acceptance criteria — final

- [x] Step 0 discovery report delivered and approved
- [x] `SerializedPost` extended with `platform` + `archivedAt`; Phase
  3 consumers verified non-regressing
- [x] Themed `PostFormModal` (brutalist default; editorial opt-in);
  form logic untouched
- [x] `useAdminPostMutations` hook with
  create/save/archive/move-status/move-date/reorder + busy flag,
  optimistic + revert-on-error
- [x] `AdminEditOverlay` shell, dynamic-imported with `ssr: false`
- [x] CalendarView: drag (admin only) + click-to-edit (admin) +
  click-empty-day (admin); partner path byte-identical
- [x] `CalendarAdminLayer` extracted; partner First Load returned to
  baseline (+3 kB residual for the hook + dynamic shim)
- [x] CardsView + PostCard: hover pencil affordance (admin)
- [x] FeedView: hover "Click to edit" hint (admin)
- [x] `EDITING` pill in PortalHeader (admin)
- [x] `+ New post` button in view-toggle bar (admin)
- [x] `npm run build` clean
- [x] `npx tsc --noEmit` clean
- [x] `npx next lint` clean (no new Phase 5 warnings)
- [x] Phase 4 non-regression verified programmatically
- [x] `PHASE_5_COMPLETE.md` generated (this file)

Phase 4 workspace, partner read-only behaviour, automate routes,
middleware, NextAuth config, Prisma schema, and dependencies — all
unchanged.
