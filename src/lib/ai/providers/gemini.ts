/**
 * Gemini provider — the default workhorse for the calendar chatbot.
 * Free tier covers ~15 RPM / 1M TPM on `gemini-2.5-flash` at time of
 * writing, which is plenty for an admin-only feature. Falls back to
 * OpenAI/Anthropic via the router when Gemini 429s.
 *
 * No SDK dependency: we hit the REST endpoint directly to keep the
 * bundle lean and avoid pinning to a fast-moving package.
 */
import type {
  ChatTurn,
  CompleteOptions,
  CompletionResult,
  EmbeddingResult,
  LLMProvider,
  ToolSchema,
} from './types'
import { ProviderUnavailableError } from './types'

const CHAT_MODEL = 'gemini-2.5-flash'
const EMBED_MODEL = 'text-embedding-004'
const EMBED_DIM = 768
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
  functionCall?: { name: string; args: Record<string, unknown> }
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

function turnsToContents(messages: ChatTurn[]): GeminiContent[] {
  // Gemini collapses system into a separate top-level field, so we drop
  // system turns here and reassemble below. Tool turns are encoded as a
  // user turn that quotes the tool name + result text — simplest cross-
  // provider shape that works for our single proposeSlots tool.
  const out: GeminiContent[] = []
  for (const m of messages) {
    if (m.role === 'system') continue
    if (m.role === 'tool') {
      out.push({
        role: 'user',
        parts: [{ text: `[tool:${m.toolName ?? 'unknown'} result]\n${m.content}` }],
      })
      continue
    }
    
    const parts: GeminiPart[] = [{ text: m.content }]
    if (m.media) {
      for (const item of m.media) {
        parts.push({
          inlineData: {
            mimeType: item.mimeType,
            data: item.data,
          },
        })
      }
    }

    out.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    })
  }
  return out
}

function toolsToGemini(tools: ToolSchema[] | undefined) {
  if (!tools || tools.length === 0) return undefined
  return [
    {
      functionDeclarations: tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    },
  ]
}

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini'
  readonly model = CHAT_MODEL
  readonly available: boolean

  private apiKey: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? ''
    this.available = this.apiKey.length > 0
  }

  async complete(opts: CompleteOptions): Promise<CompletionResult> {
    if (!this.available) throw new ProviderUnavailableError(this.name, 'no GEMINI_API_KEY')

    const body = {
      systemInstruction: opts.system ? { role: 'user', parts: [{ text: opts.system }] } : undefined,
      contents: turnsToContents(opts.messages),
      tools: toolsToGemini(opts.tools),
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens ?? 2048,
      },
    }

    const url = `${API_BASE}/models/${CHAT_MODEL}:generateContent?key=${this.apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new ProviderUnavailableError(this.name, `HTTP ${res.status} ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    const candidate = data?.candidates?.[0]
    const parts: GeminiPart[] = candidate?.content?.parts ?? []

    let text = ''
    let toolName: string | undefined
    let toolArgs: unknown
    for (const p of parts) {
      if (p.functionCall) {
        toolName = p.functionCall.name
        toolArgs = p.functionCall.args
      } else if (p.text) {
        text += p.text
      }
    }

    return {
      text: text.trim(),
      toolName,
      toolArgs,
      promptTokens: data?.usageMetadata?.promptTokenCount,
      completionTokens: data?.usageMetadata?.candidatesTokenCount,
      provider: this.name,
      model: this.model,
    }
  }

  async embed(text: string): Promise<EmbeddingResult> {
    if (!this.available) throw new ProviderUnavailableError(this.name, 'no GEMINI_API_KEY')
    const url = `${API_BASE}/models/${EMBED_MODEL}:embedContent?key=${this.apiKey}`
    const body = {
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      throw new ProviderUnavailableError(this.name, `embed HTTP ${res.status} ${err.slice(0, 200)}`)
    }
    const data = await res.json()
    const values: number[] = data?.embedding?.values ?? []
    const vec = new Float32Array(values.length)
    for (let i = 0; i < values.length; i++) vec[i] = values[i]
    return { vector: vec, model: EMBED_MODEL, dim: vec.length || EMBED_DIM }
  }
}
