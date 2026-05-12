/**
 * Admin emails for the /portal route.
 *
 * These users get routed to /portal/admin after Google sign-in. Anyone
 * NOT in this list goes through the brand-partner allowlist check (DB).
 *
 * Sources, merged at call-time so env changes take effect without a code
 * change (Vercel env update + redeploy is enough):
 *   1. HARDCODED_ADMIN_EMAILS — the NYX core team. Always admins.
 *   2. ADMIN_EMAIL env (singular) — the operator-admin who already gates
 *      /automate/admin_automate via middleware. Treating that account as
 *      a portal admin too means there's one canonical "owner" email
 *      rather than two parallel lists that drift.
 *   3. PORTAL_ADMIN_EMAILS env (CSV / whitespace-separated, optional) —
 *      escape hatch for extra portal-only admins without code edits.
 *
 * Why this used to be hardcoded-only: there was an intentional split
 * between "automate admin" (env) and "portal admin" (code) so changes
 * to one wouldn't affect the other. In practice they're the same person
 * — the operator running NYX — so siloing them locked the .env owner
 * (pahariaatharv2005@gmail.com) out of /portal/admin even though they
 * already own /automate/admin_automate.
 */

const HARDCODED_ADMIN_EMAILS: ReadonlyArray<string> = [
  'atharv@nyxstudio.tech',
  'bhavya@nyxstudio.tech',
  'nyx.studios.ai@gmail.com',
].map((e) => e.toLowerCase())

function envAdminEmails(): string[] {
  const out: string[] = []
  const singular = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (singular) out.push(singular)
  const csv = process.env.PORTAL_ADMIN_EMAILS?.trim()
  if (csv) {
    for (const raw of csv.split(/[,\s]+/)) {
      const v = raw.trim().toLowerCase()
      if (v) out.push(v)
    }
  }
  return out
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const target = email.toLowerCase()
  if (HARDCODED_ADMIN_EMAILS.includes(target)) return true
  return envAdminEmails().includes(target)
}

/**
 * Resolved admin list — merged across hardcoded + env sources. Useful
 * for debugging or showing the active admin set in a future admin page.
 */
export function getAdminEmails(): string[] {
  return Array.from(new Set([...HARDCODED_ADMIN_EMAILS, ...envAdminEmails()]))
}
