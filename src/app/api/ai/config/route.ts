import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { generateReply } from '@/lib/ai/generate'
import { buildSystemPrompt } from '@/lib/ai/defaults'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.aiConfig.findFirst({
      where: { userId: user.id },
    })

    return NextResponse.json({ status: true, data: config })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      provider,
      model,
      apiKey,
      systemPrompt,
      isActive,
      autoReplyEnabled,
      autoReplyMaxPerConversation,
      handoffAgentId,
      embeddingsApiKey,
      testKey,
    } = body

    // Test API key before saving if requested
    if (testKey && apiKey) {
      const testPrompt = buildSystemPrompt({
        userPrompt: 'Test key validity',
        mode: 'draft',
      })
      await generateReply({
        config: {
          provider: provider || 'openai',
          model: model || 'gpt-4o-mini',
          apiKey,
          systemPrompt: null,
          isActive: true,
          autoReplyEnabled: false,
          autoReplyMaxPerConversation: 10,
          handoffAgentId: null,
          embeddingsApiKey: null,
        },
        systemPrompt: testPrompt,
        messages: [{ role: 'user', content: 'Ping' }],
      })
    }

    const existing = await prisma.aiConfig.findFirst({
      where: { userId: user.id },
    })

    let config
    if (existing) {
      config = await prisma.aiConfig.update({
        where: { id: existing.id },
        data: {
          provider: provider ?? existing.provider,
          model: model ?? existing.model,
          apiKey: apiKey ?? existing.apiKey,
          systemPrompt: systemPrompt !== undefined ? systemPrompt : existing.systemPrompt,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          autoReplyEnabled: autoReplyEnabled !== undefined ? autoReplyEnabled : existing.autoReplyEnabled,
          autoReplyMaxPerConversation:
            autoReplyMaxPerConversation !== undefined
              ? autoReplyMaxPerConversation
              : existing.autoReplyMaxPerConversation,
          handoffAgentId: handoffAgentId !== undefined ? handoffAgentId : existing.handoffAgentId,
          embeddingsApiKey: embeddingsApiKey !== undefined ? embeddingsApiKey : existing.embeddingsApiKey,
        },
      })
    } else {
      config = await prisma.aiConfig.create({
        data: {
          userId: user.id,
          provider: provider || 'openai',
          model: model || 'gpt-4o-mini',
          apiKey: apiKey || '',
          systemPrompt: systemPrompt || null,
          isActive: isActive !== undefined ? isActive : true,
          autoReplyEnabled: autoReplyEnabled !== undefined ? autoReplyEnabled : false,
          autoReplyMaxPerConversation: autoReplyMaxPerConversation || 10,
          handoffAgentId: handoffAgentId || null,
          embeddingsApiKey: embeddingsApiKey || null,
        },
      })
    }

    return NextResponse.json({ status: true, data: config })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
