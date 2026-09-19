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
    const flow = await prisma.flow.findFirst({
      where: { id, userId: user.id },
      include: {
        nodes: true,
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!flow) {
      return NextResponse.json({ status: false, message: 'Flow not found' }, { status: 404 })
    }

    return NextResponse.json({ status: true, data: flow })
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
    const existing = await prisma.flow.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ status: false, message: 'Flow not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, triggerType, triggerConfig, entryNodeId, fallbackPolicy, status, nodes } = body

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(nodes)) {
        await tx.flowNode.deleteMany({ where: { flowId: id } })
      }

      return await tx.flow.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          description: description !== undefined ? description : existing.description,
          triggerType: triggerType ?? existing.triggerType,
          triggerConfig: triggerConfig ?? existing.triggerConfig,
          entryNodeId: entryNodeId ?? existing.entryNodeId,
          fallbackPolicy: fallbackPolicy ?? existing.fallbackPolicy,
          status: status ?? existing.status,
          ...(Array.isArray(nodes)
            ? {
                nodes: {
                  create: nodes.map((n: any) => ({
                    nodeKey: n.node_key || n.nodeKey,
                    nodeType: n.node_type || n.nodeType,
                    config: n.config || {},
                    positionX: n.position_x ?? n.positionX ?? 0,
                    positionY: n.position_y ?? n.positionY ?? 0,
                  })),
                },
              }
            : {}),
        },
        include: {
          nodes: true,
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
    const existing = await prisma.flow.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ status: false, message: 'Flow not found' }, { status: 404 })
    }

    await prisma.flow.delete({ where: { id } })
    return NextResponse.json({ status: true, message: 'Flow deleted' })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
