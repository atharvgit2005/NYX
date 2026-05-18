> **⚠️ SCRAPPED — 2026-05-18**
>
> The subdomain split described below has been **reverted**. `/automate/*` is
> served from the main Next app on `www.nyxstudio.tech` again. The redirect
> rules, host-gated rewrites, and the cross-DB migration script have all been
> removed (or archived under `scripts/archive/`).
>
> This file is kept only as a historical record of what was attempted.
> Do not act on the instructions below. If the subdomain plan is ever
> revived, redesign from scratch rather than reusing this doc verbatim.

---

# Phase 2.5 — Automate moves to `automate.nyxstudio.tech`

## What this changes

The legacy SaaS lives at `/automate/*` in the codebase. Instead of deleting it (you said you want to keep it), it's now served from a satellite subdomain. Marketing site stays at `www.nyxstudio.tech`. Logins work seamlessly across both.

```
Before                                    After
www.nyxstudio.tech/                       www.nyxstudio.tech/                  ← marketing site
www.nyxstudio.tech/portal                 www.nyxstudio.tech/portal            ← brand-partner portal
www.nyxstudio.tech/automate ← clutter     automate.nyxstudio.tech/             ← legacy SaaS landing
www.nyxstudio.tech/automate/dashboard     automate.nyxstudio.tech/automate/dashboard
www.nyxstudio.tech/automate/admin         automate.nyxstudio.tech/automate/admin
```

URLs already in the wild keep working: `www.nyxstudio.tech/automate/anything` 308-redirects to the subdomain.

## Code changes

**`next.config.ts`** — added redirect + rewrite rules, all gated on `host` header so they're inert in dev:

| Direction | Rule | Type |
|---|---|---|
| `nyxstudio.tech/automate/*` | → `automate.nyxstudio.tech/automate/*` | 308 permanent |
| `automate.nyxstudio.tech/` | → serves `/automate` internally (URL stays clean) | rewrite |
| `automate.nyxstudio.tech/portal/*` | → `www.nyxstudio.tech/portal/*` | 307 |
| `automate.nyxstudio.tech/clients/*` | → `www.nyxstudio.tech/clients/*` | 307 |
| `automate.nyxstudio.tech/work \| /services \| /contact /*` | → `www.nyxstudio.tech/...` | 307 |

**`src/lib/auth.ts`** — added a production-only `cookies` config that pins the session cookie to `.nyxstudio.tech` (parent domain) so the same login works on both subdomains. In dev the cookie stays host-only, so `localhost` is unaffected.

## Three things you need to do (you, not me)

These are external service actions — I can't reach them from the codebase.

### 1. DNS — add the subdomain CNAME

In your DNS provider (wherever `nyxstudio.tech` is hosted — Vercel DNS, Cloudflare, GoDaddy, etc.):

```
Type:   CNAME
Name:   automate
Value:  cname.vercel-dns.com.       (Vercel will tell you the exact value)
TTL:    Auto / 3600
```

If your DNS provider doesn't allow CNAMEs at apex/subdomains, use the `A` record alternative Vercel shows.

### 2. Vercel — add the domain to the project

1. Open the Vercel project for nyx-engine
2. Settings → Domains
3. Add domain: `automate.nyxstudio.tech`
4. Vercel will verify DNS and issue an SSL cert automatically (takes ~1 minute)

### 3. Google OAuth — verify the callback URL

This should already be set, but confirm:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Open the OAuth 2.0 Client ID used by NYX
3. Authorised redirect URIs must contain:
   ```
   https://www.nyxstudio.tech/api/auth/callback/google
   ```
4. You do **not** need to add `automate.nyxstudio.tech` here. Auth funnels through the main domain by design — the cookie domain (`.nyxstudio.tech`) lets the session ride across to the subdomain afterwards.

That's the full external setup. After all three are in place, deploy.

## How auth works across the split

