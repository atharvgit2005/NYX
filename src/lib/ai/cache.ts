/**
 * Two-tier prompt cache.
 *   L1: in-process LRU (Map-iteration trick — Map preserves insertion
 *       order, so a re-insert == bump-to-MRU). Bounded by entry count.
 *   L2: LLMCache table — survives cold starts on serverless, shared
 *       across replicas. TTL enforced on read AND by a cheap sweep.
 *
 * Cache key is SHA-256 of (provider + model + system + messages +
 * tool-schema-version). We hash, not store-raw, so the DB row is small
 * regardless of prompt size and lookups stay index-friendly.
 */
import { createHash } from 'crypto'
import prisma from '@/lib/prismadb'
import type { CompleteOptions, CompletionResult } from './providers/types'

const L1_MAX_ENTRIES = 256
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
const TOOL_SCHEMA_VERSION = 'v1'

interface CachedValue {
  text: string
  toolName?: string
  toolArgs?: unknown
  provider: string
  model: string
  /** Token counts not cached — they relate to the original call only. */
}

const l1 = new Map<string, CachedValue>()

export function buildCacheKey(provider: string, model: string, opts: CompleteOptions): string {
  const payload = JSON.stringify({
    p: provider,
    m: model,
    s: opts.system,
    msgs: opts.messages,
    tools: (opts.tools ?? []).map((t) => t.name + ':' + JSON.stringify(t.parameters)),
    tv: TOOL_SCHEMA_VERSION,
    t: opts.temperature ?? 0.7,
  })
  return createHash('sha256').update(payload).digest('hex')
}

function bumpLRU(key: string, value: CachedValue) {
  if (l1.has(key)) l1.delete(key)
  l1.set(key, value)
  while (l1.size > L1_MAX_ENTRIES) {
    const oldest = l1.keys().next().value
    if (!oldest) break
    l1.delete(oldest)
  }
}

export async function lookup(key: string): Promise<CompletionResult | null> {
  const hot = l1.get(key)
  if (hot) {
    // re-insert to bump MRU position
    l1.delete(key)
    l1.set(key, hot)
    return { ...hot }
  }
  try {
    const row = await prisma.lLMCache.findUnique({ where: { key } })
    if (!row) return null
    if (row.expiresAt.getTime() < Date.now()) {
      // expired — best-effort cleanup; ignore failures
      prisma.lLMCache.delete({ where: { key } }).catch(() => {})
      return null
    }
    let parsed: CachedValue
    try {
      parsed = JSON.parse(row.value) as CachedValue
    } catch {
      return null
    }
    bumpLRU(key, parsed)
    // fire-and-forget hit counter — never block the response on it.
    prisma.lLMCache
      .update({ where: { key }, data: { hits: { increment: 1 } } })
      .catch(() => {})
    return { ...parsed }
  } catch {
    // DB unavailable or table missing — degrade to L1 only, never throw.
    return null
  }
}

export async function store(
  key: string,
  result: CompletionResult,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<void> {
  const value: CachedValue = {
    text: result.text,
    toolName: result.toolName,
    toolArgs: result.toolArgs,
    provider: result.provider,
    model: result.model,
  }
  bumpLRU(key, value)
  const serialised = JSON.stringify(value)
  try {
    await prisma.lLMCache.upsert({
      where: { key },
      create: {
        key,
        provider: result.provider,
        model: result.model,
        value: serialised,
        sizeBytes: Buffer.byteLength(serialised, 'utf8'),
        expiresAt: new Date(Date.now() + ttlMs),
      },
      update: {
        value: serialised,
        sizeBytes: Buffer.byteLength(serialised, 'utf8'),
        expiresAt: new Date(Date.now() + ttlMs),
      },
    })
  } catch {
    // swallow — L1 still benefits future requests in this process.
  }
}

/** Test/debug hook. */
export function _resetL1ForTest() {
  l1.clear()
}
