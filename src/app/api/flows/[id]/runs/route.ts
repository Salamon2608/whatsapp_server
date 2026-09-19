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
    })

    if (!flow) {
      return NextResponse.json({ status: false, message: 'Flow not found' }, { status: 404 })
    }

    const runs = await prisma.flowRun.findMany({
      where: { flowId: id },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ status: true, data: runs })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
