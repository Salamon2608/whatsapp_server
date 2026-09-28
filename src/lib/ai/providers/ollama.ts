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

export async function generateOllama(args: ProviderArgs): Promise<ProviderResult> {
  const { model, systemPrompt, messages, timeoutMs, apiKey } = args
  const baseUrl = ollamaBaseUrl()
  const endpoint = `${baseUrl}/v1/chat/completions`

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
          { role: 'system', content: systemPrompt },
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
  const text = data?.choices?.[0]?.message?.content
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AiError('Ollama returned an empty response.', {
      code: 'empty_response',
    })
  }

  const usage = normalizeUsage({
    prompt: data?.usage?.prompt_tokens,
    completion: data?.usage?.completion_tokens,
    total: data?.usage?.total_tokens,
  })

  return { text, usage }
}
