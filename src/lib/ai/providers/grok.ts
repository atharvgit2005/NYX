/**
 * Grok (xAI) provider. The xAI Chat Completions endpoint is OpenAI-
 * compatible — same wire format, same tool-call shape — so this is
 * largely a thin reshape of OpenAIProvider with a different base URL
 * and model id. Reads either XAI_API_KEY or GROK_API_KEY so it picks
 * up whichever name you set.
 *
 * Slots into the router chain after Gemini so Grok absorbs traffic
 * when Gemini's free-tier quota gets close.
 */
import type {
  CompleteOptions,
  CompletionResult,
  LLMProvider,
  ToolSchema,
} from './types'
import { ProviderUnavailableError } from './types'

const CHAT_MODEL = 'grok-3-mini'
const API_URL = 'https://api.x.ai/v1/chat/completions'

interface OAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_call_id?: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
}

function toolsToOpenAIShape(tools: ToolSchema[] | undefined) {
  if (!tools || tools.length === 0) return undefined
  return tools.map((t) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }))
}

export class GrokProvider implements LLMProvider {
  readonly name = 'grok'
  readonly model = CHAT_MODEL
  readonly available: boolean

  private apiKey: string

  constructor() {
    // Accept either name — XAI_API_KEY is xAI's official label, but
    // GROK_API_KEY reads more obviously in env files. First match wins.
    this.apiKey = process.env.XAI_API_KEY ?? process.env.GROK_API_KEY ?? ''
    this.available = this.apiKey.length > 0
  }

  async complete(opts: CompleteOptions): Promise<CompletionResult> {
    if (!this.available) {
      throw new ProviderUnavailableError(this.name, 'no XAI_API_KEY / GROK_API_KEY')
    }

    const messages: OAIMessage[] = []
    if (opts.system) messages.push({ role: 'system', content: opts.system })
    for (const m of opts.messages) {
      if (m.role === 'tool') {
        messages.push({
          role: 'tool',
          content: m.content,
          tool_call_id: m.toolName ?? 'call_0',
        })
        continue
      }
      messages.push({ role: m.role, content: m.content })
    }

    const body = {
      model: CHAT_MODEL,
      messages,
      tools: toolsToOpenAIShape(opts.tools),
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2048,
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new ProviderUnavailableError(this.name, `HTTP ${res.status} ${t.slice(0, 200)}`)
    }

    const data = await res.json()
    const choice = data?.choices?.[0]?.message
    const toolCall = choice?.tool_calls?.[0]
    let toolName: string | undefined
    let toolArgs: unknown
    if (toolCall?.function) {
      toolName = toolCall.function.name
      try {
        toolArgs = JSON.parse(toolCall.function.arguments)
      } catch {
        toolArgs = { _raw: toolCall.function.arguments }
      }
    }
    return {
      text: (choice?.content ?? '').trim(),
      toolName,
      toolArgs,
      promptTokens: data?.usage?.prompt_tokens,
      completionTokens: data?.usage?.completion_tokens,
      provider: this.name,
      model: this.model,
    }
  }
}