1. User on `automate.nyxstudio.tech` clicks **Sign In with Google**
2. NextAuth uses `NEXTAUTH_URL` (= `https://www.nyxstudio.tech`) to build the OAuth redirect — Google sees the redirect URI it already knows
3. Google bounces back to `www.nyxstudio.tech/api/auth/callback/google`
4. NextAuth sets the session cookie with `domain=.nyxstudio.tech`
5. NextAuth redirects to `callbackUrl`. If that's `/automate/dashboard`, browser hits `www.nyxstudio.tech/automate/dashboard`, which 308-redirects to `automate.nyxstudio.tech/automate/dashboard`
6. The session cookie is visible there → user is logged in

Same flow works in reverse (sign in on www, ride session over to automate.).

## Local dev — what changes

**Nothing.** All redirect/rewrite rules are gated on production hostnames. On `localhost:3000`:

- `/portal/*` works as before
- `/automate/*` works as before — no redirect to subdomain
- Cookies stay host-only (no `.nyxstudio.tech` domain)

So you can keep iterating without touching `/etc/hosts` or wildcard DNS.

If you ever do want to test the subdomain locally, hit your dev server with a custom Host header:

```bash
# Simulates someone on the automate subdomain
curl -H "Host: automate.nyxstudio.tech" http://localhost:3000/portal
# → 307 redirect to https://www.nyxstudio.tech/portal
```

## Verified locally

Routing simulated by curling with `Host:` headers — all four cases land correctly:

| Simulated host | Path | Behaviour |
|---|---|---|
| `automate.nyxstudio.tech` | `/` | 200 — serves the SaaS landing via internal rewrite |
| `automate.nyxstudio.tech` | `/portal` | 307 → www.nyxstudio.tech/portal |
| `www.nyxstudio.tech` | `/automate/dashboard` | 308 → automate.nyxstudio.tech/automate/dashboard |
| `localhost:3000` | `/automate` | 200 (no redirect — dev untouched) |

`npx tsc --noEmit` clean.

## Acceptance after deploy

Run through these on the live site once DNS + Vercel + Google are configured:

| Action | Expected |
|---|---|
| Visit `automate.nyxstudio.tech` | SaaS landing renders, URL stays clean (no `/automate` showing) |
| Visit `www.nyxstudio.tech/automate` | 308 → `automate.nyxstudio.tech/automate` |
| Sign in on `automate.nyxstudio.tech` | Bounces through Google, lands back on subdomain, session active |
| Then visit `www.nyxstudio.tech/portal` | Already signed in (session shared via `.nyxstudio.tech` cookie) |
| Visit `automate.nyxstudio.tech/portal` | 307 → `www.nyxstudio.tech/portal` |
| Visit `automate.nyxstudio.tech/clients/dessertino` | 307 → `www.nyxstudio.tech/clients/dessertino` |

## Limitations / things to watch

1. **URL aesthetics on subdomain.** The legacy SaaS keeps its `/automate/...` prefix even on the subdomain (e.g., `automate.nyxstudio.tech/automate/dashboard` instead of `automate.nyxstudio.tech/dashboard`). Cleaning that would require updating every internal `<Link href="/automate/...">` to drop the prefix — many files. Skipped for scope. Bare root (`automate.nyxstudio.tech/`) does serve cleanly.

2. **Don't promote the subdomain in marketing.** AUTOMATE has been removed from the main nav (Phase 2.5 fix). Anyone with the subdomain URL or a stale `/automate/*` link still gets there. New visitors won't stumble in.

3. **`NEXTAUTH_URL` must be `https://www.nyxstudio.tech`** in the production env. If it's set to `nyxstudio.tech` without `www`, the canonical redirect causes a brief flicker through the redirect chain on every auth callback. Set it explicitly.

4. **If you ever want to kill `/automate` entirely**, the rollback is one-shot: delete the redirect rules in `next.config.ts`, delete the `automate.nyxstudio.tech` domain from Vercel, hard-delete `src/app/automate/*` and unused Prisma models. Save it for a deliberate Phase 3.5+.
