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

    const config = await prisma.chatbotConfig.findFirst({
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
    const { isActive, rules, defaultFallback, handoffKeywords } = body

    const existing = await prisma.chatbotConfig.findFirst({
      where: { userId: user.id },
    })

    let config
    if (existing) {
      config = await prisma.chatbotConfig.update({
        where: { id: existing.id },
        data: {
          isActive: isActive !== undefined ? isActive : existing.isActive,
          rules: rules !== undefined ? rules : existing.rules,
          defaultFallback: defaultFallback !== undefined ? defaultFallback : existing.defaultFallback,
          handoffKeywords: handoffKeywords !== undefined ? handoffKeywords : existing.handoffKeywords,
        },
      })
    } else {
      config = await prisma.chatbotConfig.create({
        data: {
          userId: user.id,
          isActive: isActive !== undefined ? isActive : true,
          rules: rules || [],
          defaultFallback: defaultFallback || null,
          handoffKeywords: handoffKeywords || ['human', 'agent', 'support', 'help'],
        },
      })
    }

    return NextResponse.json({ status: true, data: config })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
