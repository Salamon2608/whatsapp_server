import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { generateReply } from '@/lib/ai/generate'
import { buildSystemPrompt } from '@/lib/ai/defaults'
import { retrieveKnowledge } from '@/lib/ai/knowledge'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, userPrompt, provider, model, apiKey } = body

    let resolvedKey = apiKey
    let resolvedProvider = provider || 'openai'
    let resolvedModel = model || 'gpt-4o-mini'
    let resolvedPrompt = userPrompt

    if (!resolvedKey) {
      const config = await prisma.aiConfig.findFirst({
        where: { userId: user.id },
      })
      if (config) {
        resolvedKey = config.apiKey
        resolvedProvider = config.provider
        resolvedModel = config.model
        if (resolvedPrompt === undefined) {
          resolvedPrompt = config.systemPrompt
        }
      }
    }

    if (!resolvedKey) {
      return NextResponse.json(
        { status: false, message: 'Please provide or save an API key in AI Setup.' },
        { status: 400 }
      )
    }

    const lastUserMsg = (messages || []).filter((m: any) => m.role === 'user').pop()?.content || ''
    const knowledge = await retrieveKnowledge(user.id, lastUserMsg, 3)

    const systemPrompt = buildSystemPrompt({
      userPrompt: resolvedPrompt,
      mode: 'draft',
      knowledge,
    })

    const result = await generateReply({
      config: {
        provider: resolvedProvider,
        model: resolvedModel,
        apiKey: resolvedKey,
        systemPrompt: resolvedPrompt,
        isActive: true,
        autoReplyEnabled: false,
        autoReplyMaxPerConversation: 10,
        handoffAgentId: null,
        embeddingsApiKey: null,
      },
      systemPrompt,
      messages: messages || [{ role: 'user', content: 'Hello' }],
    })

    return NextResponse.json({
      status: true,
      data: {
        reply: result.text,
        handoff: result.handoff,
        usage: result.usage,
        retrievedKnowledge: knowledge,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
