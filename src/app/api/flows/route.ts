import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { getFlowTemplate } from '@/lib/flows/templates'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const flows = await prisma.flow.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { nodes: true, runs: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ status: true, data: flows })
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
    const { name, description, triggerType, triggerConfig, sessionId, templateSlug, nodes } = body

    let flowNodes = nodes || []
    let tType = triggerType || 'keyword'
    let tConfig = triggerConfig || { keywords: ['hi', 'hello'] }
    let flowName = name || 'New Flow'
    let flowDesc = description || ''
    let entryNodeId = 'start'

    // If instantiated from template
    if (templateSlug) {
      const tpl = getFlowTemplate(templateSlug)
      if (tpl) {
        flowName = name || tpl.name
        flowDesc = description || tpl.description
        tType = tpl.trigger_type
        tConfig = tpl.trigger_config
        entryNodeId = tpl.entry_node_id
        flowNodes = tpl.nodes
      }
    }

    if (flowNodes.length === 0) {
      flowNodes = [
        {
          node_key: 'start',
          node_type: 'start',
          config: { next_node_key: 'welcome_message' },
          position_x: 0,
          position_y: 0,
        },
        {
          node_key: 'welcome_message',
          node_type: 'send_message',
          config: { text: 'Hello! How can we help you today?', next_node_key: '' },
          position_x: 0,
          position_y: 120,
        },
      ]
    }

    const flow = await prisma.flow.create({
      data: {
        userId: user.id,
        sessionId: sessionId || null,
        name: flowName,
        description: flowDesc || null,
        triggerType: tType,
        triggerConfig: tConfig,
        entryNodeId,
        status: 'draft',
        nodes: {
          create: flowNodes.map((n: any) => ({
            nodeKey: n.node_key || n.nodeKey,
            nodeType: n.node_type || n.nodeType,
            config: n.config || {},
            positionX: n.position_x ?? n.positionX ?? 0,
            positionY: n.position_y ?? n.positionY ?? 0,
          })),
        },
      },
      include: {
        nodes: true,
      },
    })

    return NextResponse.json({ status: true, data: flow })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
