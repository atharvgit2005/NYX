/**
 * Anthropic provider — last-resort fallback. Higher cost per token than
 * Gemini/OpenAI but lands the hardest reasoning when both others fail.
 * Uses the Messages REST API directly.
 */
import type {
  CompleteOptions,
  CompletionResult,
  LLMProvider,
  ToolSchema,
} from './types'
import { ProviderUnavailableError } from './types'

const CHAT_MODEL = 'claude-haiku-4-5-20251001'
const API_URL = 'https://api.anthropic.com/v1/messages'
const API_VERSION = '2023-06-01'

function toolsToAnthropic(tools: ToolSchema[] | undefined) {
  if (!tools || tools.length === 0) return undefined
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }))
}

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic'
  readonly model = CHAT_MODEL
  readonly available: boolean

  private apiKey: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY ?? ''
    this.available = this.apiKey.length > 0
  }

  async complete(opts: CompleteOptions): Promise<CompletionResult> {
    if (!this.available) throw new ProviderUnavailableError(this.name, 'no ANTHROPIC_API_KEY')

    const messages = opts.messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'user' as const,
            content: [
              {
                type: 'tool_result' as const,
                tool_use_id: m.toolName ?? 'call_0',
                content: m.content,
              },
            ],
          }
        }
        return { role: m.role as 'user' | 'assistant', content: m.content }
      })

    const body = {
      model: CHAT_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
      system: opts.system,
      tools: toolsToAnthropic(opts.tools),
      messages,
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new ProviderUnavailableError(this.name, `HTTP ${res.status} ${t.slice(0, 200)}`)
    }

    const data = await res.json()
    let text = ''
    let toolName: string | undefined
    let toolArgs: unknown
    for (const block of data?.content ?? []) {
      if (block.type === 'text') text += block.text
      else if (block.type === 'tool_use') {
        toolName = block.name
        toolArgs = block.input
      }
    }
    return {
      text: text.trim(),
      toolName,
      toolArgs,
      promptTokens: data?.usage?.input_tokens,
      completionTokens: data?.usage?.output_tokens,
      provider: this.name,
      model: this.model,
    }
  }
}
