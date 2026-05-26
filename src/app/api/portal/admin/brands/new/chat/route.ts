import { NextResponse } from 'next/server'
import { getRouter } from '@/lib/ai/providers'
import { requireAdmin } from '../../../_helpers'
import type { ChatTurn, ToolSchema } from '@/lib/ai/providers/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const FILL_BRAND_FORM_TOOL: ToolSchema = {
  name: 'fillBrandForm',
  description: 'Suggest values to automatically populate the brand configuration onboarding form based on analyzed guidelines, assets, or user chat.',
  parameters: {
    type: 'object',
    properties: {
      brandName: { type: 'string', description: 'Name of the brand partner.' },
      clientSlug: { type: 'string', description: 'lowercase-hyphenated slug based on brand name.' },
      tagline: { type: 'string', description: 'Short catchy tagline.' },
      primaryColor: { type: 'string', description: 'Hex code for primary brand color (e.g., #E8441A).' },
      secondaryColor: { type: 'string', description: 'Hex code for secondary brand color (e.g., #FFD65B).' },
      accentColor: { type: 'string', description: 'Hex code for accent brand color.' },
      instagramHandle: { type: 'string', description: 'Instagram handle without @.' },
      tiktokHandle: { type: 'string', description: 'TikTok handle without @.' },
      platforms: {
        type: 'array',
        items: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK'] },
        description: 'Target publishing platforms.'
      },
      packageType: { type: 'string', enum: ['TRIAL', 'MONTHLY_RETAINER', 'CUSTOM'] },
      campaignStart: { type: 'string', description: 'Start date in YYYY-MM-DD format.' },
      campaignEnd: { type: 'string', description: 'End date in YYYY-MM-DD format.' }
    }
  }
}

const ALL_TOOLS = [FILL_BRAND_FORM_TOOL]

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
  }

  let body: { history: ChatTurn[]; files?: Array<{ url: string; filename: string; mimeType: string; caption?: string }> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const history = body.history ?? []
  const files = body.files ?? []

  // Build a system prompt instructing the model on how to assist with onboarding
  const system = [
    `You are the NYX Brand Onboarding Assistant.`,
    `Your goal is to help the admin set up a new brand partner's identity, color theme, handles, and campaign package configuration.`,
    `You can analyze guidelines, text files, palettes, or reference assets (provided via file uploads) to suggest the brand details.`,
    ``,
    `Whenever you have enough information or if the user asks you to populate the form, call the 'fillBrandForm' tool with the extracted values.`,
    `Always suggest a professional and cohesive dual-color palette (Primary and Secondary hex codes) that matches the brand identity.`,
    `Suggest reasonable campaign dates if not specified (e.g., starting next Monday and lasting 1-3 months depending on package type).`,
  ].join('\n')

  // Prepare messages with files context prepended if present
  const messages: ChatTurn[] = []
  const mediaItems: Array<{ mimeType: string; data: string }> = []
  const textContexts: string[] = []

  for (const file of files) {
    try {
      const fileRes = await fetch(file.url)
      if (!fileRes.ok) continue

      if (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') {
        const buf = await fileRes.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        mediaItems.push({
          mimeType: file.mimeType,
          data: base64,
        })
      } else if (file.mimeType.startsWith('text/') || file.mimeType === 'text/markdown' || file.mimeType === 'text/plain') {
        const text = await fileRes.text()
        textContexts.push(`[File: ${file.filename}]\n${text}`)
      }
    } catch (e) {
      console.error(`Failed to process onboarding file ${file.filename}:`, e)
    }
  }

  // Prepend text content files as user context turn
  if (textContexts.length > 0) {
    messages.push({
      role: 'user',
      content: `[Attached Brand Guideline Documents - Use these details to suggest configurations]\n\n` + textContexts.join('\n\n')
    })
  }

  // Add the chat history turns
  messages.push(...history)

  // Attach media (images/PDFs) to the latest user message in history
  const hasMedia = mediaItems.length > 0
  if (hasMedia) {
    const latestUserTurn = [...messages].reverse().find(m => m.role === 'user')
    if (latestUserTurn) {
      latestUserTurn.media = mediaItems
    } else {
      messages.push({
        role: 'user',
        content: '[Analyzing uploaded brand kit images/PDFs]',
        media: mediaItems
      })
    }
  }

  try {
    const router = getRouter()
    if (router.available().length === 0) {
      return NextResponse.json({
        text: 'No AI providers available. Ensure GROQ_API_KEY is configured in your environment.',
        provider: 'none',
        model: 'none'
      })
    }

    const geminiProvider = router.available().find(p => p.name === 'gemini')
    let result
    if (hasMedia && geminiProvider) {
      result = await geminiProvider.complete({
        system,
        messages,
        tools: ALL_TOOLS,
        temperature: 0.3,
        maxTokens: 2048
      })
    } else {
      result = await router.complete({
        system,
        messages,
        tools: ALL_TOOLS,
        temperature: 0.3,
        maxTokens: 2048
      })
    }

    return NextResponse.json({
      text: result.text,
      toolName: result.toolName,
      toolArgs: result.toolArgs,
      provider: result.provider,
      model: result.model
    })
  } catch (err: unknown) {
    console.error('[brands/new/chat] router complete failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat completion failed' },
      { status: 500 }
    )
  }
}
