import { NextResponse } from 'next/server'
import { addPendingClient } from '@/lib/config/clients-store'

// POST /api/portal/signup
//   Self-serve "request access" form for prospective brand partners.
//   Creates (or amends) a PendingPartnerRequest. Admin reviews in
//   /portal/admin and approves via the existing approval flow.
//
//   This endpoint is intentionally unauthenticated — the partner hasn't
//   signed in yet. We rate-limit through the upstream Vercel layer and
//   the addPendingClient helper itself is idempotent per email.
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const name = String(body.name ?? '').trim()
  const brandName = String(body.brandName ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!email.includes('@') || email.length < 5 || email.length > 256) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'Full name required' }, { status: 400 })
  }
  if (brandName.length > 200) {
    return NextResponse.json({ error: 'Brand name too long' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  // Pack the request blurb into the notes column so admin sees it inline.
  const notesParts: string[] = []
  if (brandName) notesParts.push(`Brand: ${brandName}`)
  if (message) notesParts.push(`Message: ${message}`)
  const notes = notesParts.join('\n')

  try {
    const created = await addPendingClient(email, name, notes || undefined)
    return NextResponse.json({
      ok: true,
      created,
      message: created
        ? 'Thanks — we got your request and will review shortly.'
        : 'You already have a request on file. We\'ll be in touch.',
    })
  } catch (err: unknown) {
    console.error('[portal/signup]', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Signup failed' },
      { status: 500 },
    )
  }
}
