import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId')

    let config = null
    if (sessionId) {
      config = await prisma.chatbotConfig.findFirst({
        where: { sessionId },
      })
    }

    if (!config) {
      config = await prisma.chatbotConfig.findFirst({
        where: { userId: user.id },
      })
    }

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
    const { isActive, enabled, rules, defaultFallback, fallbackMessage, autoReplyAnyWord, handoffKeywords, sessionId } = body

    let existing = null
    if (sessionId) {
      existing = await prisma.chatbotConfig.findFirst({
        where: { sessionId },
      })
    }

    if (!existing) {
      existing = await prisma.chatbotConfig.findFirst({
        where: { userId: user.id },
      })
    }

    const resolvedActive = isActive !== undefined ? isActive : (enabled !== undefined ? enabled : true)
    const resolvedFallback = defaultFallback !== undefined ? defaultFallback : (fallbackMessage !== undefined ? fallbackMessage : null)

    let config
    if (existing) {
      config = await prisma.chatbotConfig.update({
        where: { id: existing.id },
        data: {
          userId: user.id,
          sessionId: sessionId || existing.sessionId,
          isActive: resolvedActive,
          enabled: resolvedActive,
          autoReplyAnyWord: autoReplyAnyWord !== undefined ? autoReplyAnyWord : existing.autoReplyAnyWord,
          rules: rules !== undefined ? rules : existing.rules,
          defaultFallback: resolvedFallback !== null ? resolvedFallback : existing.defaultFallback,
          fallbackMessage: resolvedFallback !== null ? resolvedFallback : existing.fallbackMessage,
          handoffKeywords: handoffKeywords !== undefined ? handoffKeywords : existing.handoffKeywords,
        },
      })
    } else {
      config = await prisma.chatbotConfig.create({
        data: {
          userId: user.id,
          sessionId: sessionId || null,
          isActive: resolvedActive,
          enabled: resolvedActive,
          autoReplyAnyWord: autoReplyAnyWord !== undefined ? autoReplyAnyWord : false,
          rules: rules || [],
          defaultFallback: resolvedFallback,
          fallbackMessage: resolvedFallback,
          handoffKeywords: handoffKeywords || ['human', 'agent', 'support', 'help'],
        },
      })
    }

    return NextResponse.json({ status: true, data: config })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
