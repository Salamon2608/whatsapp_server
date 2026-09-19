// ============================================================
// Shared types for the AI reply assistant (bring-your-own-key).
//
// Provider-agnostic surface so the playground, auto-reply, and
// manual drafts talk to `generateReply` seamlessly.
// ============================================================

export type AiProvider = 'openai' | 'anthropic'

export interface AiConfigData {
  provider: AiProvider
  model: string
  apiKey: string
  systemPrompt: string | null
  isActive: boolean
  autoReplyEnabled: boolean
  autoReplyMaxPerConversation: number
  handoffAgentId: string | null
  embeddingsApiKey: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ProviderResult {
  text: string
  usage: AiUsage | null
}

export interface GenerateResult {
  text: string
  handoff: boolean
  usage: AiUsage | null
}

export class AiError extends Error {
  readonly code: string
  readonly status: number
  constructor(message: string, opts: { code?: string; status?: number } = {}) {
    super(message)
    this.name = 'AiError'
    this.code = opts.code ?? 'ai_error'
    this.status = opts.status ?? 502
  }
}
