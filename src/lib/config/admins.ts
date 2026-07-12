/**
 * Admin emails for the /portal route.
 *
 * Users here get routed to /portal/admin after Google sign-in. Anyone NOT
 * in this list goes through the brand-partner allowlist check (DB).
 *
 * Sources, merged at call-time so env changes take effect without a
 * code change (Vercel env update + redeploy is enough):
 *   1. HARDCODED_ADMIN_EMAILS — the NYX core team.
 *   2. ADMIN_EMAIL env (singular) — the canonical owner email.
 *   3. PORTAL_ADMIN_EMAILS env (CSV / whitespace-separated, optional) —
 *      escape hatch for extra portal admins without code edits.
 */

const HARDCODED_ADMIN_EMAILS: ReadonlyArray<string> = [
  'atharv@nyxstudio.tech',
  'bhavya@nyxstudio.tech',
  'official.nyxstudio@gmail.com',
  'official.nystudio@gmail.com',
  'pahariaatharv2005@gmail.com',
  'jainbhavya168@gmail.com',
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
 * Resolved admin list — merged across hardcoded + env sources.
 */
export function getAdminEmails(): string[] {
  return Array.from(new Set([...HARDCODED_ADMIN_EMAILS, ...envAdminEmails()]))
}
