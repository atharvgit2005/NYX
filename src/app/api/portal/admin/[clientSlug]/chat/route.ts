/**
 * POST /api/portal/admin/[clientSlug]/chat
 *
 * Body: { sessionId?: string, parentMessageId?: string|null, content: string }
 *
 * Side effects:
 *   - Creates a ChatSession if sessionId is not supplied.
 *   - Appends the user message to the conversation tree.
 *   - Runs the chat orchestrator (RAG + cache + provider router).
 *   - Appends the assistant message and returns the full structured turn.
 *
 * Streaming: we keep this a single JSON response for now — the
 * orchestrator's cache + tool-call path means most responses come back
 * in <2s and SSE adds wiring complexity without a clear UX win for the
 * admin-only surface. The shape is forward-compatible with streaming.
 */
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prismadb'
import { requireAdmin } from '../../_helpers'
import { runChatTurn } from '@/lib/ai/calendar-chat'
import { activePath, latestLeafId, type TreeNode } from '@/lib/ai/dsa/conversation-tree'
import type { ChatTurn } from '@/lib/ai/providers/types'

export const runtime = 'nodejs'
export const maxDuration = 60

async function partnerForSlug(slug: string) {
  return prisma.brandPartner.findUnique({
    where: { clientSlug: slug },
    include: { configuration: true, brandKit: true },
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }
  const { clientSlug } = await params
  const partner = await partnerForSlug(clientSlug)
  if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  let body: {
    sessionId?: string
    parentMessageId?: string | null
    content?: string
    currentSlots?: unknown[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const content = (body.content ?? '').trim()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  // ── Session: reuse or create
  let sessionId = body.sessionId
  if (sessionId) {
    const exists = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { id: true, brandPartnerId: true },
    })
    if (!exists || exists.brandPartnerId !== partner.id) {
      sessionId = undefined
    }
  }
  if (!sessionId) {
    const session = await prisma.chatSession.create({
      data: {
        brandPartnerId: partner.id,
        createdBy: auth.email,
        title: content.slice(0, 60),
      },
      select: { id: true },
    })
    sessionId = session.id
  }

  // ── Build active path from the conversation tree
  const allMessages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      parentId: true,
      role: true,
      content: true,
      toolName: true,
      toolArgs: true,
      createdAt: true,
    },
  })
  const tree: TreeNode[] = allMessages.map((m) => ({
    id: m.id,
    parentId: m.parentId,
    role: m.role as TreeNode['role'],
    content: m.content,
    toolName: m.toolName,
    toolArgs: m.toolArgs,
    createdAt: m.createdAt,
  }))
  const parentId = body.parentMessageId ?? latestLeafId(tree)
  const pathToParent = parentId ? activePath(tree, parentId) : []

  // ── Persist the new user message under the chosen parent
  const userMsg = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: 'user',
      content,
      parentId: parentId ?? null,
    },
    select: { id: true, createdAt: true },
  })

  // ── Compose ChatTurn[] for the orchestrator (path + new user msg)
  const history: ChatTurn[] = [
    ...pathToParent.map((n) => ({
      role: n.role,
      content: n.content,
      toolName: n.toolName ?? undefined,
      toolArgs: n.toolArgs,
    })),
    { role: 'user' as const, content },
  ]

  // ── Run the model and persist assistant turn
  try {
    const result = await runChatTurn({
      partner,
      config: partner.configuration,
      kit: partner.brandKit
        ? {
            notes: partner.brandKit.notes,
            audience: partner.brandKit.audience,
            winners: partner.brandKit.winners,
          }
        : null,
      brandKitId: partner.brandKit?.id ?? null,
      history,
      currentSlots: Array.isArray(body.currentSlots)
        ? body.currentSlots
            .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
            .map((s, i) => ({
              index: typeof s.index === 'number' ? s.index : i + 1,
              date: typeof s.date === 'string' ? s.date : '',
              title: typeof s.title === 'string' ? s.title : '',
              contentType: typeof s.contentType === 'string' ? s.contentType : '',
              platform: typeof s.platform === 'string' ? s.platform : '',
            }))
        : undefined,
    })

    // ── Persist assistant turn
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: result.text,
        parentId: userMsg.id,
        toolName: result.toolName ?? null,
        toolArgs:
          result.rawToolArgs == null
            ? Prisma.JsonNull
            : (result.rawToolArgs as Prisma.InputJsonValue),
        provider: result.provider,
        model: result.model,
        promptTokens: result.promptTokens ?? null,
        completionTokens: result.completionTokens ?? null,
      },
      select: {
        id: true,
        role: true,
        content: true,
        toolName: true,
        toolArgs: true,
        parentId: true,
        provider: true,
        model: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      sessionId,
      userMessage: { id: userMsg.id, role: 'user', content, createdAt: userMsg.createdAt },
      assistantMessage: {
        ...assistantMsg,
        // expose normalised tool args alongside raw, so the UI can render the
        // slot table without parsing again.
        proposeSlots: result.toolName === 'proposeSlots' ? result.toolArgs : undefined,
        ragSources: result.ragSources,
        cached: result.cached,
      },
    })
  } catch (err: unknown) {
    console.error('Chatbot error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An error occurred during the chatbot run' },
      { status: 500 }
    )
  }
}

// GET /api/portal/admin/[clientSlug]/chat?sessionId=...
//   Returns the message tree for the named session, or the most recent
//   session for this brand if no sessionId is given.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientSlug: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }
    const { clientSlug } = await params
    const partner = await prisma.brandPartner.findUnique({
      where: { clientSlug },
      select: { id: true },
    })
    if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const url = new URL(req.url)
    const requestedId = url.searchParams.get('sessionId')
    const session = requestedId
      ? await prisma.chatSession.findFirst({
          where: { id: requestedId, brandPartnerId: partner.id },
          select: { id: true, title: true, createdAt: true },
        })
      : await prisma.chatSession.findFirst({
          where: { brandPartnerId: partner.id },
          orderBy: { updatedAt: 'desc' },
          select: { id: true, title: true, createdAt: true },
        })

    if (!session) {
      return NextResponse.json({ session: null, messages: [] })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ session, messages })
  } catch (err: unknown) {
    console.error('GET chat error:', err)
    return NextResponse.json(
      { error: `Database or server error: ${err instanceof Error ? err.message : 'Unknown'}. Please make sure you ran 'npx prisma db push' to create any new tables.` },
      { status: 500 }
    )
  }
}
