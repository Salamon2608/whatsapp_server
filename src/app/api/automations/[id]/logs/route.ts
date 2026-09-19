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
    })

    if (!automation) {
      return NextResponse.json({ status: false, message: 'Automation not found' }, { status: 404 })
    }

    const logs = await prisma.automationLog.findMany({
      where: { automationId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ status: true, data: logs })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
