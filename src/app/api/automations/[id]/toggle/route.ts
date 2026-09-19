import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
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

    const updated = await prisma.automation.update({
      where: { id },
      data: { isActive: !automation.isActive },
    })

    return NextResponse.json({ status: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
