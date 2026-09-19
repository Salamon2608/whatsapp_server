import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const automation = await prisma.automation.findFirst({
      where: { id, userId: user.id },
      include: {
        steps: { orderBy: { position: 'asc' } },
        logs: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (!automation) {
      return NextResponse.json({ status: false, message: 'Automation not found' }, { status: 404 })
    }

    return NextResponse.json({ status: true, data: automation })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.automation.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ status: false, message: 'Automation not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, triggerType, triggerConfig, sessionId, steps, isActive } = body

    // Transaction to update automation and replace steps
    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(steps)) {
        await tx.automationStep.deleteMany({ where: { automationId: id } })
      }

      return await tx.automation.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          description: description !== undefined ? description : existing.description,
          triggerType: triggerType ?? existing.triggerType,
          triggerConfig: triggerConfig ?? existing.triggerConfig,
          sessionId: sessionId !== undefined ? sessionId : existing.sessionId,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          ...(Array.isArray(steps)
            ? {
                steps: {
                  create: steps.map((s: any, idx: number) => ({
                    stepType: s.stepType || s.step_type,
                    stepConfig: s.stepConfig || s.step_config || {},
                    position: idx,
                    branch: s.branch || null,
                  })),
                },
              }
            : {}),
        },
        include: {
          steps: { orderBy: { position: 'asc' } },
        },
      })
    })

    return NextResponse.json({ status: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.automation.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ status: false, message: 'Automation not found' }, { status: 404 })
    }

    await prisma.automation.delete({ where: { id } })
    return NextResponse.json({ status: true, message: 'Automation deleted' })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
