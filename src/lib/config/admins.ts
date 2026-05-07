/**
 * Admin emails for the /portal route.
 *
 * These users get routed to /portal/admin after Google sign-in. Anyone
 * NOT in this list goes through the brand-partner allowlist check (DB).
 *
 * To add an admin: edit this array and redeploy. No DB needed.
 *
 * Note: this is separate from the existing ADMIN_EMAIL env var which gates
 * /automate/admin. They are independent on purpose so changes here don't
 * affect the automate side.
 */
export const ADMIN_EMAILS: string[] = [
  'atharv@nyxstudio.tech',
  'bhavya@nyxstudio.tech',
  'nyx.studios.ai@gmail.com',
  'pahariaatharv2005@gmail.com', // Atharv's working Google account (added so admin login works during dev)
].map((e) => e.toLowerCase())

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
