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

    const usageLogs = await prisma.aiUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const totals = usageLogs.reduce(
      (acc, log) => ({
        promptTokens: acc.promptTokens + log.promptTokens,
        completionTokens: acc.completionTokens + log.completionTokens,
        totalTokens: acc.totalTokens + log.totalTokens,
        callCount: acc.callCount + 1,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0 }
    )

    return NextResponse.json({
      status: true,
      data: {
        totals,
        recentLogs: usageLogs.slice(0, 20),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
