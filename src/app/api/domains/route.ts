import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true },
    })
    return NextResponse.json({ domains })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
