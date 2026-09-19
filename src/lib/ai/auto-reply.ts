import { prisma } from '@/lib/prisma'
import type { WASocket, proto } from '@whiskeysockets/baileys'
import { generateReply } from './generate'
import { buildSystemPrompt } from './defaults'
import { retrieveKnowledge } from './knowledge'
import type { AiConfigData, ChatMessage } from './types'
import { logger } from '@/lib/logger'

export interface AiAutoReplyInput {
  sock: WASocket
  sessionId: string
  userId: string
  remoteJid: string
  messageText: string
  msg: proto.IWebMessageInfo
}

export async function runAiAutoReply(input: AiAutoReplyInput): Promise<boolean> {
  const { sock, sessionId, userId, remoteJid, messageText, msg } = input

  try {
    // 1. Fetch AI Config for the user or session
    const aiConfig = await prisma.aiConfig.findFirst({
      where: {
        userId,
        isActive: true,
        autoReplyEnabled: true,
      },
    })

    if (!aiConfig || !aiConfig.apiKey) {
      return false
    }

    const configData: AiConfigData = {
      provider: (aiConfig.provider as 'openai' | 'anthropic') || 'openai',
      model: aiConfig.model || 'gpt-4o-mini',
      apiKey: aiConfig.apiKey,
      systemPrompt: aiConfig.systemPrompt,
      isActive: aiConfig.isActive,
      autoReplyEnabled: aiConfig.autoReplyEnabled,
      autoReplyMaxPerConversation: aiConfig.autoReplyMaxPerConversation || 10,
      handoffAgentId: aiConfig.handoffAgentId,
      embeddingsApiKey: aiConfig.embeddingsApiKey,
    }

    // 2. Fetch knowledge base excerpts
    const knowledge = await retrieveKnowledge(userId, messageText, 3)

    // 3. Build system prompt & messages
    const systemPrompt = buildSystemPrompt({
      userPrompt: configData.systemPrompt,
      mode: 'auto_reply',
      knowledge,
    })

    const messages: ChatMessage[] = [
      { role: 'user', content: messageText },
    ]

    logger.info('AiAutoReply', `Generating AI reply for ${remoteJid} using ${configData.model}...`)

    const result = await generateReply({
      config: configData,
      systemPrompt,
      messages,
    })

    // 4. Log usage asynchronously
    if (result.usage) {
      prisma.aiUsage.create({
        data: {
          userId,
          sessionId,
          provider: configData.provider,
          model: configData.model,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
        },
      }).catch((e) => logger.error('AiAutoReply', 'Failed to log AI usage', e))
    }

    // 5. Handle handoff or reply
    if (result.handoff || !result.text) {
      logger.info('AiAutoReply', `AI requested handoff for ${remoteJid}`)
      return false
    }

    // Send reply via Baileys
    await sock.sendMessage(remoteJid, { text: result.text }, { quoted: msg as any })
    logger.success('AiAutoReply', `AI reply sent to ${remoteJid}`)
    return true
  } catch (err: any) {
    logger.error('AiAutoReply', `AI auto-reply failed: ${err?.message || err}`)
    return false
  }
}
