import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import {
  createPost,
  listPostsForAdmin,
  PostValidationError,
  type PostCreateInput,
} from '@/lib/portal/post-mutations'
import { requireAdmin } from '../../_helpers'

async function partnerIdForSlug(slug: string): Promise<string | null> {
  const p = await prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    select: { id: true },
  })
  return p?.id ?? null
}

// GET /api/portal/admin/[clientSlug]/posts?includeArchived=1
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug } = await params
  const partnerId = await partnerIdForSlug(clientSlug)
  if (!partnerId) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const includeArchived = new URL(req.url).searchParams.get('includeArchived') === '1'
  const posts = await listPostsForAdmin(partnerId, includeArchived)
  return NextResponse.json({ posts })
}

// POST /api/portal/admin/[clientSlug]/posts — create
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug } = await params
  const partnerId = await partnerIdForSlug(clientSlug)
  if (!partnerId) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Hashtags can come as array or comma-separated string.
  const hashtags = Array.isArray(body.hashtags)
    ? (body.hashtags as string[]).map((h) => String(h).trim()).filter(Boolean)
    : typeof body.hashtags === 'string'
      ? body.hashtags
          .split(/[,\s]+/)
          .map((h) => h.trim().replace(/^#+/, ''))
          .filter(Boolean)
      : []

  const input: PostCreateInput = {
    title: String(body.title ?? '').trim(),
    scheduledDate: new Date(String(body.scheduledDate ?? '')),
    contentType: (body.contentType ?? 'STATIC_POST') as PostCreateInput['contentType'],
    platform: (body.platform ?? 'INSTAGRAM') as PostCreateInput['platform'],
    caption: String(body.caption ?? ''),
    hashtags,
    visualDirection: String(body.visualDirection ?? ''),
    productionNotes:
      typeof body.productionNotes === 'string' ? body.productionNotes : null,
    thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : null,
  }

  try {
    const post = await createPost(partnerId, input)
    return NextResponse.json({ post })
  } catch (err: unknown) {
    if (err instanceof PostValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[admin/posts POST]', err)
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'Create failed' },
      { status: 500 },
    )
  }
}
