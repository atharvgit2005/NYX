/**
 * Orchestrator for one chat turn on the calendar-builder page.
 *   1. Build the system prompt from BrandConfiguration + BrandKit notes.
 *   2. Pull RAG chunks for the latest user message (cosine search).
 *   3. Pack chat history + RAG into a token budget via DP.
 *   4. Cache check by SHA-256(provider+model+window).
 *   5. Call the provider router; on tool-call response, normalise the
 *      proposeSlots payload so the UI gets a stable shape.
 *
 * Persistence is handled by the API route — this module is pure
 * computation so it stays testable.
 */
import type { BrandConfiguration, BrandPartner } from '@prisma/client'
import { getRouter } from './providers'
import type { ChatTurn } from './providers/types'
import { ALL_TOOLS, normaliseProposedSlots } from './tools'
import { retrieveRelevant } from './rag/embeddings'
import { buildCacheKey, lookup, store } from './cache'
import { estimateTokens, packByBudget, type BudgetItem } from './dsa/token-window'

const WINDOW_TOKEN_BUDGET = 6000

interface BrandKitLite {
  notes: string | null
  audience: string | null
  winners: string | null
}

/** Loose shape of a slot row passed in from the client for grid-aware
 *  prompting. Kept structural (not Prisma-derived) since callers may
 *  send a subset. */
interface SlotSummary {
  index: number
  date: string
  title: string
  contentType: string
  platform: string
}

function buildSystemPrompt(
  partner: BrandPartner,
  config: BrandConfiguration | null,
  kit: BrandKitLite | null,
  currentSlots?: SlotSummary[],
): string {
  const lines = [
    `You are the NYX content-calendar assistant for ${partner.clientName}.`,
    `You help an admin scaffold a publishing calendar that matches this brand's voice and goals.`,
    ``,
    `You have full authority to manipulate the calendar builder grid. Use the available tools:`,
    `- 'proposeSlots': Propose a batch of posts for dates within the campaign window. Keep titles concrete and brand-specific.`,
    `- 'updateCampaignWindow': Adjust the start/end dates of the campaign window. Use this if the user asks you to plan a longer (multiple months) or shorter calendar.`,
    `- 'clearCalendar': Wipe all posts from the grid to start fresh.`,
    `- 'modifySlot': Edit a specific post by its 1-based index (e.g., change its title, date, contentType, or platform).`,
    `- 'deleteSlot': Delete a post by its 1-based index from the grid.`,
    ``,
    `Multiple Months Planning: If the user asks for a multiple-month calendar, you can update the campaign window to span multiple months first, and then propose slots spread across those months. If the number of slots is large, propose a realistic subset or outline them in text first, then ask if you should populate them.`,
    `Mix content types thoughtfully: reels for reach, carousels/static for value, stories for behind-the-scenes.`,
    ``,
    `--- BRAND ---`,
    `Name: ${partner.clientName}`,
    `Slug: ${partner.clientSlug}`,
  ]
  if (config) {
    lines.push(
      `Tagline: ${config.tagline ?? '(none)'}`,
      `Package: ${config.packageType}`,
      `Platforms: ${config.platforms.join(', ')}`,
      `Campaign window: ${config.campaignStart.toISOString().slice(0, 10)} → ${config.campaignEnd.toISOString().slice(0, 10)}`,
      `Instagram: @${config.instagramHandle ?? '(none)'}`,
      `TikTok: @${config.tiktokHandle ?? '(none)'}`,
    )
    if (config.products?.length) lines.push(`Products: ${config.products.join(', ')}`)
    if (config.operations) lines.push(`Operations: ${config.operations}`)
  }
  if (kit?.notes) lines.push(``, `--- BRAND KIT NOTES ---`, kit.notes)
  if (kit?.audience) lines.push(``, `--- AUDIENCE ---`, kit.audience)
  if (kit?.winners) lines.push(``, `--- WHAT WORKED BEFORE ---`, kit.winners)

  if (currentSlots && currentSlots.length > 0) {
    lines.push(
      ``,
      `--- CURRENT CALENDAR GRID SLOTS ---`,
      `The grid currently contains the following slots:`,
      ...currentSlots.map(s => `Slot #${s.index}: [${s.date}] [${s.contentType}] [${s.platform}] "${s.title}"`)
    )
  } else {
    lines.push(``, `--- CURRENT CALENDAR GRID SLOTS ---`, `The grid is currently empty.`)
  }

  return lines.join('\n')
}

