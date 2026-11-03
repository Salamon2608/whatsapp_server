import { AiError, type ProviderResult } from '../types'
import { MAX_OUTPUT_TOKENS } from '../defaults'
import {
  mergeConsecutive,
  normalizeUsage,
  providerHttpError,
  toNetworkError,
  type ProviderArgs,
} from './shared'

const NVIDIA_CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

const DEFAULT_MODEL = 'minimaxai/minimax-m3.1-flash'

// ── SSE types ────────────────────────────────────────────────────────────────

interface NvidiaStreamDelta {
  content?: string | null
  // Some NVIDIA thinking models (e.g. Nemotron) also emit reasoning_content;
  // we intentionally skip it — only the final answer goes to WhatsApp.
  reasoning_content?: string | null
}

interface NvidiaStreamChoice {
  delta?: NvidiaStreamDelta
  finish_reason?: string | null
}

interface NvidiaStreamChunk {
  choices?: NvidiaStreamChoice[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

// ── Stream reader ─────────────────────────────────────────────────────────────

/**
 * Consumes the SSE stream from NVIDIA NIM and accumulates only the visible
 * (non-reasoning) text content, plus optional token-usage metadata.
 */
async function readNvidiaStream(
  body: ReadableStream<Uint8Array>,
): Promise<{ text: string; usage: ProviderResult['usage'] }> {
  const decoder = new TextDecoder()
  const reader = body.getReader()
  let text = ''
  let usage: ProviderResult['usage'] = null
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE events are newline-delimited; multiple events may arrive per chunk.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? '' // keep any incomplete trailing line

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue

      let chunk: NvidiaStreamChunk
      try {
        chunk = JSON.parse(payload) as NvidiaStreamChunk
      } catch {
        continue
      }

      for (const choice of chunk.choices ?? []) {
        const content = choice.delta?.content
        if (content != null) text += content
        // reasoning_content is intentionally ignored
      }

      if (chunk.usage) {
        usage = normalizeUsage({
          prompt: chunk.usage.prompt_tokens,
          completion: chunk.usage.completion_tokens,
          total: chunk.usage.total_tokens,
        })
      }
    }
  }

  return { text: text.trim(), usage }
}

// ── Public provider function ──────────────────────────────────────────────────

export async function generateNvidia(args: ProviderArgs): Promise<ProviderResult> {
  const { apiKey, model, systemPrompt, messages, timeoutMs } = args

  if (!apiKey || !apiKey.trim()) {
    throw new AiError(
      'NVIDIA NIM API Key is missing. Please add your "nvapi-..." key in AI Setup.',
      { code: 'missing_api_key', status: 400 },
    )
  }

  let res: Response
  try {
    res = await fetch(NVIDIA_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...mergeConsecutive(messages),
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 1,
        top_p: 0.95,
        seed: 0,
        stream: true,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    throw toNetworkError(err)
  }

  if (!res.ok) {
    throw await providerHttpError('NVIDIA NIM', res)
  }

  if (!res.body) {
    throw new AiError('NVIDIA NIM returned no response body.', { code: 'empty_response' })
  }

  const { text, usage } = await readNvidiaStream(res.body)

  if (!text) {
    throw new AiError('NVIDIA NIM returned an empty response.', { code: 'empty_response' })
  }

  return { text, usage }
}
