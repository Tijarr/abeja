import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        spaces: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { tasks: { where: { status: 'open' } } } } },
        },
      },
    })
    return NextResponse.json({ domains })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
