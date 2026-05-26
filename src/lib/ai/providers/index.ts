/**
 * Provider registry + router. Orders providers Gemini → OpenAI →
 * Anthropic by default (free → paid). A lightweight circuit breaker
 * trips a provider for `BREAKER_COOLDOWN_MS` after consecutive failures
 * so we don't burn latency hammering a dead endpoint.
 *
 * Pattern combo: Strategy (LLMProvider) + Chain-of-Responsibility (router
 * loop) + Circuit Breaker (per-provider trip state).
 */
import type {
  CompleteOptions,
  CompletionResult,
  LLMProvider,
} from './types'
import { ProviderUnavailableError } from './types'
import { GeminiProvider } from './gemini'
import { GroqProvider } from './groq'
import { GrokProvider } from './grok'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

const BREAKER_THRESHOLD = 3
const BREAKER_COOLDOWN_MS = 60_000

interface BreakerState {
  failures: number
  openUntil: number
}

class ProviderRouter {
  private providers: LLMProvider[]
  private breakers = new Map<string, BreakerState>()

  constructor(providers: LLMProvider[]) {
    this.providers = providers
  }

  /** Defensive accessor — useful for /health probes and the chat UI's
   *  "which model answered" badge. */
  available(): LLMProvider[] {
    return this.providers.filter((p) => p.available && !this.isOpen(p.name))
  }

  /** Provider chosen for embeddings — Gemini first since it's free. */
  embedder(): LLMProvider | null {
    return this.providers.find((p) => p.available && typeof p.embed === 'function') ?? null
  }

  private isOpen(name: string): boolean {
    const b = this.breakers.get(name)
    if (!b) return false
    if (Date.now() < b.openUntil) return true
    // cooldown elapsed → half-open, allow one try
    if (b.openUntil > 0) {
      this.breakers.set(name, { failures: 0, openUntil: 0 })
    }
    return false
  }

  private recordFailure(name: string) {
    const b = this.breakers.get(name) ?? { failures: 0, openUntil: 0 }
    const failures = b.failures + 1
    const openUntil = failures >= BREAKER_THRESHOLD ? Date.now() + BREAKER_COOLDOWN_MS : 0
    this.breakers.set(name, { failures, openUntil })
  }

  private recordSuccess(name: string) {
    this.breakers.delete(name)
  }

  async complete(opts: CompleteOptions): Promise<CompletionResult> {
    const errors: string[] = []
    for (const p of this.providers) {
      if (!p.available) continue
      if (this.isOpen(p.name)) {
        errors.push(`${p.name}: breaker open`)
        continue
      }
      try {
        const out = await p.complete(opts)
        this.recordSuccess(p.name)
        return out
      } catch (err) {
        this.recordFailure(p.name)
        errors.push(`${p.name}: ${(err as Error).message}`)
      }
    }
    throw new ProviderUnavailableError(
      'router',
      `all providers failed → ${errors.join(' | ') || 'no providers configured'}`,
    )
  }
}

let cached: ProviderRouter | null = null

export function getRouter(): ProviderRouter {
  if (!cached) {
    // Order matters — earlier providers absorb traffic first. Free /
    // generous-tier providers (Gemini, Grok) lead so we don't burn the
    // paid keys when they aren't needed.
    cached = new ProviderRouter([
      new GroqProvider(),
      new GeminiProvider(),
      new GrokProvider(),
      new OpenAIProvider(),
      new AnthropicProvider(),
    ])
  }
  return cached
}

export type { CompleteOptions, CompletionResult, LLMProvider } from './types'