export interface ChatRunInput {
  partner: BrandPartner
  config: BrandConfiguration | null
  kit: BrandKitLite | null
  brandKitId: string | null
  /** Full active path of the conversation (oldest → newest). The last
   *  entry is the freshly-submitted user message. */
  history: ChatTurn[]
  currentSlots?: SlotSummary[]
}

export interface ChatRunOutput {
  text: string
  toolName?: string
  toolArgs?: unknown
  rawToolArgs?: unknown
  provider: string
  model: string
  cached: boolean
  promptTokens?: number
  completionTokens?: number
  ragSources?: Array<{ source: string; score: number }>
}

export async function runChatTurn(input: ChatRunInput): Promise<ChatRunOutput> {
  const router = getRouter()
  if (router.available().length === 0) {
    return {
      text:
        'No AI provider is configured. Add GEMINI_API_KEY (recommended, free tier), OPENAI_API_KEY, or ANTHROPIC_API_KEY to your environment.',
      provider: 'none',
      model: 'none',
      cached: false,
    }
  }

  const system = buildSystemPrompt(input.partner, input.config, input.kit, input.currentSlots)

  // ── RAG: pull chunks relevant to the latest user message
  const latestUser = [...input.history].reverse().find((m) => m.role === 'user')?.content ?? ''
  const ragChunks = input.brandKitId
    ? await retrieveRelevant(input.brandKitId, latestUser, 6)
    : []

  // ── Token-DP context window
  const items: BudgetItem[] = []
  // Pin: latest user turn + last assistant turn (recency floor)
  const pinIds = new Set<string>()
  const recentN = 4
  for (let i = input.history.length - 1; i >= 0; i--) {
    const m = input.history[i]
    const id = `h:${i}`
    items.push({
      id,
      tokens: estimateTokens(m.content),
      score: 1 + (input.history.length - i) * 0.1,
      pinned: i >= input.history.length - 2 || i >= input.history.length - recentN,
    })
    if (i >= input.history.length - 2) pinIds.add(id)
  }
  // RAG chunks: score = cosine similarity scaled
  ragChunks.forEach((c, i) => {
    items.push({
      id: `r:${i}`,
      tokens: estimateTokens(c.text),
      score: Math.max(0.01, c.score * 5),
    })
  })
  const packed = packByBudget(items, WINDOW_TOKEN_BUDGET)
  const keep = new Set(packed.selected)

  const messages: ChatTurn[] = []
  // Prepend RAG context as a synthetic "system clarification" user turn —
  // every provider tolerates this and we don't need a separate "context"
  // role across them.
  const keptRag = ragChunks
    .map((c, i) => ({ keep: keep.has(`r:${i}`), c }))
    .filter((x) => x.keep)
    .map((x) => x.c)
  if (keptRag.length > 0) {
    const ctx = keptRag.map((c) => `[${c.source}]\n${c.text}`).join('\n\n')
    messages.push({
      role: 'user',
      content: `[Brand-kit context — use as ground truth when relevant]\n\n${ctx}`,
    })
  }
  input.history.forEach((m, i) => {
    if (!keep.has(`h:${i}`)) return
    messages.push(m)
  })

  // ── Cache check (we don't cache when temperature implies variability,
  //    but for tool-call planning a stable proposal is desirable so we
  //    keep cache enabled).
  const probeProvider = router.available()[0]
  const cacheKey = buildCacheKey(probeProvider.name, probeProvider.model, {
    system,
    messages,
    tools: ALL_TOOLS,
    temperature: 0.4,
  })
  const hit = await lookup(cacheKey)
  if (hit) {
    return {
      text: hit.text,
      toolName: hit.toolName,
      toolArgs: hit.toolName === 'proposeSlots' ? normaliseProposedSlots(hit.toolArgs) : hit.toolArgs,
      rawToolArgs: hit.toolArgs,
      provider: hit.provider,
      model: hit.model,
      cached: true,
      ragSources: keptRag.map((c) => ({ source: c.source, score: c.score })),
    }
  }

  const result = await router.complete({
    system,
    messages,
    tools: ALL_TOOLS,
    temperature: 0.4,
    maxTokens: 2200,
  })

  // store async — never block the response
  store(cacheKey, result).catch(() => {})

  return {
    text: result.text,
    toolName: result.toolName,
    toolArgs:
      result.toolName === 'proposeSlots'
        ? normaliseProposedSlots(result.toolArgs)
        : result.toolArgs,
    rawToolArgs: result.toolArgs,
    provider: result.provider,
    model: result.model,
    cached: false,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    ragSources: keptRag.map((c) => ({ source: c.source, score: c.score })),
  }
}
