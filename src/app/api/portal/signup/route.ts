import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prismadb'
import { addPendingClient } from '@/lib/config/clients-store'

// POST /api/portal/signup
//   Self-serve account creation for prospective brand partners. Creates
//   BOTH:
//     • a User row (so they can sign in immediately with credentials)
//     • a PendingPartnerRequest (so admin can review and approve them
//       to a brand)
//   After signup the user logs in normally; until an admin approves,
//   /portal shows the pending-approval screen.
//
//   When the email already has a User row, returns a 409 with
//   `errorCode: 'ALREADY_REGISTERED'` so the form can deep-link the
//   user to /portal/login with the email pre-filled, instead of
//   showing the cryptic generic error.
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const name = String(body.name ?? '').trim()
  const brandName = String(body.brandName ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!email.includes('@') || email.length < 5 || email.length > 256) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'Full name required' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    )
  }
  if (password.length > 200) {
    return NextResponse.json({ error: 'Password too long' }, { status: 400 })
  }
  if (brandName.length > 200) {
    return NextResponse.json({ error: 'Brand name too long' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  // If a User row already exists, redirect the user to login instead
  // of rejecting cryptically.
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      {
        error: 'Email already registered',
        errorCode: 'ALREADY_REGISTERED',
        loginUrl: `/portal/login?email=${encodeURIComponent(email)}`,
      },
      { status: 409 },
    )
  }

  // Pack the request blurb into the notes column so admin sees it inline.
  const notesParts: string[] = []
  if (brandName) notesParts.push(`Brand: ${brandName}`)
  if (message) notesParts.push(`Message: ${message}`)
  const notes = notesParts.join('\n')

  try {
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'user',
      },
    })
    await addPendingClient(email, name, notes || undefined)

    return NextResponse.json({
      ok: true,
      message:
        'Account created. Sign in with your email and password — your portal will load once an admin approves you.',
    })
  } catch (err: unknown) {
    console.error('[portal/signup]', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Signup failed' },
      { status: 500 },
    )
  }
}
