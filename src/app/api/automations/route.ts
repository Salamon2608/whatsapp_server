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

    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      include: {
        steps: { orderBy: { position: 'asc' } },
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ status: true, data: automations })
  } catch (error: any) {
    console.error('GET /api/automations error:', error)
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
    const { name, description, triggerType, triggerConfig, sessionId, steps } = body

    if (!name || !triggerType) {
      return NextResponse.json({ status: false, message: 'Name and triggerType are required' }, { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        userId: user.id,
        sessionId: sessionId || null,
        name,
        description: description || null,
        triggerType,
        triggerConfig: triggerConfig || {},
        isActive: true,
        steps: {
          create: (steps || []).map((s: any, idx: number) => ({
            stepType: s.stepType || s.step_type,
            stepConfig: s.stepConfig || s.step_config || {},
            position: idx,
            branch: s.branch || null,
          })),
        },
      },
      include: {
        steps: { orderBy: { position: 'asc' } },
      },
    })

    return NextResponse.json({ status: true, data: automation })
  } catch (error: any) {
    console.error('POST /api/automations error:', error)
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
