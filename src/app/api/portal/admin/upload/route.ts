import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '../_helpers'

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
]
const MAX_SIZE = 15 * 1024 * 1024 // 15 MB

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
      { status: 500 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file in form field "file"' }, { status: 400 })
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type}. Use JPEG, PNG, WebP, PDF, TXT, or MD.` },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 15 MB.` },
      { status: 400 },
    )
  }

  // Namespace uploads under portal-onboarding/ to keep them tidy
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const filename = `portal-onboarding/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName || 'upload'}`

  try {
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })
    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (err: unknown) {
    console.error('[admin/upload] put failed:', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Upload failed' },
      { status: 500 },
    )
  }
}
