/**
 * Strategy-pattern surface for every LLM provider the chat router can
 * dispatch to. New providers plug in by implementing this interface and
 * registering themselves in providers/index.ts — nothing else changes.
 */

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  /** Tool-call replay context; only set on assistant turns that called a tool. */
  toolName?: string
  toolArgs?: unknown
  /** Base64 media data for multimodal prompts (e.g. image or pdf) */
  media?: Array<{ mimeType: string; data: string }>
}

/** JSON-schema-ish descriptor; we keep it deliberately loose so we can
 *  feed the same schema to Gemini's `responseSchema`, OpenAI's function-
 *  calling args, and Anthropic's tool spec without per-provider casts. */
export interface ToolSchema {
  name: string
  description: string
  /** Top-level should be an object schema with `properties`. */
  parameters: Record<string, unknown>
}

export interface CompleteOptions {
  system: string
  messages: ChatTurn[]
  /** When provided, the provider must return either a textual completion
   *  OR a `{ toolName, toolArgs }` payload matching one of these tools. */
  tools?: ToolSchema[]
  temperature?: number
  maxTokens?: number
  /** Caller-supplied deterministic key; providers MAY ignore. We use it
   *  upstream as the cache key. */
  cacheKey?: string
}

export interface CompletionResult {
  text: string
  toolName?: string
  toolArgs?: unknown
  promptTokens?: number
  completionTokens?: number
  provider: string
  model: string
}

export interface EmbeddingResult {
  vector: Float32Array
  model: string
  dim: number
}

export interface LLMProvider {
  /** Stable name used in logs + cache keys + DB columns. */
  readonly name: string
  /** Active model id (e.g. 'gemini-2.5-flash'). */
  readonly model: string
  /** Whether the provider is configured (API key present). When false,
   *  the router skips this provider in the failover chain. */
  readonly available: boolean
  complete(opts: CompleteOptions): Promise<CompletionResult>
  /** Optional: not every provider does embeddings. */
  embed?(text: string): Promise<EmbeddingResult>
}

export class ProviderUnavailableError extends Error {
  constructor(provider: string, cause?: unknown) {
    super(`Provider "${provider}" unavailable: ${(cause as Error)?.message ?? cause}`)
    this.name = 'ProviderUnavailableError'
  }
}
