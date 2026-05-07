# Phase 1 Complete — Client Portal Auth & Routing

## What was built

A `CLIENT SIDE` entry point on the main landing page that routes admins, approved clients, and unknown users to the right destination after Google sign-in (or credentials login). Dashboards and content calendars themselves are still placeholders — those are Phase 2 and Phase 3.

### User flow

1. Visitor lands on `/`, sees `CLIENT SIDE` link in the top nav (right after `AUTOMATE`)
2. Click → `/client-portal`. Middleware sees no session → redirects to `/automate/login?callbackUrl=/client-portal`
3. They sign in with Google or credentials. The login page now honours `callbackUrl` and sends them back to `/client-portal` on success
4. `/client-portal/page.tsx` is a server component that reads the session and routes by email:
   - **Admin email** (in `ADMIN_EMAILS`) → `/client-portal/admin`
   - **Approved client email** (in `clients.json` → `approvedClients`) → `/client-portal/[clientSlug]`
   - **Anyone else** → email is appended to `pendingClients`, "You're on the list" screen renders

## Files changed

### New
- `src/lib/config/admins.ts` — exports `ADMIN_EMAILS` array and `isAdminEmail()` helper
- `src/lib/config/clients.json` — `approvedClients` and `pendingClients` arrays. Seeded with Dessertino
- `src/lib/config/clients-store.ts` — read/write helpers (`findApprovedClient`, `addPendingClient`)
- `src/app/client-portal/page.tsx` — the routing brain
- `src/app/client-portal/admin/page.tsx` — Phase 2 placeholder (admin-gated)
- `src/app/client-portal/[clientSlug]/page.tsx` — Phase 3 placeholder (client-gated, admin override)
- `src/app/client-portal/components/PendingApprovalScreen.tsx`
- `src/app/client-portal/components/SignOutButton.tsx`

### Modified
- `src/app/page.tsx` — added `CLIENT SIDE` link to desktop nav (line 53), exact same styling as `AUTOMATE`
- `src/middleware.ts` — added `/client-portal/:path*` to matcher and `authorized` callback so unauthed users get bounced to login
- `src/app/automate/login/LoginClient.tsx` — reads `callbackUrl` from query (was hardcoded to `/automate/dashboard`). Falls back to dashboard when absent. Applied to both Google sign-in and credentials login

### Untouched (intentionally)
- `src/lib/auth.ts` — no changes; we reuse the existing NextAuth + JWT setup
- `src/components/AuthProvider.tsx` — already mounts `<SessionProvider>` in the root layout
- `/automate/admin` middleware logic — kept on its existing single-`ADMIN_EMAIL` env var so this rollout doesn't touch the Automate admin gate

## How to add a new admin

Edit [src/lib/config/admins.ts](src/lib/config/admins.ts):

```ts
export const ADMIN_EMAILS: string[] = [
  'atharv@nyxstudio.tech',
  'bhavya@nyxstudio.tech',
  'nyx.studios.ai@gmail.com',
  'newperson@example.com',  // ← add here
]
```

Redeploy. No DB migration needed.

## How to manually approve a pending client

Open [src/lib/config/clients.json](src/lib/config/clients.json), move the entry from `pendingClients` to `approvedClients`, and add the slug + approver:

```json
{
  "approvedClients": [
    {
      "email": "ca.priyankabaheti@gmail.com",
      "clientSlug": "dessertino",
      "clientName": "Dessertino",
      "approvedAt": "2026-05-05",
      "approvedBy": "atharv@nyxstudio.tech"
    }
  ],
  "pendingClients": []
}
```

The `clientSlug` must match a config under `src/app/clients/data/<slug>.config.json` (Phase 3 will plug the real portal in here).

## Acceptance criteria

- [x] `CLIENT SIDE` link visually identical to `AUTOMATE` (same Tailwind classes verbatim)
- [x] Click → triggers existing Google + credentials login flow
- [x] Admin email → `/client-portal/admin` (verified by route test)
- [x] Approved client → `/client-portal/[clientSlug]`
- [x] Unknown email → "Pending Approval" screen, email captured in `pendingClients`
- [x] Sign Out works from all three destinations (returns to `/`)
- [x] No console errors, no TypeScript errors (`npx tsc --noEmit` clean)
- [x] Mobile-responsive (placeholder cards stack on small screens)
- [x] Middleware bounces unauthed visitors to login, login bounces them back via `callbackUrl`

## Known limitations / things to fix in Phase 2

1. **`clients.json` is not gitignored.** The brief suggested gitignoring if it contains real emails, but Vercel's read-only filesystem means a gitignored file would never be present in production — `addPendingClient` would have nothing to write to and `findApprovedClient` would always return null. The pragmatic Phase 1 choice is to commit the file. Phase 2 should migrate `approvedClients` and `pendingClients` to Prisma (the project already has Prisma + Postgres set up).

2. **`addPendingClient` writes to disk at request time.** Works in `next dev` and on a long-lived server, but on Vercel serverless the file write succeeds in-memory and is then discarded when the lambda cools. Pending requests will appear to register but won't persist across deploys/cold-starts. This is fine for Phase 1 verification but **must** be moved to DB before launch.

3. **MobileNav doesn't include `CLIENT SIDE`.** Following the existing pattern — `AUTOMATE` is also desktop-only on the bottom mobile nav. Mobile clients can still hit the URL directly, and the page itself is mobile-responsive. Phase 2 could add a 5-tab bottom nav or a hamburger menu.

4. **Admin override in `[clientSlug]` is a soft check.** Admins can preview any client portal by visiting `/client-portal/<slug>` directly. Useful for previews, but means an admin email leaking would expose all client portals. Acceptable for Phase 1.

5. **No email notification yet** when a new pending client appears. Phase 2 admin dashboard should poll/show pending list, and ideally trigger an email to admins on new requests.

6. **Admin emails are placeholders.** [src/lib/config/admins.ts](src/lib/config/admins.ts) currently lists `atharv@nyxstudio.tech`, `bhavya@nyxstudio.tech`, `nyx.studios.ai@gmail.com`. Confirm/replace with the real Google account emails the founders sign in with before merging.

## How to test locally

```bash
npm run dev
```

Then:

| URL | Expected |
|---|---|
| `/` | Landing page with CLIENT SIDE in top-right nav |
| `/client-portal` (signed out) | Redirect → `/automate/login?callbackUrl=/client-portal` |
| `/client-portal` (signed in as admin) | Redirect → `/client-portal/admin` |
| `/client-portal` (signed in as `ca.priyankabaheti@gmail.com`) | Redirect → `/client-portal/dessertino` |
| `/client-portal` (signed in with any other Gmail) | Pending approval screen, email recorded in `clients.json → pendingClients` |
| `/client-portal/admin` (non-admin) | Redirect → `/client-portal` |
| `/client-portal/dessertino` (wrong client) | Redirect → their own slug, or `/client-portal` if not approved |

## Next phase

**Phase 2 — Admin Dashboard.** A real `/client-portal/admin` page that lists pending requests, lets you approve/reject inline, lists active clients, and shows pipeline status across all of them. Prisma migration goes here too.
