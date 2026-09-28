import { AiError, type ProviderResult } from '../types'
import { MAX_OUTPUT_TOKENS, ollamaBaseUrl } from '../defaults'
import {
  mergeConsecutive,
  normalizeUsage,
  type ProviderArgs,
} from './shared'

interface OllamaChatResponse {
  choices?: { message?: { content?: string } }[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  error?: { message?: string } | string
}

function formatOllamaSystemPrompt(raw: string): string {
  if (!raw) return ''
  const businessMatch = raw.match(/Business context and instructions:\s*([\s\S]*?)(?=(?:Knowledge base|You are replying|$))/i)
  const knowledgeMatch = raw.match(/Knowledge base[^\n]*\n\n([\s\S]*?)$/i)

  const businessContext = businessMatch ? businessMatch[1].trim() : ''
  const knowledge = knowledgeMatch ? knowledgeMatch[1].trim() : ''

  const lines = [
    'You are a friendly, helpful customer support assistant for our business on WhatsApp.',
    'Directly answer customer questions concisely and politely in the same language they write in.',
    'Never repeat the user\'s question, never say "Okay, I understand", and do not repeat these instructions.',
    'Always reply directly with the answer.',
  ]

  if (businessContext) {
    lines.push(`Business Information:\n${businessContext}`)
  }
  if (knowledge) {
    lines.push(`Reference details:\n${knowledge}`)
  }

  return lines.join('\n\n')
}

function cleanOllamaReply(text: string, userMessage?: string): string {
  let cleaned = text.trim()
  if (userMessage) {
    const trimmedUser = userMessage.trim().toLowerCase()
    if (cleaned.toLowerCase().startsWith(trimmedUser)) {
      cleaned = cleaned.substring(userMessage.trim().length).trim()
    }
  }
  // Strip common preamble patterns that small models spit out when confused:
  cleaned = cleaned.replace(/^(?:Okay,?\s*)?(?:I\s*understand\b[^\.\n]*[\.\n]+)/i, '').trim()
  cleaned = cleaned.replace(/^I will respond to the customer[^\.\n]*[\.\n]+/i, '').trim()
  cleaned = cleaned.replace(/^Sure,?\s*I can help with that[\.!]?\s*/i, '').trim()
  return cleaned || text.trim()
}

export async function generateOllama(args: ProviderArgs): Promise<ProviderResult> {
  const { model, systemPrompt, messages, timeoutMs, apiKey } = args
  const baseUrl = ollamaBaseUrl()
  const endpoint = `${baseUrl}/v1/chat/completions`

  const formattedPrompt = formatOllamaSystemPrompt(systemPrompt)

  let res: Response
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`
    }

    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'gemma3:270m',
        messages: [
          { role: 'system', content: formattedPrompt },
          ...mergeConsecutive(messages),
        ],
        max_tokens: 180,
        temperature: 0.3,
        options: {
          num_ctx: 2048,
          num_predict: 180,
          num_thread: 2,
        },
        keep_alive: '24h',
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err: any) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new AiError(`Ollama took longer than ${Math.round(timeoutMs / 1000)}s to generate a response.`, {
        code: 'timeout',
        status: 504,
      })
    }
    throw new AiError(
      `Could not connect to Ollama at ${baseUrl}. Please ensure Ollama is installed and running on your server (run "ollama run ${model || 'gemma3:270m'}" in your terminal).`,
      { code: 'ollama_unreachable', status: 502 }
    )
  }

  if (!res.ok) {
    let errorDetail = `Ollama HTTP ${res.status}`
    try {
      const errData = await res.json()
      if (typeof errData?.error === 'string') {
        errorDetail = errData.error
      } else if (errData?.error?.message) {
        errorDetail = errData.error.message
      }
    } catch {
      // non-json response
    }
    throw new AiError(`Ollama error: ${errorDetail}`, {
      code: 'ollama_error',
      status: res.status === 404 ? 404 : 502,
    })
  }

  const data = (await res.json().catch(() => null)) as OllamaChatResponse | null
  const rawText = data?.choices?.[0]?.message?.content
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new AiError('Ollama returned an empty response.', {
      code: 'empty_response',
    })
  }

  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content
  const text = cleanOllamaReply(rawText, lastUserMsg)

  const usage = normalizeUsage({
    prompt: data?.usage?.prompt_tokens,
    completion: data?.usage?.completion_tokens,
    total: data?.usage?.total_tokens,
  })

  return { text, usage }
}
