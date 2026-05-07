import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/config/admins'

export async function requireAdmin(): Promise<
  { ok: true; email: string } | { ok: false; status: 401 | 403 }
> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { ok: false, status: 401 }
  if (!isAdminEmail(session.user.email)) return { ok: false, status: 403 }
  return { ok: true, email: session.user.email }
}
